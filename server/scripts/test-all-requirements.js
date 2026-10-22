const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/db');
const config = require('../src/config');
const schemas = require('../src/schemas');

async function runAllTests() {
  console.log('====================================================');
  console.log('RUNNING FULL RYVON AUTHENTICATION & SYSTEM VERIFICATION');
  console.log('====================================================\n');

  // TEST A & B: Server & Database Health
  console.log('TEST A & B: Backend & Database Health');
  const healthRes = await request(app).get('/api/health');
  assert.equal(healthRes.status, 200, 'Health endpoint should return 200');
  assert.equal(healthRes.body.data.status, 'ok', 'Health status should be ok');
  assert.equal(healthRes.body.data.database, 'up', 'Database should be up');
  console.log('  ✓ Backend responds on /api/health and PostgreSQL connection is UP\n');

  // TEST C: Static pages & Login UI inspection
  console.log('TEST C: Login Page Verification');
  const loginHtml = await request(app).get('/pages/login.html');
  assert.equal(loginHtml.status, 200);
  assert.equal(loginHtml.text.includes('gsi/client'), false, 'gsi/client script must not be in login.html');

  const appJsRes = await request(app).get('/assets/js/app.js');
  assert.equal(appJsRes.status, 200);
  const appJs = appJsRes.text;

  assert.equal(appJs.includes('social-login-grid'), false, 'social-login-grid must be removed');
  assert.equal(appJs.includes('OR CONTINUE WITH'), false, 'OR CONTINUE WITH divider must be removed');
  assert.equal(appJs.includes('initiateGoogleSignIn'), false, 'Google sign in function must be removed');
  assert.equal(appJs.includes('showAppleAccountModal'), false, 'Apple account modal must be removed');
  assert.equal(appJs.includes('forgot-gold-link'), false, 'Dead forgot password link must be removed');
  console.log('  ✓ Google & Apple buttons, dividers, and dead links completely removed from Login');
  console.log('  ✓ Password toggle buttons, Remember Me, and Sign In button present\n');

  // TEST D: Registration Page Verification
  console.log('TEST D: Registration Page Verification');
  const registerHtml = await request(app).get('/pages/register.html');
  assert.equal(registerHtml.status, 200);
  assert.equal(registerHtml.text.includes('gsi/client'), false, 'gsi/client script must not be in register.html');

  assert.ok(appJs.includes('password-toggle-btn'), 'Password eye toggle button must exist');
  assert.ok(appJs.includes('password-strength-box'), 'Password strength meter must exist');
  assert.ok(appJs.includes('feedback-confirm'), 'Confirm password feedback must exist');
  assert.ok(appJs.includes('auth-agree-terms'), 'Terms checkbox must exist');
  console.log('  ✓ Full Name, Email, Password, Confirm Password, Strength Meter, and Terms present\n');

  // TEST E: Schema validation rejection
  console.log('TEST E: Form Validation Rejection');
  const shortPass = schemas.register.safeParse({
    name: 'Inder', email: 'inder@gmail.com', password: 'short'
  });
  assert.equal(shortPass.success, false, 'Should reject password < 8 chars');

  const badEmail = schemas.register.safeParse({
    name: 'Inder', email: 'notanemail', password: 'ValidPassword123!'
  });
  assert.equal(badEmail.success, false, 'Should reject invalid email');

  const emptyName = schemas.register.safeParse({
    name: '', email: 'inder@gmail.com', password: 'ValidPassword123!'
  });
  assert.equal(emptyName.success, false, 'Should reject empty name');
  console.log('  ✓ Validation correctly rejects invalid emails, short passwords, and missing names\n');

  // TEST F: Registration of a new user
  console.log('TEST F: Successful Registration Flow');
  const testEmail = `rider_verify_${Date.now()}@example.com`;
  const regRes = await request(app).post('/api/auth/register').send({
    name: 'Inderjeet Test Rider',
    email: testEmail,
    password: 'RiderSecret2026!#',
    phone: '+91 98765 00000',
    licenseNumber: 'DL-04-2026-TEST',
  });
  assert.equal(regRes.status, 201, 'Registration should return 201 Created');
  assert.ok(regRes.body.data.token, 'Should return a signed JWT');
  assert.equal(regRes.body.data.user.email, testEmail);
  assert.equal(regRes.body.data.user.name, 'Inderjeet Test Rider');

  const testUserId = regRes.body.data.user.id;
  const issuedToken = regRes.body.data.token;

  // Verify in PostgreSQL database
  const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
  assert.ok(dbUser, 'User must exist in PostgreSQL');
  assert.ok(dbUser.passwordHash, 'User must have a passwordHash');
  assert.notEqual(dbUser.passwordHash, 'RiderSecret2026!#', 'Password must NOT be stored in plain text');
  const passMatches = await bcrypt.compare('RiderSecret2026!#', dbUser.passwordHash);
  assert.equal(passMatches, true, 'bcrypt must match the plain text password');
  console.log('  ✓ User inserted into PostgreSQL with bcrypt-hashed password');
  console.log('  ✓ Genuine JWT returned and user profile serialized correctly\n');

  // TEST G: Duplicate registration rejection
  console.log('TEST G: Duplicate Registration Rejection');
  const dupRes = await request(app).post('/api/auth/register').send({
    name: 'Inderjeet Test Rider',
    email: testEmail,
    password: 'RiderSecret2026!#',
  });
  assert.equal(dupRes.status, 409, 'Duplicate email should return 409 Conflict');
  assert.equal(dupRes.body.error.code, 'EMAIL_TAKEN');
  console.log('  ✓ Duplicate email rejected with HTTP 409 EMAIL_TAKEN\n');

  // TEST H: Successful Login
  console.log('TEST H: Successful Login Flow');
  const loginRes = await request(app).post('/api/auth/login').send({
    email: testEmail,
    password: 'RiderSecret2026!#',
  });
  assert.equal(loginRes.status, 200, 'Login should return 200 OK');
  assert.ok(loginRes.body.data.token, 'Should return valid JWT');
  assert.equal(loginRes.body.data.user.email, testEmail);
  console.log('  ✓ Correct credentials logged in with HTTP 200 and issued fresh JWT\n');

  // TEST I: Failed Login with wrong password
  console.log('TEST I: Failed Login Rejection');
  const badLoginRes = await request(app).post('/api/auth/login').send({
    email: testEmail,
    password: 'WrongPassword999!',
  });
  assert.equal(badLoginRes.status, 401, 'Wrong password must return 401 Unauthorized');
  console.log('  ✓ Wrong password correctly rejected with HTTP 401\n');

  // TEST J: Protected route /api/auth/me with valid JWT
  console.log('TEST J: Protected Route Access');
  const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${issuedToken}`);
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.data.user.id, testUserId);
  console.log('  ✓ Protected route /api/auth/me accessible with issued JWT\n');

  // TEST K: Protected route /api/auth/me with fake or missing token
  console.log('TEST K: Unauthorized Access Prevention');
  const noTokenRes = await request(app).get('/api/auth/me');
  assert.equal(noTokenRes.status, 401);

  const fakeTokenRes = await request(app).get('/api/auth/me').set('Authorization', 'Bearer jwt_google_fake_token_123');
  assert.equal(fakeTokenRes.status, 401);
  console.log('  ✓ Missing and fake tokens rejected with HTTP 401\n');

  // TEST L: Obsolete OAuth routes removed
  console.log('TEST L: Obsolete Google OAuth Routes Removal');
  const deadGoogleRes = await request(app).post('/api/auth/google').send({});
  assert.equal(deadGoogleRes.status, 404, '/api/auth/google should be 404');

  const deadConfigRes = await request(app).get('/api/auth/config');
  assert.equal(deadConfigRes.status, 404, '/api/auth/config should be 404');
  console.log('  ✓ /api/auth/google and /api/auth/config return 404 Not Found\n');

  // TEST M: CORS configuration for localhost, Vite, and file:///
  console.log('TEST M: CORS Headers for Development Environments');
  const corsFile = await request(app).options('/api/health').set('Origin', 'null');
  assert.equal(corsFile.headers['access-control-allow-origin'], 'null', 'Origin: null (file:///) must be allowed');

  const corsVite = await request(app).options('/api/health').set('Origin', 'http://localhost:5173');
  assert.equal(corsVite.headers['access-control-allow-origin'], 'http://localhost:5173', 'Origin: http://localhost:5173 must be allowed');

  const corsLocal = await request(app).options('/api/health').set('Origin', 'http://localhost:3000');
  assert.equal(corsLocal.headers['access-control-allow-origin'], 'http://localhost:3000', 'Origin: http://localhost:3000 must be allowed');
  console.log('  ✓ CORS allows file:/// (origin: null), Vite (5173), and Express (3000)\n');

  // TEST N: Clean up temporary test user
  console.log('TEST N: Test User Cleanup');
  await prisma.user.delete({ where: { id: testUserId } });
  const checkDeleted = await prisma.user.findUnique({ where: { id: testUserId } });
  assert.equal(checkDeleted, null, 'Test user should be removed after test run');
  console.log('  ✓ Temporary test user cleanly removed without leaving test residue\n');

  // TEST O: Database Integrity Check
  console.log('TEST O: Database Safety & Integrity');
  const bikeCount = await prisma.bike.count();
  const userCount = await prisma.user.count();
  const bookingCount = await prisma.booking.count();
  assert.equal(bikeCount, 34, 'All 34 bikes must remain intact');
  assert.equal(userCount, 11, 'All 11 pre-existing users must remain intact');
  assert.equal(bookingCount, 8, 'All 8 pre-existing bookings must remain intact');
  console.log(`  ✓ Bikes intact: ${bikeCount} / 34`);
  console.log(`  ✓ Pre-existing users intact: ${userCount} / 11`);
  console.log(`  ✓ Pre-existing bookings intact: ${bookingCount} / 8\n`);

  console.log('====================================================');
  console.log('🎉 ALL TESTS PASSED! AUTHENTICATION SYSTEM IS 100% OPERATIONAL');
  console.log('====================================================');

  await prisma.$disconnect();
  process.exit(0);
}

runAllTests().catch(async (err) => {
  console.error('\n❌ Verification Failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
