const router = require('express').Router();
const schemas = require('../schemas');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { serializeBooking } = require('../serializers');
const bookingService = require('../services/bookingService');

// Public: server-side price + availability preview. Writes nothing.
router.post('/quote', validate({ body: schemas.quoteBooking }), asyncHandler(async (req, res) => {
  res.json({ data: await bookingService.quote(req.body) });
}));

// Everything below requires a valid token and only ever touches the caller's own bookings.
router.use(requireAuth);

router.post('/', validate({ body: schemas.createBooking }), asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user, req.body);
  res.status(201).json({ data: { booking: serializeBooking(booking) } });
}));

router.get('/', validate({ query: schemas.listBookingsQuery }), asyncHandler(async (req, res) => {
  const { items, total } = await bookingService.listBookings(req.user.id, req.query);
  res.json({ data: items.map((b) => serializeBooking(b)), meta: { total, limit: req.query.limit, offset: req.query.offset } });
}));

router.get('/:id', validate({ params: schemas.bookingIdParam }), asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(req.user.id, req.params.id);
  res.json({ data: { booking: serializeBooking(booking) } });
}));

router.patch('/:id/cancel', validate({ params: schemas.bookingIdParam }), asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.user.id, req.params.id);
  res.json({ data: { booking: serializeBooking(booking) } });
}));

module.exports = router;
