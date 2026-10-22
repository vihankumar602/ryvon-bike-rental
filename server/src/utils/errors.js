class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new AppError(400, 'BAD_REQUEST', message, details);
const unauthorized = (message = 'Authentication required') => new AppError(401, 'UNAUTHORIZED', message);
const notFound = (message = 'Not found') => new AppError(404, 'NOT_FOUND', message);
const conflict = (code, message) => new AppError(409, code, message);

/** True when PostgreSQL rejected a write because of the bookings_no_overlap exclusion constraint. */
function isOverlapViolation(err) {
  const haystack = [err && err.message, err && err.code, JSON.stringify((err && err.meta) || {}), String((err && err.cause) || '')]
    .join(' ');
  return /bookings_no_overlap|23P01|exclusion constraint/i.test(haystack);
}

/** True when PostgreSQL aborted the transaction as a deadlock victim (SQLSTATE 40P01). Safe to retry. */
function isDeadlock(err) {
  return /deadlock detected|40P01/i.test([err && err.message, err && err.code, JSON.stringify((err && err.meta) || {})].join(' '));
}

/** True for a Prisma unique-constraint violation (optionally on a specific field). */
function isUniqueViolation(err, field) {
  if (!err || err.code !== 'P2002') return false;
  if (!field) return true;
  const target = err.meta && err.meta.target;
  return Array.isArray(target) ? target.includes(field) : String(target || '').includes(field);
}

module.exports = { AppError, badRequest, unauthorized, notFound, conflict, isOverlapViolation, isUniqueViolation, isDeadlock };
