const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

async function testStaticAndApi() {
  console.log('Testing static frontend serving, pure email/password auth, and API integration...');

  // 1. Root /
  const homeRes = await request(app).get('/');
  console.log(`  GET /: HTTP ${homeRes.status}, Content-Type: ${homeRes.headers['content-type']}, Length: ${homeRes.text.length}`);
  if (homeRes.status !== 200 || !homeRes.text.includes('RYVON')) {
    throw new Error('Home page serving failed');
  }

  // 2. /assets/js/app.js
  const jsRes = await request(app).get('/assets/js/app.js');
  console.log(`  GET /assets/js/app.js: HTTP ${jsRes.status}, Length: ${jsRes.text.length}`);
  if (jsRes.status !== 200 || jsRes.text.includes('initiateGoogleSignIn') || jsRes.text.includes('showAppleAccountModal')) {
    throw new Error('assets/js/app.js contains lingering Google or Apple handlers!');
  }

  // 3. /pages/login.html
  const loginRes = await request(app).get('/pages/login.html');
  console.log(`  GET /pages/login.html: HTTP ${loginRes.status}, Length: ${loginRes.text.length}`);
  if (loginRes.status !== 200 || loginRes.text.includes('gsi/client')) {
    throw new Error('pages/login.html serving failed or lingering Google Identity script found!');
  }

  // 4. /pages/register.html
  const registerRes = await request(app).get('/pages/register.html');
  console.log(`  GET /pages/register.html: HTTP ${registerRes.status}, Length: ${registerRes.text.length}`);
  if (registerRes.status !== 200 || registerRes.text.includes('gsi/client')) {
    throw new Error('pages/register.html serving failed or lingering Google Identity script found!');
  }

  // 5. Verify obsolete OAuth HTML pages return 404
  const googleOAuthRes = await request(app).get('/pages/google-oauth.html');
  const appleOAuthRes = await request(app).get('/pages/apple-oauth.html');
  console.log(`  GET /pages/google-oauth.html: HTTP ${googleOAuthRes.status} (Correctly Absent)`);
  console.log(`  GET /pages/apple-oauth.html: HTTP ${appleOAuthRes.status} (Correctly Absent)`);
  if (googleOAuthRes.status !== 404 || appleOAuthRes.status !== 404) {
    throw new Error('Obsolete OAuth HTML files were not removed!');
  }

  // 6. /api/health
  const healthRes = await request(app).get('/api/health');
  console.log(`  GET /api/health: HTTP ${healthRes.status}, Body: ${JSON.stringify(healthRes.body)}`);
  if (healthRes.status !== 200 || healthRes.body.data.status !== 'ok') {
    throw new Error('api/health failed');
  }

  // 7. Verify obsolete Google API routes return 404
  const authConfigRes = await request(app).get('/api/auth/config');
  const authGoogleRes = await request(app).post('/api/auth/google').send({});
  console.log(`  GET /api/auth/config: HTTP ${authConfigRes.status} (Correctly 404)`);
  console.log(`  POST /api/auth/google: HTTP ${authGoogleRes.status} (Correctly 404)`);
  if (authConfigRes.status !== 404 || authGoogleRes.status !== 404) {
    throw new Error('Obsolete Google API routes are still active!');
  }

  // 8. Test /api/extras (7 extras)
  const extrasRes = await request(app).get('/api/extras');
  console.log(`  GET /api/extras: HTTP ${extrasRes.status}, Count: ${extrasRes.body.data.length}`);
  if (extrasRes.status !== 200 || extrasRes.body.data.length !== 7) {
    throw new Error('api/extras failed');
  }

  // 9. Test /api/bikes (34 bikes)
  const bikesRes = await request(app).get('/api/bikes');
  console.log(`  GET /api/bikes: HTTP ${bikesRes.status}, Count: ${bikesRes.body.data.length}`);
  if (bikesRes.status !== 200 || bikesRes.body.data.length !== 34) {
    throw new Error('api/bikes failed');
  }

  // 10. Test CORS headers for file:/// (origin: 'null') and Vite dev (origin: 'http://localhost:5173')
  const corsFileRes = await request(app).options('/api/health').set('Origin', 'null');
  console.log(`  OPTIONS /api/health with Origin: "null" (file:///): Access-Control-Allow-Origin = ${corsFileRes.headers['access-control-allow-origin']}`);
  if (corsFileRes.headers['access-control-allow-origin'] !== 'null') {
    throw new Error('CORS did not allow Origin: null for file:///');
  }

  const corsViteRes = await request(app).options('/api/health').set('Origin', 'http://localhost:5173');
  console.log(`  OPTIONS /api/health with Origin: "http://localhost:5173": Access-Control-Allow-Origin = ${corsViteRes.headers['access-control-allow-origin']}`);
  if (corsViteRes.headers['access-control-allow-origin'] !== 'http://localhost:5173') {
    throw new Error('CORS did not allow Origin: http://localhost:5173');
  }

  console.log('✅ All static serving, route cleanup, and CORS checks passed successfully!');
  await prisma.$disconnect();
  process.exit(0);
}

testStaticAndApi().catch(err => {
  console.error('❌ Check failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
