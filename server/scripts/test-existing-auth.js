const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

async function testExistingAuth() {
  console.log('Testing existing authentication endpoints...');

  // 1. Test registration of a new test user
  const testEmail = `test_rider_${Date.now()}@example.com`;
  const regRes = await request(app).post('/api/auth/register').send({
    name: 'Automation Test Rider',
    email: testEmail,
    password: 'SecureTestPassword123!',
    phone: '+91 99999 88888',
    licenseNumber: 'DL-TEST-99999',
  });

  console.log(`  POST /api/auth/register: HTTP ${regRes.status}`);
  if (regRes.status !== 201 || !regRes.body.data.token) {
    throw new Error('User registration failed: ' + JSON.stringify(regRes.body));
  }
  const token = regRes.body.data.token;
  const userId = regRes.body.data.user.id;

  // 2. Test /api/auth/me with the issued JWT
  const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  console.log(`  GET /api/auth/me: HTTP ${meRes.status}`);
  if (meRes.status !== 200 || meRes.body.data.user.email !== testEmail) {
    throw new Error('/api/auth/me failed with valid JWT: ' + JSON.stringify(meRes.body));
  }

  // 3. Test /api/auth/login with password
  const loginRes = await request(app).post('/api/auth/login').send({
    email: testEmail,
    password: 'SecureTestPassword123!',
  });
  console.log(`  POST /api/auth/login: HTTP ${loginRes.status}`);
  if (loginRes.status !== 200 || !loginRes.body.data.token) {
    throw new Error('User login failed: ' + JSON.stringify(loginRes.body));
  }

  // 4. Test login with wrong password
  const badLoginRes = await request(app).post('/api/auth/login').send({
    email: testEmail,
    password: 'WrongPassword!',
  });
  console.log(`  POST /api/auth/login (bad password): HTTP ${badLoginRes.status} (Properly Rejected)`);
  if (badLoginRes.status !== 401) {
    throw new Error('Bad password was not rejected with 401');
  }

  // 5. Test fake jwt_google_ token is properly rejected by requireAuth
  const fakeTokenRes = await request(app).get('/api/auth/me').set('Authorization', 'Bearer jwt_google_12345');
  console.log(`  GET /api/auth/me (fake jwt_google_ token): HTTP ${fakeTokenRes.status} (Backdoor Successfully Blocked)`);
  if (fakeTokenRes.status !== 401) {
    throw new Error('Backdoor fake token was NOT blocked!');
  }

  // Cleanup only the temporary test user
  await prisma.user.delete({ where: { id: userId } });
  console.log('✅ Existing auth flow, JWT issuance, and backdoor prevention all verified!');
  process.exit(0);
}

testExistingAuth().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
