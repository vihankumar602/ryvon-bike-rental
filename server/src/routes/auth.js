const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const config = require('../config');
const schemas = require('../schemas');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const { signToken, requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { conflict, unauthorized, isUniqueViolation } = require('../utils/errors');
const { serializeUser } = require('../serializers');

// Compared against when the email is unknown so response time doesn't reveal which emails exist.
let dummyHash;
const getDummyHash = () => (dummyHash ||= bcrypt.hashSync('ryvon-dummy-password', config.bcryptRounds));

// Resilient wrapper for remote pooled Postgres connection reconnects
async function withDbRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.code === 'P1017' || (err.message && err.message.includes('closed the connection'))) {
      return await fn();
    }
    throw err;
  }
}

router.post('/register', authLimiter, validate({ body: schemas.register }), asyncHandler(async (req, res) => {
  const { name, email, password, phone, licenseNumber } = req.body;
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  let user;
  try {
    user = await withDbRetry(() => prisma.user.create({ data: { name, email, passwordHash, phone, licenseNumber } }));
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict('EMAIL_TAKEN', 'An account with this email already exists');
    throw err;
  }
  res.status(201).json({ data: { user: serializeUser(user), token: signToken(user.id) } });
}));

router.post('/login', authLimiter, validate({ body: schemas.login }), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await withDbRetry(() => prisma.user.findUnique({ where: { email } }));
  const ok = Boolean(user && user.passwordHash) && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !user.passwordHash || !ok) {
    if (!user) await bcrypt.compare(password, getDummyHash());
    throw unauthorized('Invalid email or password');
  }
  res.json({ data: { user: serializeUser(user), token: signToken(user.id) } });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ data: { user: serializeUser(req.user) } });
});

module.exports = router;
