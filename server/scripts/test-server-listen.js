const http = require('http');
const app = require('../src/app');
const config = require('../src/config');
const prisma = require('../src/db');

async function testListen() {
  await prisma.$queryRaw`SELECT 1`;
  const port = 3001; // test port so no conflict with any background server
  const server = app.listen(port, async () => {
    console.log(`Test server running on port ${port}`);

    // Test health endpoint over actual HTTP network socket
    http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`HTTP GET /api/health returned status ${res.statusCode}: ${data}`);
        server.close(async () => {
          await prisma.$disconnect();
          console.log('✅ Real HTTP socket listen test succeeded!');
          process.exit(0);
        });
      });
    }).on('error', (err) => {
      console.error('HTTP request failed:', err);
      server.close(() => process.exit(1));
    });
  });
}

testListen().catch((err) => {
  console.error('Server listen test failed:', err);
  process.exit(1);
});
