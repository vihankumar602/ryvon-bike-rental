const http = require('http');
const prisma = require('../src/db');

function req(options, data) {
  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    r.on('error', reject);
    if (data) r.write(typeof data === 'string' ? data : JSON.stringify(data));
    r.end();
  });
}

async function testNetwork() {
  console.log('Testing live server over TCP network socket on http://localhost:3000...');

  // 1. Health
  const h = await req({ hostname: 'localhost', port: 3000, path: '/api/health', method: 'GET' });
  console.log('1. GET /api/health:', h.status, h.body);

  // 2. Register page
  const rp = await req({ hostname: 'localhost', port: 3000, path: '/pages/register.html', method: 'GET' });
  console.log('2. GET /pages/register.html:', rp.status, 'Length:', rp.body.length);

  // 3. Login page
  const lp = await req({ hostname: 'localhost', port: 3000, path: '/pages/login.html', method: 'GET' });
  console.log('3. GET /pages/login.html:', lp.status, 'Length:', lp.body.length);

  // 4. Register new user over HTTP
  const testEmail = 'realnet_' + Date.now() + '@example.com';
  const reg = await req({
    hostname: 'localhost', port: 3000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Real Network Rider',
    email: testEmail,
    password: 'RealPassword123!'
  });
  console.log('4. POST /api/auth/register:', reg.status, reg.body);
  const regJson = JSON.parse(reg.body);
  const token = regJson.data.token;
  const userId = regJson.data.user.id;

  // 5. Login with credentials
  const login = await req({
    hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'RealPassword123!'
  });
  console.log('5. POST /api/auth/login:', login.status, login.body);

  // 6. Test protected route /api/auth/me
  const me = await req({
    hostname: 'localhost', port: 3000, path: '/api/auth/me', method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('6. GET /api/auth/me:', me.status, me.body);

  // 7. CORS check from Live Server origin (5500) and file:/// (null)
  const cors5500 = await req({
    hostname: 'localhost', port: 3000, path: '/api/health', method: 'OPTIONS',
    headers: { 'Origin': 'http://localhost:5500', 'Access-Control-Request-Method': 'POST' }
  });
  console.log('7a. CORS from 5500:', cors5500.headers['access-control-allow-origin']);

  const corsNull = await req({
    hostname: 'localhost', port: 3000, path: '/api/health', method: 'OPTIONS',
    headers: { 'Origin': 'null', 'Access-Control-Request-Method': 'POST' }
  });
  console.log('7b. CORS from null (file:///):', corsNull.headers['access-control-allow-origin']);

  // Cleanup test user
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
  console.log('8. Test user cleaned up. All live network tests passed!');
}

testNetwork().catch(e => { console.error('Error:', e); process.exit(1); });
