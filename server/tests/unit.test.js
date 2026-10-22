// Pure unit tests: no database needed.
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculatePrice } = require('../src/utils/pricing');
const { parseDateOnly, todayString, diffDays } = require('../src/utils/dates');
const { isOverlapViolation } = require('../src/utils/errors');

const bike = { pricePerDay: 1649, deposit: 4000 };

test('pricing: matches the frontend formula (rental + extras + 149 fee, 18% GST)', () => {
  const p = calculatePrice({ bike, extras: [{ pricePerDay: 199 }], days: 3 });
  assert.equal(p.rentalAmount, 4947);
  assert.equal(p.extrasAmount, 597);
  assert.equal(p.serviceFee, 149);
  assert.equal(p.gstAmount, Math.round((4947 + 597 + 149) * 0.18)); // 1025
  assert.equal(p.totalAmount, 4947 + 597 + 149 + 1025);
  assert.equal(p.depositAmount, 4000);
});

test('pricing: WANDER20 takes 20% off the rental before GST; unknown coupon throws', () => {
  const p = calculatePrice({ bike, days: 2, couponCode: 'WANDER20' });
  assert.equal(p.discountAmount, Math.round(3298 * 0.2));
  assert.equal(p.totalAmount, 3298 - p.discountAmount + 149 + p.gstAmount);
  assert.throws(() => calculatePrice({ bike, days: 2, couponCode: 'FREE100' }), { code: 'INVALID_COUPON' });
  assert.throws(() => calculatePrice({ bike, days: 2, couponCode: 'constructor' }), { code: 'INVALID_COUPON' });
});

test('pricing: rejects non-positive / non-integer days', () => {
  for (const days of [0, -1, 1.5, NaN]) assert.throws(() => calculatePrice({ bike, days }));
});

test('dates: strict YYYY-MM-DD parsing', () => {
  assert.ok(parseDateOnly('2026-12-31'));
  for (const bad of ['2026-02-31', '2026-13-01', '26-01-01', '2026-1-1', '', null, undefined, 20260101, '2026-01-01T00:00:00Z']) {
    assert.equal(parseDateOnly(bad), null, String(bad));
  }
  assert.equal(diffDays(parseDateOnly('2026-03-01'), parseDateOnly('2026-03-04')), 3);
});

test('dates: "today" follows the business timezone, not UTC', () => {
  const instant = new Date('2026-06-10T20:00:00Z'); // 01:30 on the 11th in India
  assert.equal(todayString('Asia/Kolkata', instant), '2026-06-11');
  assert.equal(todayString('UTC', instant), '2026-06-10');
});

test('overlap-violation detection recognises the exclusion constraint error shapes', () => {
  assert.equal(isOverlapViolation(new Error('conflicting key value violates exclusion constraint "bookings_no_overlap"')), true);
  assert.equal(isOverlapViolation({ code: 'P2010', meta: { code: '23P01' }, message: 'x' }), true);
  assert.equal(isOverlapViolation(new Error('connection refused')), false);
});
