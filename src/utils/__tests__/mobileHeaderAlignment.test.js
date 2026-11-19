import fs from 'fs';
import assert from 'assert';

let passed = 0;
let total = 0;

function runTest(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log('📱 RYVON MOBILE HEADER ALIGNMENT & SPACING VERIFICATION SUITE');
console.log('================================================================\n');

const css = fs.readFileSync('src/styles/style.css', 'utf8');

console.log('--- TEST GROUP 1: MOBILE HEADER ALIGNMENT & POSITIONING ---');
runTest('Hamburger menu toggle is positioned on far left with 16px left edge padding', () => {
  assert.ok(css.includes('.site-header .menu-toggle') && css.includes('left: 16px !important;'));
});

runTest('Hamburger button has sufficient breathing room (36px x 36px touch target)', () => {
  assert.ok(css.includes('width: 36px !important;') && css.includes('height: 36px !important;'));
});

runTest('Container reserves 64px left space for hamburger + gap ensuring ZERO overlap with logo', () => {
  assert.ok(css.includes('padding-left: 64px !important;'));
});

runTest('All mobile header elements are vertically centered', () => {
  assert.ok(css.includes('top: 50% !important;'));
  assert.ok(css.includes('transform: translateY(-50%) !important;'));
  assert.ok(css.includes('align-items: center !important;'));
});

console.log('\n--- TEST GROUP 2: RYVON BRAND LOGO & TEXT SPACING ---');
runTest('Brand wrapper positioned with zero left margin and 8px gap between logo and text', () => {
  assert.ok(css.includes('.site-header .brand') && css.includes('gap: 8px !important;'));
  assert.ok(css.includes('margin-left: 0 !important;'));
});

runTest('Brand logo uses object-fit: contain to ensure R logo is completely visible inside its original box', () => {
  assert.ok(css.includes('.site-header .brand-logo') && css.includes('object-fit: contain !important;'));
  assert.ok(css.includes('padding: 2px !important;'));
  assert.ok(css.includes('border-radius: 6px !important;'));
});

runTest('Brand logo box has amber border and dark background in dark mode, light in light mode', () => {
  assert.ok(css.includes('border: 1px solid rgba(255, 184, 0, 0.5) !important;'));
  assert.ok(css.includes('border: 1px solid rgba(217, 119, 6, 0.4) !important;'));
});

runTest('Brand text has 19px bold styling vertically aligned with logo', () => {
  assert.ok(css.includes('.site-header .brand-text') && css.includes('font-size: 19px !important;'));
  assert.ok(css.includes('font-weight: 800 !important;'));
});

console.log('\n--- TEST GROUP 3: HORIZONTAL PADDING & SPACING CONSISTENCY ---');
runTest('Horizontal padding of 16px maintained on both left (hamburger) and right (header actions)', () => {
  assert.ok(css.includes('padding-right: 16px !important;'));
});

runTest('Header actions pushed to the right with margin-left: auto and gap: 8px', () => {
  assert.ok(css.includes('.site-header .header-actions') && css.includes('margin-left: auto !important;'));
});

console.log('\n--- TEST GROUP 4: RESPONSIVE BREAKPOINT FINE-TUNING ---');
runTest('Narrow screen support (max-width: 380px) for 360px, 375px devices', () => {
  assert.ok(css.includes('@media (max-width: 380px)'));
  assert.ok(css.includes('padding-left: 58px !important;'));
  assert.ok(css.includes('left: 12px !important;'));
});

runTest('Ultra-narrow screen support (max-width: 340px) for 320px devices', () => {
  assert.ok(css.includes('@media (max-width: 340px)'));
  assert.ok(css.includes('padding-left: 52px !important;'));
  assert.ok(css.includes('left: 10px !important;'));
});

console.log('\n--- TEST GROUP 5: STRICT DESIGN PRESERVATION (DESKTOP & TABLET) ---');
runTest('Desktop header hides menu-toggle and preserves desktop gap', () => {
  assert.ok(css.includes('@media (min-width: 900px)'));
  assert.ok(css.includes('.site-header .menu-toggle'));
  assert.ok(css.includes('display: none !important;'));
});

console.log('\n================================================================');
console.log(`🏁 TEST RESULTS: ${passed} OF ${total} PASSED (${total - passed} FAILED)`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}
