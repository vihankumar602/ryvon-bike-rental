const config = require('./config');
const prisma = require('./db');
const app = require('./app');

async function main() {
  let connected = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      break;
    } catch (err) {
      console.warn(`[db] Connection attempt ${attempt}/3 failed: ${err.message}`);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!connected) {
    throw new Error('Failed to connect to PostgreSQL database after 3 attempts.');
  }

  const server = app.listen(config.port, () => {
    console.log(`RYVON server listening on http://localhost:${config.port} (${config.env})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
