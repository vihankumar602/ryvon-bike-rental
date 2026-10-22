// Server-side price calculation. Mirrors the formula shown by the existing frontend
// (rental + extras + service fee, 18% GST) so the amounts users see match what is stored.
// The client NEVER supplies prices; only bike id, dates, extra ids and a coupon code.

const SERVICE_FEE = 149;
const GST_RATE = 0.18;
const COUPONS = { WANDER20: 0.2 }; // same code/discount the frontend advertises

function calculatePrice({ bike, extras = [], days, couponCode }) {
  if (!Number.isInteger(days) || days < 1) throw new Error('days must be a positive integer');

  let discountRate = 0;
  if (couponCode) {
    if (!Object.prototype.hasOwnProperty.call(COUPONS, couponCode)) {
      const err = new Error('Invalid coupon code');
      err.code = 'INVALID_COUPON';
      throw err;
    }
    discountRate = COUPONS[couponCode];
  }

  const dailyRate = bike.pricePerDay;
  const extrasPerDay = extras.reduce((sum, e) => sum + e.pricePerDay, 0);
  const rentalAmount = dailyRate * days;
  const extrasAmount = extrasPerDay * days;
  const discountAmount = Math.round(rentalAmount * discountRate);
  const taxable = rentalAmount - discountAmount + extrasAmount + SERVICE_FEE;
  const gstAmount = Math.round(taxable * GST_RATE);
  const totalAmount = taxable + gstAmount;

  return {
    days,
    dailyRate,
    rentalAmount,
    extrasAmount,
    discountAmount,
    serviceFee: SERVICE_FEE,
    gstAmount,
    totalAmount,
    depositAmount: bike.deposit,
    currency: 'INR',
  };
}

module.exports = { calculatePrice, SERVICE_FEE, GST_RATE, COUPONS };
