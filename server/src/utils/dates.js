// Bookings are whole calendar days. All dates are 'YYYY-MM-DD' strings at the API
// boundary and UTC-midnight Date objects inside Prisma (@db.Date).

const DAY_MS = 86400000;

/** Strictly parse 'YYYY-MM-DD'. Returns a UTC-midnight Date or null. */
function parseDateOnly(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(`${str}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10) === str ? d : null; // rejects 2026-02-31 etc.
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

/** Today's calendar date in the business timezone, as 'YYYY-MM-DD'. */
function todayString(timeZone, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function todayDate(timeZone, now = new Date()) {
  return parseDateOnly(todayString(timeZone, now));
}

function diffDays(from, to) {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

module.exports = { parseDateOnly, formatDateOnly, todayString, todayDate, diffDays };
