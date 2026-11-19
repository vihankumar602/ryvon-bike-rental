/**
 * 📞 RYVON CONTACT PAGE VERIFICATION TEST SUITE
 * Validates the recreated 24/7 Ride Command Hub Contact Page against the reference specification:
 * - Hero section assets and breadcrumbs
 * - 3-column layout integrity
 * - Send a Message form inputs and icons
 * - Direct Assistance channels and live status card
 * - Fleet Assurance checklist, mountain camp tent, and stats trio
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

let passedTests = 0;
let totalTests = 0;

function runTest(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log('====================================================');
console.log('📞 RUNNING RYVON CONTACT PAGE VERIFICATION SUITE');
console.log('====================================================\n');

console.log('--- TEST GROUP 1: ASSETS & PHOTOGRAPHIC INTEGRITY ---');

runTest('Hero backdrop image exists on disk', () => {
  const file = path.resolve('public/assets/images/contact-hero-backdrop.jpg');
  assert.ok(fs.existsSync(file), 'contact-hero-backdrop.jpg missing');
  const stat = fs.statSync(file);
  assert.ok(stat.size > 20000, `Image size too small: ${stat.size}`);
});

runTest('Headset waveform graphic exists on disk', () => {
  const file = path.resolve('public/assets/images/contact-headset-wave.png');
  assert.ok(fs.existsSync(file), 'contact-headset-wave.png missing');
  const stat = fs.statSync(file);
  assert.ok(stat.size > 10000, `Image size too small: ${stat.size}`);
});

runTest('Camp tent mountain graphic exists on disk', () => {
  const file = path.resolve('public/assets/images/contact-tent-camp.png');
  assert.ok(fs.existsSync(file), 'contact-tent-camp.png missing');
  const stat = fs.statSync(file);
  assert.ok(stat.size > 10000, `Image size too small: ${stat.size}`);
});

console.log('\n--- TEST GROUP 2: CONTACT COMPONENT MARKUP & CONTENT ---');

const contactCode = fs.readFileSync('src/pages/Contact.jsx', 'utf8');

runTest('Hero section contains 24/7 Ride Command Hub heading', () => {
  assert.ok(contactCode.includes('24/7 Ride'), 'Missing 24/7 Ride in hero');
  assert.ok(contactCode.includes('Command Hub.'), 'Missing Command Hub. in hero');
});

runTest('Hero section contains 3 pill chips (24/7 Support, Route Guidance, Roadside Help)', () => {
  assert.ok(contactCode.includes('24/7 Support'), 'Missing 24/7 Support chip');
  assert.ok(contactCode.includes('Route Guidance'), 'Missing Route Guidance chip');
  assert.ok(contactCode.includes('Roadside Help'), 'Missing Roadside Help chip');
});

runTest('Form contains full name, contact number, email, subject, message, and submit CTA', () => {
  assert.ok(contactCode.includes('id="contact-name"'), 'Missing contact-name input');
  assert.ok(contactCode.includes('id="contact-phone"'), 'Missing contact-phone input');
  assert.ok(contactCode.includes('id="contact-email"'), 'Missing contact-email input');
  assert.ok(contactCode.includes('id="contact-subject"'), 'Missing contact-subject select');
  assert.ok(contactCode.includes('id="contact-message"'), 'Missing contact-message textarea');
  assert.ok(contactCode.includes('Send Message →'), 'Missing Send Message submit button');
});

runTest('Direct Assistance channels contain Hotline, Email Support, and Headquarters', () => {
  assert.ok(contactCode.includes('+91 1800-RYVON-RIDE'), 'Missing Hotline phone number');
  assert.ok(contactCode.includes('support@ryvon.com'), 'Missing support email');
  assert.ok(contactCode.includes('Indiranagar Tech Corridor'), 'Missing Bengaluru headquarters');
  assert.ok(contactCode.includes('24/7 Dispatch Online'), 'Missing live status indicator');
});

runTest('Fleet Assurance contains 4 guarantee points and 3-stat trio panel', () => {
  assert.ok(contactCode.includes('Verified &amp; insured fleet') || contactCode.includes('Verified & insured fleet'), 'Missing insured fleet point');
  assert.ok(contactCode.includes('32-point inspection'), 'Missing 32-point inspection');
  assert.ok(contactCode.includes('Real-time telematics'), 'Missing real-time telematics');
  assert.ok(contactCode.includes('Expert travel support'), 'Missing expert travel support');
  assert.ok(contactCode.includes('99.9%'), 'Missing 99.9% uptime stat');
  assert.ok(contactCode.includes('10K+'), 'Missing 10K+ riders assisted stat');
});

console.log('\n--- TEST GROUP 3: STYLESHEET STRICT SCOPING ---');

const css = fs.readFileSync('src/styles/style.css', 'utf8');

runTest('Stylesheet has scoped rules for .ryvon-contact-page and .contact-master-hub', () => {
  assert.ok(css.includes('.ryvon-contact-page'), 'Missing .ryvon-contact-page');
  assert.ok(css.includes('.contact-master-hub'), 'Missing .contact-master-hub');
  assert.ok(css.includes('.contact-3col-master-layout'), 'Missing .contact-3col-master-layout');
  assert.ok(css.includes('.contact-form-card-master'), 'Missing .contact-form-card-master');
  assert.ok(css.includes('.contact-assurance-card-master'), 'Missing .contact-assurance-card-master');
});

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${totalTests - passedTests} FAILED`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
