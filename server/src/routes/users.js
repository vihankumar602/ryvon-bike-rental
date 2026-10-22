const router = require('express').Router();
const prisma = require('../db');
const schemas = require('../schemas');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { serializeUser } = require('../serializers');

// Only the whitelisted profile fields can be changed (no email/password/id mass-assignment).
router.patch('/me', requireAuth, validate({ body: schemas.updateProfile }), asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
  res.json({ data: { user: serializeUser(user) } });
}));

module.exports = router;
