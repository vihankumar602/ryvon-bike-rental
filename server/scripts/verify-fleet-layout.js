const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('Verifying Explore Fleet layout changes on live server...');

  const bikesRes = await get('/pages/bikes.html');
  console.log('1. /pages/bikes.html status:', bikesRes.status);
  if (!bikesRes.data.includes('style.css?v=98')) throw new Error('CSS version not updated in bikes.html');
  if (!bikesRes.data.includes('data-page="bikes"')) throw new Error('data-page bikes missing');

  const cssRes = await get('/assets/css/style.css');
  console.log('2. /assets/css/style.css status:', cssRes.status, 'Length:', cssRes.data.length);
  if (!cssRes.data.includes('body[data-page="bikes"] .container')) throw new Error('Missing expanded container rule');
  if (!cssRes.data.includes('min(94%, 1600px)')) throw new Error('Missing 1600px width limit');
  if (!cssRes.data.includes('grid-template-columns: repeat(4, 1fr)')) throw new Error('Missing 4-column grid rule');
  if (!cssRes.data.includes('grid-template-columns: 280px 1fr')) throw new Error('Missing 280px sidebar rule');

  const jsRes = await get('/assets/js/app.js');
  console.log('3. /assets/js/app.js status:', jsRes.status);
  if (!jsRes.data.includes('const FLEET_ITEMS_PER_PAGE = 12;')) throw new Error('Missing FLEET_ITEMS_PER_PAGE = 12');

  console.log('✅ All live HTTP verification checks passed successfully!');
}

verify().catch((e) => {
  console.error('Verification failed:', e.message);
  process.exit(1);
});
