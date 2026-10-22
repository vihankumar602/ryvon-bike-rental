const rateLimit = require('express-rate-limit');
const config = require('../config');

const make = (limit, windowMs, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message } },
  });

// Brute-force protection for register/login.
const authLimiter = make(config.authRateLimitMax, 15 * 60 * 1000, 'Too many attempts. Try again later.');
const apiLimiter = make(config.apiRateLimitMax, 15 * 60 * 1000, 'Too many requests. Try again later.');

module.exports = { authLimiter, apiLimiter };
