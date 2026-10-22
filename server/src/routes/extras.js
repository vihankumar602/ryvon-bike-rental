const router = require('express').Router();
const prisma = require('../db');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const extras = await prisma.rentalExtra.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
  res.json({ data: extras.map((e) => ({ id: e.id, name: e.name, price: e.pricePerDay })) });
}));

module.exports = router;
