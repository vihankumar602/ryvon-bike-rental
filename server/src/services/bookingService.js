const crypto = require('crypto');
const prisma = require('../db');
const config = require('../config');
const { calculatePrice } = require('../utils/pricing');
const { parseDateOnly, todayDate, diffDays } = require('../utils/dates');
const { badRequest, notFound, conflict, isOverlapViolation, isUniqueViolation, isDeadlock } = require('../utils/errors');

/** Validate the date range against business rules and return parsed dates + billable days. */
function resolveRange(startStr, endStr) {
  const start = parseDateOnly(startStr);
  const end = parseDateOnly(endStr);
  if (!start || !end) throw badRequest('Dates must be valid YYYY-MM-DD values');
  if (start < todayDate(config.timezone)) throw badRequest('Pickup date cannot be in the past');
  if (end < start) throw badRequest('Return date cannot be before pickup date');
  const days = Math.max(1, diffDays(start, end)); // same-day rental bills 1 day, like the frontend
  if (days > config.maxBookingDays) throw badRequest(`Maximum rental length is ${config.maxBookingDays} days`);
  return { start, end, days };
}

/** True if a confirmed booking already occupies any day in [start, end] (both inclusive). */
async function hasConflict(bikeId, start, end) {
  const clash = await prisma.booking.findFirst({
    where: { bikeId, status: 'CONFIRMED', startDate: { lte: end }, endDate: { gte: start } },
    select: { id: true },
  });
  return clash !== null;
}

async function loadBike(bikeId) {
  const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
  if (!bike) throw notFound('Bike not found');
  return bike;
}

async function loadExtras(extraIds) {
  const ids = [...new Set(['helmet', ...extraIds])]; // the free certified helmet is always included
  const found = await prisma.rentalExtra.findMany({ where: { id: { in: ids }, active: true } });
  const foundIds = new Set(found.map((e) => e.id));
  const unknown = extraIds.filter((id) => !foundIds.has(id));
  if (unknown.length) throw badRequest(`Unknown extras: ${unknown.join(', ')}`);
  return found;
}

function priceOrThrow(args) {
  try {
    return calculatePrice(args);
  } catch (err) {
    if (err.code === 'INVALID_COUPON') throw badRequest('Invalid coupon code');
    throw err;
  }
}

/** Price + availability preview. Nothing is written. */
async function quote(input) {
  const { start, end, days } = resolveRange(input.startDate, input.endDate);
  const bike = await loadBike(input.bikeId);
  const extras = await loadExtras(input.extras);
  const price = priceOrThrow({ bike, extras, days, couponCode: input.couponCode });
  let available = bike.available;
  let reason = bike.available ? null : 'BIKE_UNAVAILABLE';
  if (available && (await hasConflict(bike.id, start, end))) {
    available = false;
    reason = 'ALREADY_BOOKED';
  }
  return { bikeId: bike.id, startDate: input.startDate, endDate: input.endDate, available, reason, price };
}

async function checkAvailability(bikeId, startStr, endStr) {
  const { start, end } = resolveRange(startStr, endStr);
  const bike = await loadBike(bikeId);
  if (!bike.available) return { bikeId, available: false, reason: 'BIKE_UNAVAILABLE' };
  if (await hasConflict(bikeId, start, end)) return { bikeId, available: false, reason: 'ALREADY_BOOKED' };
  return { bikeId, available: true, reason: null };
}

const newReference = () => `RDS-${new Date().getUTCFullYear()}-${crypto.randomInt(100000, 1000000)}`;

async function createBooking(user, input) {
  const { start, end, days } = resolveRange(input.startDate, input.endDate);
  const bike = await loadBike(input.bikeId);
  if (!bike.available) throw conflict('BIKE_UNAVAILABLE', 'This bike is not available for rental');
  const extras = await loadExtras(input.extras);
  const price = priceOrThrow({ bike, extras, days, couponCode: input.couponCode });

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // The overlap guarantee does NOT depend on a check-then-insert here: PostgreSQL's
      // bookings_no_overlap exclusion constraint rejects conflicting concurrent inserts.
      // The per-bike advisory lock only serializes inserts for the SAME bike so concurrent
      // partially-overlapping inserts cannot deadlock each other inside the GiST index.
      return await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'booking:' + bike.id}))`;
        return tx.booking.create({
        data: {
          id: newReference(),
          userId: user.id,
          bikeId: bike.id,
          startDate: start,
          endDate: end,
          days: price.days,
          pickupTime: input.pickupTime,
          pickupHub: input.pickupHub,
          destination: input.destination ?? null,
          source: input.source ?? null,
          dailyRate: price.dailyRate,
          rentalAmount: price.rentalAmount,
          extrasAmount: price.extrasAmount,
          discountAmount: price.discountAmount,
          serviceFee: price.serviceFee,
          gstAmount: price.gstAmount,
          totalAmount: price.totalAmount,
          depositAmount: price.depositAmount,
          couponCode: input.couponCode ?? null,
          extras: extras.map((e) => ({ id: e.id, name: e.name, price: e.pricePerDay })),
          paymentMode: input.paymentMode,
        },
        include: { bike: true },
        });
      });
    } catch (err) {
      if (isOverlapViolation(err)) {
        throw conflict('BIKE_NOT_AVAILABLE', 'This bike is already booked for part of the selected dates');
      }
      if (isUniqueViolation(err) || isDeadlock(err)) continue; // reference collision / rare deadlock: retry
      throw err;
    }
  }
  throw new Error('Could not allocate a unique booking reference');
}

function statusWhere(status) {
  const today = todayDate(config.timezone);
  switch (status) {
    case 'Upcoming': return { status: 'CONFIRMED', startDate: { gt: today } };
    case 'Active': return { status: 'CONFIRMED', startDate: { lte: today }, endDate: { gte: today } };
    case 'Completed': return { status: 'CONFIRMED', endDate: { lt: today } };
    case 'Cancelled': return { status: 'CANCELLED' };
    default: return {};
  }
}

async function listBookings(userId, { status, limit, offset }) {
  const where = { userId, ...statusWhere(status) };
  const [items, total] = await Promise.all([
    prisma.booking.findMany({ where, include: { bike: true }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
    prisma.booking.count({ where }),
  ]);
  return { items, total };
}

async function getBooking(userId, id) {
  // Scoped by userId: someone else's booking is indistinguishable from a missing one.
  const booking = await prisma.booking.findFirst({ where: { id, userId }, include: { bike: true } });
  if (!booking) throw notFound('Booking not found');
  return booking;
}

async function cancelBooking(userId, id) {
  // Single atomic conditional UPDATE: no read-then-write race (e.g. double cancel).
  const result = await prisma.booking.updateMany({
    where: { id, userId, status: 'CONFIRMED', startDate: { gt: todayDate(config.timezone) } },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });
  if (result.count === 0) {
    const existing = await prisma.booking.findFirst({ where: { id, userId }, select: { status: true } });
    if (!existing) throw notFound('Booking not found');
    if (existing.status === 'CANCELLED') throw conflict('ALREADY_CANCELLED', 'Booking is already cancelled');
    throw conflict('CANNOT_CANCEL', 'Only bookings that have not started yet can be cancelled');
  }
  return getBooking(userId, id);
}

module.exports = { quote, checkAvailability, createBooking, listBookings, getBooking, cancelBooking };
