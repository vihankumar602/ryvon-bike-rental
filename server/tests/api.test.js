// Integration tests: real Express app + real PostgreSQL (migrations applied). Run with TEST_DATABASE_URL set.
const test = require('node:test');
const assert = require('node:assert/strict');
const { enabled, addDays } = require('./setup');

if (!enabled) {
  test('integration tests skipped: set TEST_DATABASE_URL to a migrated, seeded test database', { skip: true }, () => {});
  return;
}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/db');
const config = require('../src/config');
const { todayString } = require('../src/utils/dates');

const TODAY = todayString(config.timezone);
const d = (n) => addDays(TODAY, n);
const api = () => request(app);
let seq = 0;

async function newUser(overrides = {}) {
  const email = `rider${Date.now()}${seq++}@example.com`;
  const body = { name: 'Test Rider', email, password: 'correct horse battery', ...overrides };
  const res = await api().post('/api/auth/register').send(body);
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return { token: res.body.data.token, user: res.body.data.user, email: body.email, password: body.password };
}
const auth = (u) => ({ Authorization: `Bearer ${u.token}` });
const bookingBody = (o = {}) => ({
  bikeId: 'scrambler400x', startDate: d(10), endDate: d(13), pickupHub: 'Manali Base Hub',
  pickupTime: '09:00 AM', paymentMode: 'Instant UPI', extras: ['helmet'], ...o,
});
const book = (u, o) => api().post('/api/bookings').set(auth(u)).send(bookingBody(o));

test.before(async () => {
  for (const b of require('../prisma/data/bikes.json')) await prisma.bike.upsert({ where: { id: b.id }, create: b, update: b });
  for (const e of require('../prisma/data/extras.json')) await prisma.rentalExtra.upsert({ where: { id: e.id }, create: e, update: e });
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
});
test.after(async () => {
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

test('health: reports database up', async () => {
  const res = await api().get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.database, 'up');
});

test('auth: register validates input and never returns or stores a plaintext password', async () => {
  for (const bad of [
    { password: 'short' }, { email: 'not-an-email' }, { name: 'x' }, { password: 'a'.repeat(73) }, { phone: 'abc' },
  ]) {
    const res = await api().post('/api/auth/register').send({ name: 'Ok Name', email: 'a@b.co', password: 'longenough1', ...bad });
    assert.equal(res.status, 400, JSON.stringify(bad));
    assert.equal(res.body.error.code, 'BAD_REQUEST');
  }
  const u = await newUser({ email: `Mixed.Case${Date.now()}@Example.com` });
  assert.ok(u.token);
  assert.equal(u.user.passwordHash, undefined);
  assert.equal(JSON.stringify(u.user).includes('password'), false);
  const row = await prisma.user.findUnique({ where: { id: u.user.id } });
  assert.match(row.passwordHash, /^\$2[aby]\$/);
  assert.notEqual(row.passwordHash, u.password);
  assert.equal(row.email, u.email.toLowerCase());
});

test('auth: duplicate email (any letter case) -> 409', async () => {
  const u = await newUser();
  const res = await api().post('/api/auth/register').send({ name: 'Dup', email: u.email.toUpperCase(), password: 'another-pass-1' });
  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, 'EMAIL_TAKEN');
});

test('auth: login success and identical generic failure for wrong password / unknown email', async () => {
  const u = await newUser();
  const ok = await api().post('/api/auth/login').send({ email: u.email.toUpperCase(), password: u.password });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.data.token);
  const wrong = await api().post('/api/auth/login').send({ email: u.email, password: 'wrong-password' });
  const unknown = await api().post('/api/auth/login').send({ email: 'nobody@example.com', password: 'wrong-password' });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.deepEqual(wrong.body, unknown.body);
});

