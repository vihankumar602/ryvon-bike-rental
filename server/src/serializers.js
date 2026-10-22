const { formatDateOnly, todayString } = require('./utils/dates');
const config = require('./config');

/** Same field names the existing frontend already uses for bikes. */
function serializeBike(b) {
  return {
    id: b.id,
    name: b.name,
    brand: b.brand,
    type: b.type,
    price: b.pricePerDay,
    deposit: b.deposit,
    rating: b.rating.toString(),
    fuel: b.fuel,
    transmission: b.transmission,
    available: b.available,
    imgFile: b.imgFile,
    engine: b.engine,
    power: b.power,
    torque: b.torque,
    weight: b.weight,
    seat: b.seat,
    topSpeed: b.topSpeed,
    fuelCap: b.fuelCap,
    ...b.extra, // aiMatch, dna, stars
  };
}

function serializeUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    licenseNumber: u.licenseNumber,
    avatar: u.avatar,
    createdAt: u.createdAt.toISOString(),
  };
}

/** Upcoming / Active / Completed are derived from dates; only CONFIRMED / CANCELLED are stored. */
function derivedStatus(booking, today = todayString(config.timezone)) {
  if (booking.status === 'CANCELLED') return 'Cancelled';
  const start = formatDateOnly(booking.startDate);
  const end = formatDateOnly(booking.endDate);
  if (start > today) return 'Upcoming';
  if (end < today) return 'Completed';
  return 'Active';
}

/** Field names follow the booking objects the frontend already builds (id, bikeName, pickupCity, ...). */
function serializeBooking(b, today) {
  return {
    id: b.id,
    status: derivedStatus(b, today),
    bikeId: b.bikeId,
    bikeName: b.bike ? b.bike.name : undefined,
    bikeCategory: b.bike ? b.bike.type : undefined,
    bikeEngine: b.bike ? b.bike.engine : undefined,
    bikePower: b.bike ? b.bike.power : undefined,
    bikeImgFile: b.bike ? b.bike.imgFile : undefined,
    pickupCity: b.pickupHub,
    destCity: b.destination,
    source: b.source,
    startDate: formatDateOnly(b.startDate),
    endDate: formatDateOnly(b.endDate),
    pickupTime: b.pickupTime,
    duration: b.days,
    dailyRate: b.dailyRate,
    rental: b.rentalAmount,
    extras: b.extras,
    extrasTotal: b.extrasAmount,
    discount: b.discountAmount,
    couponCode: b.couponCode,
    sanitization: b.serviceFee,
    gst: b.gstAmount,
    total: b.totalAmount,
    deposit: b.depositAmount,
    paymentMode: b.paymentMode,
    paymentStatus: b.paymentStatus, // PENDING: no payment gateway is integrated
    bookingDate: formatDateOnly(b.createdAt),
    createdAt: b.createdAt.toISOString(),
    cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : null,
  };
}

module.exports = { serializeBike, serializeUser, serializeBooking, derivedStatus };
