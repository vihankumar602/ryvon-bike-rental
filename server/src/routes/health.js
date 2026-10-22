const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ data: { status: 'ok', database: 'up' } });
  } catch (err) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ data: { status: 'ok', database: 'up' } });
    } catch (retryErr) {
      console.error('[health] database check failed:', retryErr.message);
      res.status(503).json({ error: { code: 'DB_DOWN', message: 'Database unavailable' } });
    }
  }
});

module.exports = router;