test('auth: protected routes reject missing, malformed, tampered, expired, alg=none and unknown-user tokens', async () => {
  const u = await newUser();
  assert.equal((await api().get('/api/auth/me')).status, 401);
  assert.equal((await api().get('/api/auth/me').set('Authorization', 'Bearer garbage')).status, 401);
  assert.equal((await api().get('/api/auth/me').set('Authorization', `Bearer ${u.token}x`)).status, 401);
  assert.equal((await api().get('/api/auth/me').set('Authorization', `Basic ${u.token}`)).status, 401);
  const expired = jwt.sign({ sub: u.user.id }, config.jwtSecret, { expiresIn: -10 });
  assert.equal((await api().get('/api/auth/me').set('Authorization', `Bearer ${expired}`)).status, 401);
  const wrongKey = jwt.sign({ sub: u.user.id }, 'x'.repeat(40));
  assert.equal((await api().get('/api/auth/me').set('Authorization', `Bearer ${wrongKey}`)).status, 401);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const none = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: u.user.id })}.`;
  assert.equal((await api().get('/api/auth/me').set('Authorization', `Bearer ${none}`)).status, 401);
  const ghost = jwt.sign({ sub: '00000000-0000-4000-8000-000000000000' }, config.jwtSecret);
  assert.equal((await api().get('/api/auth/me').set('Authorization', `Bearer ${ghost}`)).status, 401);
  const me = await api().get('/api/auth/me').set(auth(u));
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, u.email);
});

test('profile: only whitelisted fields can change (no email/password/id mass-assignment)', async () => {
  const u = await newUser();
  const res = await api().patch('/api/users/me').set(auth(u))
    .send({ name: 'New Name', phone: '+91 98765 43210', email: 'hijack@example.com', passwordHash: 'x', id: '1' });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.name, 'New Name');
  assert.equal(res.body.data.user.email, u.email);
  assert.equal(res.body.data.user.id, u.user.id);
  assert.equal((await api().patch('/api/users/me').set(auth(u)).send({})).status, 400);
  assert.equal((await api().patch('/api/users/me').send({ name: 'No Auth' })).status, 401);
});

test('bikes: list (frontend field names), filters, detail, 404', async () => {
  const all = await api().get('/api/bikes');
  assert.equal(all.status, 200);
  assert.equal(all.body.meta.total, 34);
  const b = all.body.data.find((x) => x.id === 'scrambler400x');
  assert.equal(b.price, 1649);
  assert.equal(b.deposit, 4000);
  assert.equal(typeof b.rating, 'string');
  assert.ok(b.dna && b.stars && b.imgFile);
  const scooters = await api().get('/api/bikes?type=scooter&sort=price_asc');
  assert.ok(scooters.body.data.length > 0 && scooters.body.data.every((x) => x.type === 'Scooter'));
  const prices = scooters.body.data.map((x) => x.price);
  assert.deepEqual(prices, [...prices].sort((a, b2) => a - b2));
  assert.equal((await api().get('/api/bikes?search=ktm')).body.data.every((x) => /ktm/i.test(x.name + x.brand)), true);
  assert.equal((await api().get('/api/bikes?limit=0')).status, 400);
  assert.equal((await api().get('/api/bikes/scrambler400x')).body.data.name, 'Triumph Scrambler 400X');
  assert.equal((await api().get('/api/bikes/nope')).status, 404);
});

test('quote: server computes price; client-supplied amounts are ignored', async () => {
  const res = await api().post('/api/bookings/quote')
    .send({ bikeId: 'scrambler400x', startDate: d(5), endDate: d(8), extras: ['insurance'], total: 1, price: 1 });
  assert.equal(res.status, 200);
  const p = res.body.data.price;
  assert.equal(p.rentalAmount, 4947);
  assert.equal(p.extrasAmount, 199 * 3);
  assert.equal(p.gstAmount, Math.round((4947 + 597 + 149) * 0.18));
  assert.equal(p.totalAmount, 4947 + 597 + 149 + p.gstAmount);
  assert.equal(res.body.data.available, true);
  const coupon = await api().post('/api/bookings/quote').send({ bikeId: 'scrambler400x', startDate: d(5), endDate: d(8), couponCode: 'wander20' });
  assert.equal(coupon.body.data.price.discountAmount, Math.round(4947 * 0.2));
  const bad = await api().post('/api/bookings/quote').send({ bikeId: 'scrambler400x', startDate: d(5), endDate: d(8), couponCode: 'NOPE' });
  assert.equal(bad.status, 400);
});

test('booking create: stores server-computed price, snapshot extras, PENDING payment; 401 without token', async () => {
  const u = await newUser();
  assert.equal((await api().post('/api/bookings').send(bookingBody())).status, 401);
  const res = await api().post('/api/bookings').set(auth(u))
    .send({ ...bookingBody({ startDate: d(20), endDate: d(22), extras: ['insurance', 'jacket'] }), total: 1, totalAmount: 1, status: 'Completed', userId: 'x' });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  const b = res.body.data.booking;
  assert.match(b.id, /^RDS-\d{4}-\d{6}$/);
  assert.equal(b.status, 'Upcoming');
  assert.equal(b.duration, 2);
  assert.equal(b.rental, 3298);
  assert.equal(b.extrasTotal, (199 + 249) * 2);
  assert.equal(b.total, 3298 + 896 + 149 + Math.round((3298 + 896 + 149) * 0.18));
  assert.equal(b.paymentStatus, 'PENDING');
  assert.deepEqual(b.extras.map((e) => e.id).sort(), ['helmet', 'insurance', 'jacket']);
  assert.equal(b.bikeName, 'Triumph Scrambler 400X');
  assert.equal(b.startDate, d(20));
  const row = await prisma.booking.findUnique({ where: { id: b.id } });
  assert.equal(row.userId, u.user.id);
});

test('booking create: input and business-rule validation', async () => {
  const u = await newUser();
  const cases = [
    [{ startDate: d(-1), endDate: d(2) }, 400, 'past pickup'],
    [{ startDate: d(8), endDate: d(7) }, 400, 'return before pickup'],
    [{ startDate: '2026-02-31', endDate: '2026-03-02' }, 400, 'impossible date'],
    [{ startDate: d(40), endDate: d(40 + config.maxBookingDays + 1) }, 400, 'too long'],
    [{ bikeId: 'does-not-exist' }, 404, 'unknown bike'],
    [{ extras: ['teleporter'] }, 400, 'unknown extra'],
    [{ couponCode: 'FREE100' }, 400, 'bad coupon'],
    [{ pickupTime: '03:33 AM' }, 400, 'bad slot'],
    [{ paymentMode: 'Bitcoin' }, 400, 'bad payment mode'],
    [{ pickupHub: '' }, 400, 'empty hub'],
  ];
  for (const [override, status, label] of cases) {
    const res = await book(u, override);
    assert.equal(res.status, status, `${label}: ${JSON.stringify(res.body)}`);
  }
  assert.equal((await prisma.booking.count({ where: { userId: u.user.id } })), 0, 'rejected requests must not create rows');
  const sameDay = await book(u, { startDate: d(30), endDate: d(30) });
  assert.equal(sameDay.status, 201);
  assert.equal(sameDay.body.data.booking.duration, 1);
});

test('overlap: every overlapping shape is rejected, adjacent days and other bikes are allowed', async () => {
  const a = await newUser();
  const bike = 'ktmadv390';
  assert.equal((await book(a, { bikeId: bike, startDate: d(50), endDate: d(55) })).status, 201);
  const reject = [[50, 55], [52, 53], [48, 50], [55, 58], [49, 56], [50, 50], [55, 55]];
  for (const [s, e] of reject) {
    const res = await book(await newUser(), { bikeId: bike, startDate: d(s), endDate: d(e) });
    assert.equal(res.status, 409, `[${s},${e}] should conflict`);
    assert.equal(res.body.error.code, 'BIKE_NOT_AVAILABLE');
  }
  assert.equal((await book(a, { bikeId: bike, startDate: d(56), endDate: d(58) })).status, 201, 'day after end is free');
  assert.equal((await book(a, { bikeId: bike, startDate: d(45), endDate: d(49) })).status, 201, 'day before start is free');
  assert.equal((await book(a, { bikeId: 'duke', startDate: d(50), endDate: d(55) })).status, 201, 'other bike is free');
  const av = await api().get(`/api/bikes/${bike}/availability?start=${d(52)}&end=${d(53)}`);
  assert.deepEqual([av.body.data.available, av.body.data.reason], [false, 'ALREADY_BOOKED']);
  const free = await api().get(`/api/bikes/${bike}/availability?start=${d(70)}&end=${d(71)}`);
  assert.equal(free.body.data.available, true);
  assert.equal((await api().get(`/api/bikes/${bike}/availability?start=bad&end=${d(71)}`)).status, 400);
});

test('overlap: a bike flagged unavailable cannot be booked', async () => {
  const u = await newUser();
  await prisma.bike.update({ where: { id: 'meteor' }, data: { available: false } });
  try {
    const res = await book(u, { bikeId: 'meteor', startDate: d(60), endDate: d(61) });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'BIKE_UNAVAILABLE');
  } finally {
    await prisma.bike.update({ where: { id: 'meteor' }, data: { available: true } });
  }
});

test('CONCURRENCY: 15 simultaneous identical requests -> exactly one booking is created', async () => {
  const users = await Promise.all(Array.from({ length: 15 }, () => newUser()));
  const results = await Promise.all(users.map((u) => book(u, { bikeId: 'vstrom250', startDate: d(80), endDate: d(83) })));
  const codes = results.map((r) => r.status).sort();
  assert.equal(codes.filter((c) => c === 201).length, 1, `statuses: ${codes}`);
  assert.equal(codes.filter((c) => c === 409).length, 14, `statuses: ${codes}`);
  assert.equal(await prisma.booking.count({ where: { bikeId: 'vstrom250', startDate: new Date(`${d(80)}T00:00:00Z`) } }), 1);
});

test('CONCURRENCY: 20 simultaneous overlapping-but-different ranges never leave overlapping rows', async () => {
  const users = await Promise.all(Array.from({ length: 20 }, () => newUser()));
  const results = await Promise.all(users.map((u, i) => book(u, { bikeId: 'trident', startDate: d(100 + i), endDate: d(102 + i) })));
  assert.ok(results.every((r) => r.status === 201 || r.status === 409), results.map((r) => r.status).join());
  assert.ok(results.some((r) => r.status === 201));
  const overlaps = await prisma.$queryRaw`
    SELECT a.id AS a, b.id AS b FROM bookings a JOIN bookings b
      ON a."bikeId" = b."bikeId" AND a.id < b.id AND a.status = 'CONFIRMED' AND b.status = 'CONFIRMED'
     AND a."startDate" <= b."endDate" AND b."startDate" <= a."endDate"
    WHERE a."bikeId" = 'trident'`;
  assert.deepEqual(overlaps, []);
});

test('CONCURRENCY: simultaneous cancel + rebook never double-books', async () => {
  const owner = await newUser();
  const created = await book(owner, { bikeId: 'aerox', startDate: d(130), endDate: d(133) });
  assert.equal(created.status, 201);
  const rivals = await Promise.all(Array.from({ length: 6 }, () => newUser()));
  const [cancel, ...rebooks] = await Promise.all([
    api().patch(`/api/bookings/${created.body.data.booking.id}/cancel`).set(auth(owner)),
    ...rivals.map((u) => book(u, { bikeId: 'aerox', startDate: d(130), endDate: d(133) })),
  ]);
  assert.equal(cancel.status, 200);
  assert.ok(rebooks.filter((r) => r.status === 201).length <= 1);
  assert.equal(await prisma.booking.count({ where: { bikeId: 'aerox', status: 'CONFIRMED' } }) <= 1, true);
});

test('cancel: owner can cancel, dates are freed, double cancel is 409', async () => {
  const u = await newUser();
  const created = (await book(u, { bikeId: 'himalayan', startDate: d(140), endDate: d(142) })).body.data.booking;
  const other = await newUser();
  assert.equal((await book(other, { bikeId: 'himalayan', startDate: d(140), endDate: d(142) })).status, 409);
  const res = await api().patch(`/api/bookings/${created.id}/cancel`).set(auth(u));
  assert.equal(res.status, 200);
  assert.equal(res.body.data.booking.status, 'Cancelled');
  assert.ok(res.body.data.booking.cancelledAt);
  assert.equal((await book(other, { bikeId: 'himalayan', startDate: d(140), endDate: d(142) })).status, 201);
  const again = await api().patch(`/api/bookings/${created.id}/cancel`).set(auth(u));
  assert.equal(again.status, 409);
  assert.equal(again.body.error.code, 'ALREADY_CANCELLED');
});

test('cancel: bookings that already started cannot be cancelled', async () => {
  const u = await newUser();
  const res = await book(u, { bikeId: 'duke', startDate: TODAY, endDate: d(1) });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.booking.status, 'Active');
  const cancel = await api().patch(`/api/bookings/${res.body.data.booking.id}/cancel`).set(auth(u));
  assert.equal(cancel.status, 409);
  assert.equal(cancel.body.error.code, 'CANNOT_CANCEL');
});

test('authorization: users cannot read or cancel each other\'s bookings; history is per-user', async () => {
  const a = await newUser();
  const b = await newUser();
  const created = (await book(a, { bikeId: 'ducati', startDate: d(150), endDate: d(151) })).body.data.booking;
  assert.equal((await api().get(`/api/bookings/${created.id}`).set(auth(b))).status, 404);
  assert.equal((await api().patch(`/api/bookings/${created.id}/cancel`).set(auth(b))).status, 404);
  assert.equal((await api().get(`/api/bookings/${created.id}`).set(auth(a))).status, 200);
  assert.equal((await api().get('/api/bookings').set(auth(b))).body.data.length, 0);
  assert.equal((await api().get('/api/bookings')).status, 401);
  assert.equal((await api().get('/api/bookings/not-an-id').set(auth(a))).status, 400);
  assert.equal((await api().get('/api/bookings/RDS-2026-000000').set(auth(a))).status, 404);
  const still = await prisma.booking.findUnique({ where: { id: created.id } });
  assert.equal(still.status, 'CONFIRMED');
});

test('history: newest first, status filters (Upcoming/Active/Completed/Cancelled), pagination', async () => {
  const u = await newUser();
  const bike = 'iron883';
  const upcoming = (await book(u, { bikeId: bike, startDate: d(160), endDate: d(161) })).body.data.booking;
  const toCancel = (await book(u, { bikeId: bike, startDate: d(170), endDate: d(171) })).body.data.booking;
  await api().patch(`/api/bookings/${toCancel.id}/cancel`).set(auth(u));
  const active = (await book(u, { bikeId: bike, startDate: TODAY, endDate: d(1) })).body.data.booking;
  const bikeRow = await prisma.bike.findUnique({ where: { id: bike } });
  const past = await prisma.booking.create({
    data: {
      id: 'RDS-2020-111111', userId: u.user.id, bikeId: bike, startDate: new Date('2020-01-01T00:00:00Z'),
      endDate: new Date('2020-01-02T00:00:00Z'), days: 1, pickupTime: '09:00 AM', pickupHub: 'Delhi City Hub',
      dailyRate: bikeRow.pricePerDay, rentalAmount: 1, extrasAmount: 0, serviceFee: 149, gstAmount: 1, totalAmount: 1,
      depositAmount: 1, extras: [], paymentMode: 'Instant UPI',
    },
  });
  const list = await api().get('/api/bookings').set(auth(u));
  assert.equal(list.body.meta.total, 4);
  const byStatus = async (s) => (await api().get(`/api/bookings?status=${s}`).set(auth(u))).body.data.map((x) => x.id);
  assert.deepEqual(await byStatus('Upcoming'), [upcoming.id]);
  assert.deepEqual(await byStatus('Active'), [active.id]);
  assert.deepEqual(await byStatus('Completed'), [past.id]);
  assert.deepEqual(await byStatus('Cancelled'), [toCancel.id]);
  assert.equal((await api().get('/api/bookings?status=Bogus').set(auth(u))).status, 400);
  const page = await api().get('/api/bookings?limit=2&offset=0').set(auth(u));
  assert.equal(page.body.data.length, 2);
  assert.equal(page.body.meta.total, 4);
  const past2 = (await api().get(`/api/bookings/${past.id}`).set(auth(u))).body.data.booking;
  assert.equal(past2.status, 'Completed');
});

test('database constraints hold even when the app is bypassed (raw SQL)', async () => {
  const u = await newUser();
  const created = (await book(u, { bikeId: 'supermeteor', startDate: d(180), endDate: d(183) })).body.data.booking;
  await assert.rejects(
    prisma.$executeRaw`INSERT INTO bookings (id,"userId","bikeId","startDate","endDate",days,"pickupTime","pickupHub","dailyRate","rentalAmount","extrasAmount","serviceFee","gstAmount","totalAmount","depositAmount",extras,"paymentMode","updatedAt")
      VALUES ('RDS-2026-999999', ${u.user.id}::uuid, 'supermeteor', ${d(182)}::date, ${d(184)}::date, 2,'09:00 AM','x',1,1,0,1,1,1,1,'[]','Instant UPI',now())`,
    /bookings_no_overlap|exclusion|23P01/i,
  );
  await assert.rejects(
    prisma.$executeRaw`INSERT INTO bookings (id,"userId","bikeId","startDate","endDate",days,"pickupTime","pickupHub","dailyRate","rentalAmount","extrasAmount","serviceFee","gstAmount","totalAmount","depositAmount",extras,"paymentMode","updatedAt")
      VALUES ('RDS-2026-999998', ${u.user.id}::uuid, 'duke', ${d(200)}::date, ${d(199)}::date, 1,'09:00 AM','x',1,1,0,1,1,1,1,'[]','Instant UPI',now())`,
    /bookings_dates_valid|check/i,
  );
  assert.ok(created.id);
});

test('errors: invalid JSON -> 400, unknown API route -> JSON 404, no stack traces or secrets in error bodies', async () => {
  const bad = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{"email": ');
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error.code, 'BAD_REQUEST');
  const missing = await api().get('/api/nope');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'NOT_FOUND');
  const big = await api().post('/api/auth/login').send({ email: 'a@b.co', password: 'x'.repeat(60000) });
  assert.equal(big.status, 413);
  for (const r of [bad, missing, big]) {
    const text = JSON.stringify(r.body);
    assert.equal(/at .*\(.*:\d+:\d+\)|node_modules|DATABASE_URL|JWT_SECRET/.test(text), false);
  }
});
