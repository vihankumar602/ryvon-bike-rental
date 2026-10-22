const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

async function runE2EJourney() {
  console.log('====================================================');
  console.log('🚀 RYVON FULL END-TO-END USER JOURNEY VERIFICATION');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testEmail = `e2e_rider_${timestamp}@ryvon-test.com`;
  const testPassword = 'Password123!';
  const testName = 'E2E Test Rider';
  let authToken = null;
  let testUserId = null;
  let testBookingId = null;

  try {
    // Step 1: Health check
    console.log('Step 1: Testing Health Endpoint (/api/health)...');
    const healthRes = await request(app).get('/api/health');
    const healthData = healthRes.body.data || healthRes.body;
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error(`Health check failed: ${healthRes.status} ${JSON.stringify(healthRes.body)}`);
    }
    console.log(`  ✓ Health check passed: status=${healthData.status}, db=${healthData.database}`);

    // Step 2: Register user
    console.log('\nStep 2: Testing Registration (/api/auth/register)...');
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: testName, email: testEmail, password: testPassword });
    if (regRes.status !== 201 || !regRes.body.data.token) {
      throw new Error(`Registration failed: ${regRes.status} ${JSON.stringify(regRes.body)}`);
    }
    authToken = regRes.body.data.token;
    testUserId = regRes.body.data.user.id;
    console.log(`  ✓ Registered user "${regRes.body.data.user.name}" (ID: ${testUserId})`);
    console.log(`  ✓ Received JWT token (${authToken.slice(0, 20)}...)`);

    // Step 3: Login user
    console.log('\nStep 3: Testing Login (/api/auth/login)...');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    if (loginRes.status !== 200 || !loginRes.body.data.token) {
      throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
    }
    authToken = loginRes.body.data.token;
    console.log(`  ✓ Login successful for ${testEmail}`);

    // Step 4: Profile Update
    console.log('\nStep 4: Testing Profile Update (/api/users/me)...');
    const profileRes = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ phone: '+91 99999 88888', licenseNumber: 'KA-01-2026-9999' });
    if (profileRes.status !== 200 || profileRes.body.data.user.phone !== '+91 99999 88888') {
      throw new Error(`Profile update failed: ${profileRes.status} ${JSON.stringify(profileRes.body)}`);
    }
    console.log(`  ✓ Profile updated: phone=${profileRes.body.data.user.phone}, license=${profileRes.body.data.user.licenseNumber}`);

    // Step 5: Bike Listing
    console.log('\nStep 5: Testing Bike Catalog Listing (/api/bikes)...');
    const bikesRes = await request(app).get('/api/bikes?limit=5');
    if (bikesRes.status !== 200 || !Array.isArray(bikesRes.body.data) || bikesRes.body.data.length === 0) {
      throw new Error(`Bike listing failed: ${bikesRes.status} ${JSON.stringify(bikesRes.body)}`);
    }
    console.log(`  ✓ Fetched bikes: total in database=${bikesRes.body.meta.total}, returned=${bikesRes.body.data.length}`);

    // Step 6: Single Bike Details
    console.log('\nStep 6: Testing Bike Details (/api/bikes/scrambler400x)...');
    const bikeRes = await request(app).get('/api/bikes/scrambler400x');
    if (bikeRes.status !== 200 || bikeRes.body.data.id !== 'scrambler400x') {
      throw new Error(`Bike details failed: ${bikeRes.status}`);
    }
    console.log(`  ✓ Bike details confirmed: ${bikeRes.body.data.name} (₹${bikeRes.body.data.price}/day)`);

    // Step 7: Availability Check before booking
    const startDate = '2027-09-10';
    const endDate = '2027-09-13';
    console.log(`\nStep 7: Testing Availability Check (/api/bikes/scrambler400x/availability?start=${startDate}&end=${endDate})...`);
    const availRes1 = await request(app)
      .get(`/api/bikes/scrambler400x/availability?start=${startDate}&end=${endDate}`);
    if (availRes1.status !== 200 || availRes1.body.data.available !== true) {
      throw new Error(`Initial availability check failed: ${availRes1.status} ${JSON.stringify(availRes1.body)}`);
    }
    console.log(`  ✓ Bike is available for dates ${startDate} to ${endDate}`);

    // Step 8: Create Booking
    console.log('\nStep 8: Testing Booking Creation (/api/bookings)...');
    const bookingPayload = {
      bikeId: 'scrambler400x',
      startDate: startDate,
      endDate: endDate,
      pickupHub: 'Manali Base Hub',
      pickupTime: '09:00 AM',
      destination: 'Spiti Valley Circuit',
      source: 'RYVON E2E Test',
      paymentMode: 'Instant UPI',
      extras: ['insurance', 'luggage'],
      couponCode: 'WANDER20'
    };
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bookingPayload);
    if (bookRes.status !== 201 || !bookRes.body.data.booking) {
      throw new Error(`Booking creation failed: ${bookRes.status} ${JSON.stringify(bookRes.body)}`);
    }
    const createdBooking = bookRes.body.data.booking;
    testBookingId = createdBooking.id;
    console.log(`  ✓ Booking created: ID #${testBookingId}`);
    console.log(`    - Duration: ${createdBooking.duration} days`);
    console.log(`    - Daily Rate: ₹${createdBooking.dailyRate}`);
    console.log(`    - Rental Amount: ₹${createdBooking.rental}`);
    console.log(`    - Discount (WANDER20): -₹${createdBooking.discount}`);
    console.log(`    - Extras Total: ₹${createdBooking.extrasTotal}`);
    console.log(`    - Total Amount: ₹${createdBooking.total}`);
    console.log(`    - Status: ${createdBooking.status}`);

    // Step 9: Verify direct write to PostgreSQL
    console.log('\nStep 9: Directly Verifying Record in PostgreSQL via Prisma...');
    const dbRecord = await prisma.booking.findUnique({
      where: { id: testBookingId },
      include: { bike: true, user: true }
    });
    if (!dbRecord) {
      throw new Error(`Booking ${testBookingId} was NOT found in PostgreSQL database!`);
    }
    console.log(`  ✓ Verified in PostgreSQL:`);
    console.log(`    - DB Record ID: ${dbRecord.id}`);
    console.log(`    - User in DB: ${dbRecord.user.email}`);
    console.log(`    - Bike in DB: ${dbRecord.bike.name}`);
    console.log(`    - DB Status: ${dbRecord.status}`);
    console.log(`    - Total in DB: ₹${dbRecord.totalAmount}`);

    // Step 10: Verify Overlap Prevention (Concurrency / GiST Exclusion Lock)
    console.log('\nStep 10: Testing Overlap Protection (GiST Constraint)...');
    const overlapRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bikeId: 'scrambler400x',
        startDate: '2027-09-11', // Overlaps with 2027-09-10..2027-09-13
        endDate: '2027-09-12',
        pickupHub: 'Manali Base Hub',
        pickupTime: '09:00 AM',
        paymentMode: 'Instant UPI'
      });
    if (overlapRes.status !== 409 || overlapRes.body.error.code !== 'BIKE_NOT_AVAILABLE') {
      throw new Error(`Expected HTTP 409 BIKE_NOT_AVAILABLE, got: ${overlapRes.status} ${JSON.stringify(overlapRes.body)}`);
    }
    console.log(`  ✓ Overlap correctly rejected with HTTP 409 BIKE_NOT_AVAILABLE`);

    // Step 11: Booking History API
    console.log('\nStep 11: Testing Booking History API (/api/bookings)...');
    const historyRes = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`);
    if (historyRes.status !== 200 || !Array.isArray(historyRes.body.data)) {
      throw new Error(`History fetch failed: ${historyRes.status}`);
    }
    const foundBooking = historyRes.body.data.find(b => b.id === testBookingId);
    if (!foundBooking) {
      throw new Error(`Created booking ${testBookingId} not returned in user booking history!`);
    }
    console.log(`  ✓ User booking history returned ${historyRes.body.data.length} item(s), found #${testBookingId}`);

    // Step 12: Cancel Booking API
    console.log(`\nStep 12: Testing Booking Cancellation (/api/bookings/${testBookingId}/cancel)...`);
    const cancelRes = await request(app)
      .patch(`/api/bookings/${testBookingId}/cancel`)
      .set('Authorization', `Bearer ${authToken}`);
    const cancelledData = cancelRes.body.data.booking || cancelRes.body.data;
    if (cancelRes.status !== 200 || cancelledData.status !== 'Cancelled') {
      throw new Error(`Cancellation failed: ${cancelRes.status} ${JSON.stringify(cancelRes.body)}`);
    }
    console.log(`  ✓ Booking status updated to: ${cancelledData.status}`);

    // Step 13: Verify DB Cancellation
    console.log('\nStep 13: Directly Verifying Cancellation in PostgreSQL...');
    const cancelledDbRecord = await prisma.booking.findUnique({
      where: { id: testBookingId }
    });
    if (cancelledDbRecord.status !== 'CANCELLED' || !cancelledDbRecord.cancelledAt) {
      throw new Error(`PostgreSQL record not marked CANCELLED!`);
    }
    console.log(`  ✓ PostgreSQL status confirmed: CANCELLED at ${cancelledDbRecord.cancelledAt}`);

    // Step 14: Verify Dates are Freed Up
    console.log(`\nStep 14: Verifying Dates are Freed Up (/api/bikes/scrambler400x/availability)...`);
    const availRes2 = await request(app)
      .get(`/api/bikes/scrambler400x/availability?start=${startDate}&end=${endDate}`);
    if (availRes2.status !== 200 || availRes2.body.data.available !== true) {
      throw new Error(`Dates should be available after cancellation, but got: ${JSON.stringify(availRes2.body)}`);
    }
    console.log(`  ✓ Dates ${startDate}..${endDate} successfully freed up for other riders!`);

    console.log('\n====================================================');
    console.log('✅ ALL 14 USER JOURNEY END-TO-END TESTS PASSED!');
    console.log('====================================================');
  } finally {
    // Cleanup only this specific test run's data
    console.log('\nCleaning up test artifacts...');
    if (testBookingId) {
      await prisma.booking.deleteMany({ where: { id: testBookingId } });
      console.log(`  - Cleaned up test booking: ${testBookingId}`);
    }
    if (testUserId) {
      await prisma.user.deleteMany({ where: { id: testUserId } });
      console.log(`  - Cleaned up test user: ${testUserId}`);
    }
    await prisma.$disconnect();
    console.log('Database connection closed cleanly.');
  }
}

runE2EJourney().catch((err) => {
  console.error('\n❌ E2E Journey test failed:', err);
  process.exit(1);
});
