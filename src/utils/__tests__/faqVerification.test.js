// ============================================================================
// RYVON FAQ PAGE & KNOWLEDGE BASE VERIFICATION SUITE
// ============================================================================
import assert from 'assert';
import { FAQ_CATEGORIES, FAQ_DATA } from '../../data/faqs.js';

console.log('====================================================');
console.log('📖 RUNNING RYVON FAQ VERIFICATION SUITE');
console.log('====================================================\n');

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exit(1);
  }
}

// GROUP 1: CATEGORY DIRECTORY STRUCTURE
console.log('--- TEST GROUP 1: CATEGORY DIRECTORY STRUCTURE ---');
test('FAQ Categories list contains exactly 8 categories', () => {
  assert.strictEqual(FAQ_CATEGORIES.length, 8);
});

test('All reference category IDs exist in exact order', () => {
  const expectedIds = ['all', 'docs', 'pricing', 'insurance', 'fleet', 'booking', 'expeditions', 'support'];
  const actualIds = FAQ_CATEGORIES.map(c => c.id);
  assert.deepStrictEqual(actualIds, expectedIds);
});

test('Category labels match reference screenshot naming', () => {
  const expectedLabels = [
    'All Questions',
    'Licenses & Docs',
    'Security & Escrow',
    'Insurance & Damage',
    'Fleet & Equipment',
    'Trip & Booking',
    'High-Altitude & Expeditions',
    'Roadside & SOS'
  ];
  const actualLabels = FAQ_CATEGORIES.map(c => c.label);
  assert.deepStrictEqual(actualLabels, expectedLabels);
});

// GROUP 2: CONTENT INTEGRITY & GRAPHIC FLAGS
console.log('\n--- TEST GROUP 2: QUESTION INVENTORY & GRAPHICS ---');
test('FAQ inventory contains at least 24 authentic questions', () => {
  assert(FAQ_DATA.length >= 24, `Expected at least 24 questions, got ${FAQ_DATA.length}`);
});

test('First question has document graphic indicator', () => {
  assert.strictEqual(FAQ_DATA[0].hasDocGraphic, true);
  assert(FAQ_DATA[0].q.includes('documents and driving licence'));
});

test('Every question has question text, answer HTML, and category tag', () => {
  FAQ_DATA.forEach((item, idx) => {
    assert(item.q && item.q.length > 5, `Item at index ${idx} missing question text`);
    assert(item.a && item.a.length > 10, `Item at index ${idx} missing answer HTML`);
    assert(item.cat && item.cat.length > 0, `Item at index ${idx} missing category`);
    assert(item.tag && item.tag.length > 0, `Item at index ${idx} missing tag`);
  });
});

// GROUP 3: SEARCH & FILTER LOGIC
console.log('\n--- TEST GROUP 3: SEARCH & FILTERING CAPABILITIES ---');
test('Search for "deposit" returns escrow and refund questions', () => {
  const results = FAQ_DATA.filter(f => `${f.q} ${f.a}`.toLowerCase().includes('deposit'));
  assert(results.length >= 3, `Expected at least 3 deposit results, got ${results.length}`);
});

test('Search for "license" returns driving licence questions', () => {
  const results = FAQ_DATA.filter(f => `${f.q} ${f.a}`.toLowerCase().includes('licence') || `${f.q} ${f.a}`.toLowerCase().includes('license'));
  assert(results.length >= 4, `Expected at least 4 licence results, got ${results.length}`);
});

test('Search for "SOS" returns roadside assistance questions', () => {
  const results = FAQ_DATA.filter(f => `${f.q} ${f.a}`.toLowerCase().includes('sos'));
  assert(results.length >= 2, `Expected at least 2 SOS results, got ${results.length}`);
});

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passCount} PASSED, 0 FAILED`);
console.log('====================================================');
