const { z } = require('zod');
const { parseDateOnly } = require('../utils/dates');

const dateOnly = z
  .string({ required_error: 'Date is required' })
  .refine((s) => parseDateOnly(s) !== null, 'Must be a valid date in YYYY-MM-DD format');

// bcrypt only uses the first 72 BYTES of a password; reject longer ones instead of silently truncating.
const password = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .refine((s) => Buffer.byteLength(s, 'utf8') <= 72, 'Password must be at most 72 bytes');

const email = z.string({ required_error: 'Email is required' }).trim().toLowerCase().email('Invalid email address').max(254);
const phone = z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, 'Invalid phone number');
const licenseNumber = z.string().trim().regex(/^[A-Za-z0-9 -]{5,30}$/, 'Invalid licence number');

const register = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name is too short').max(80),
  email,
  password,
  phone: phone.optional(),
  licenseNumber: licenseNumber.optional(),
});

const login = z.object({
  email,
  password: z.string({ required_error: 'Password is required' }).min(1).max(200),
});

const updateProfile = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: phone.nullable().optional(),
    licenseNumber: licenseNumber.nullable().optional(),
    avatar: z.string().trim().url().max(500).regex(/^https:\/\//, 'Avatar must be an https URL').nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, 'Provide at least one field to update');

const PICKUP_TIMES = ['09:00 AM', '11:00 AM', '02:00 PM', '06:00 PM'];
const PAYMENT_MODES = ['Instant UPI', 'Credit/Debit Card', 'Net Banking'];

const bookingBase = {
  bikeId: z.string({ required_error: 'bikeId is required' }).trim().min(1).max(64),
  startDate: dateOnly,
  endDate: dateOnly,
  extras: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  couponCode: z.string().trim().toUpperCase().max(20).optional(),
};

const quoteBooking = z.object(bookingBase);

const createBooking = z.object({
  ...bookingBase,
  pickupTime: z.enum(PICKUP_TIMES).default('09:00 AM'),
  pickupHub: z.string({ required_error: 'pickupHub is required' }).trim().min(2).max(100),
  destination: z.string().trim().max(120).optional(),
  source: z.string().trim().max(120).optional(),
  paymentMode: z.enum(PAYMENT_MODES).default('Instant UPI'),
});

const BOOKING_STATUS_FILTER = ['Upcoming', 'Active', 'Completed', 'Cancelled'];
const listBookingsQuery = z.object({
  status: z.enum(BOOKING_STATUS_FILTER).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const bookingIdParam = z.object({ id: z.string().regex(/^RDS-\d{4}-\d{6}$/, 'Invalid booking id') });
const bikeIdParam = z.object({ id: z.string().trim().min(1).max(64) });

const listBikesQuery = z.object({
  type: z.string().trim().max(40).optional(),
  brand: z.string().trim().max(40).optional(),
  search: z.string().trim().max(60).optional(),
  available: z.enum(['true', 'false']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

const availabilityQuery = z.object({ start: dateOnly, end: dateOnly });

module.exports = {
  register, login, updateProfile, quoteBooking, createBooking, listBookingsQuery,
  bookingIdParam, bikeIdParam, listBikesQuery, availabilityQuery, PICKUP_TIMES, PAYMENT_MODES,
};
