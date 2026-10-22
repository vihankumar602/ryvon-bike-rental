// Shared setup for DB-backed tests. Refuses to run against anything that isn't clearly a test database,
// because the tests delete users/bookings.
const crypto = require('crypto');

const url = process.env.TEST_DATABASE_URL;
const enabled = Boolean(url);
if (enabled) {
  const dbName = new URL(url).pathname.replace('/', '');
  if (!/test/i.test(dbName)) {
    throw new Error(`Refusing to run tests: database name "${dbName}" must contain "test".`);
  }
  process.env.DATABASE_URL = url;
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  process.env.BCRYPT_ROUNDS = '10';
  process.env.AUTH_RATE_LIMIT_MAX = '100000';
  process.env.API_RATE_LIMIT_MAX = '100000';
  process.env.NODE_ENV = 'test';
}

const addDays = (dateStr, n) => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

module.exports = { enabled, addDays };
