const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../db');
const { unauthorized } = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (userId) =>
  jwt.sign({ sub: userId }, config.jwtSecret, { algorithm: 'HS256', expiresIn: config.jwtExpiresIn });

/** Requires "Authorization: Bearer <jwt>" and loads the user from the database on every request. */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
    if (!user) throw unauthorized('Invalid or expired token');
    req.user = user;
    return next();
  } catch (err) {
    throw unauthorized('Invalid or expired token');
  }
});

module.exports = { signToken, requireAuth };
