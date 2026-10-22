const router = require('express').Router();
const prisma = require('../db');
const schemas = require('../schemas');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { notFound } = require('../utils/errors');
const { serializeBike } = require('../serializers');
const bookingService = require('../services/bookingService');

const ORDER = {
  price_asc: { pricePerDay: 'asc' },
  price_desc: { pricePerDay: 'desc' },
  rating: { rating: 'desc' },
};

router.get('/', validate({ query: schemas.listBikesQuery }), asyncHandler(async (req, res) => {
  const { type, brand, search, available, sort, limit, offset } = req.query;
  const where = {};
  if (type) where.type = { equals: type, mode: 'insensitive' };
  if (brand) where.brand = { equals: brand, mode: 'insensitive' };
  if (available) where.available = available === 'true';
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
    ];
  }
  const [bikes, total] = await Promise.all([
    prisma.bike.findMany({ where, orderBy: [ORDER[sort] || { name: 'asc' }, { id: 'asc' }], take: limit, skip: offset }),
    prisma.bike.count({ where }),
  ]);
  res.json({ data: bikes.map(serializeBike), meta: { total, limit, offset } });
}));

router.get('/:id', validate({ params: schemas.bikeIdParam }), asyncHandler(async (req, res) => {
  const bike = await prisma.bike.findUnique({ where: { id: req.params.id } });
  if (!bike) throw notFound('Bike not found');
  res.json({ data: serializeBike(bike) });
}));

router.get('/:id/availability', validate({ params: schemas.bikeIdParam, query: schemas.availabilityQuery }), asyncHandler(async (req, res) => {
  const result = await bookingService.checkAvailability(req.params.id, req.query.start, req.query.end);
  res.json({ data: { ...result, start: req.query.start, end: req.query.end } });
}));

module.exports = router;
