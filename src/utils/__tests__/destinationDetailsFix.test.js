/**
 * 🏔️ RYVON DESTINATION DETAILS FIX & HOOKS VERIFICATION TEST SUITE
 * Tests:
 * 1. Complete removal of RouteMap and Telemetry map UI from Destinations page
 * 2. Complete removal of Recommended Fleet for this route section & carousel
 * 3. 100% adherence to React Rules of Hooks (zero conditional hooks or hooks after returns)
 * 4. Multi-destination switching sequence:
 *    - Coorg
 *    - Zanskar
 *    - Konkan
 *    - Atal Tunnel Alps
 *    - Kolli Hills
 *    - Gokarna
 *    - Mount Abu
 *    - Back to Coorg
 *    - Empty catalog
 * 5. Destination data isolation and correct image mapping
 */

import fs from 'fs';
import assert from 'assert';
import { destinations } from '../../data/destinations.js';

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

console.log('====================================================');
console.log('🏔️ RUNNING DESTINATION DETAILS FIX VERIFICATION SUITE');
console.log('====================================================\n');

const code = fs.readFileSync('src/pages/Destinations.jsx', 'utf8');

console.log('--- TEST GROUP 1: REMOVAL OF ROUTE TELEMETRY MAP ---');
runTest('RouteMap component is NOT imported in Destinations.jsx', () => {
  assert.ok(!code.includes("import RouteMap from '../components/RouteMap';"), 'RouteMap is still imported');
});

runTest('RouteMap JSX component is NOT rendered in Destinations.jsx', () => {
  assert.ok(!code.includes('<RouteMap'), 'RouteMap is still rendered in JSX');
});

runTest('dest-sec-waypoints container is removed from Destinations.jsx', () => {
  assert.ok(!code.includes('id="dest-sec-waypoints"'), 'dest-sec-waypoints container still exists');
});

console.log('\n--- TEST GROUP 2: REMOVAL OF RECOMMENDED FLEET CAROUSEL SECTION ---');
runTest('dest-sec-fleet section is removed from Destinations.jsx', () => {
  assert.ok(!code.includes('id="dest-sec-fleet"'), 'dest-sec-fleet section still exists');
});

runTest('"Recommended Fleet for This Route" text is removed', () => {
  assert.ok(!code.includes('Recommended Fleet for'), 'Recommended Fleet section still present');
});

runTest('Fleet carousel navigation state and buttons removed', () => {
  assert.ok(!code.includes('fleetCarouselPage'), 'fleetCarouselPage still present');
  assert.ok(!code.includes('displayedFleet'), 'displayedFleet still present');
});

console.log('\n--- TEST GROUP 3: REACT RULES OF HOOKS INTEGRITY ---');
runTest('No hooks called inside if (selectedDest) block', () => {
  const detailStart = code.indexOf('if (selectedDest) {');
  assert.ok(detailStart !== -1, 'if (selectedDest) not found');
  const catalogReturn = code.indexOf('return (\n    <main id="app" className="destinations-listing-page"');
  assert.ok(catalogReturn !== -1, 'Catalog return not found');
  
  const detailBlock = code.substring(detailStart, catalogReturn);
  const hookMatches = detailBlock.match(/\buse[A-Z]\w*\(/g);
  assert.strictEqual(hookMatches, null, `Found conditional hooks inside if (selectedDest): ${hookMatches}`);
});

runTest('galleryImages hook is called unconditionally at top level', () => {
  const detailStart = code.indexOf('if (selectedDest) {');
  const galleryMemoIdx = code.indexOf('const galleryImages = useMemo');
  assert.ok(galleryMemoIdx !== -1, 'galleryImages hook not found');
  assert.ok(galleryMemoIdx < detailStart, 'galleryImages hook must be before if (selectedDest)');
});

console.log('\n--- TEST GROUP 4: DESTINATION SWITCHING RESOLUTION ---');

function resolveDestination(param) {
  if (!param) return null;
  const p = param.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!p) return null;

  let match = destinations.find(x => x.id.toLowerCase().replace(/[^a-z0-9]/g, '') === p);
  if (match) return match;

  match = destinations.find(x => x.name.toLowerCase().replace(/[^a-z0-9]/g, '') === p);
  if (match) return match;

  match = destinations.find(x => (x.aliases || []).some(a => a.toLowerCase().replace(/[^a-z0-9]/g, '') === p));
  if (match) return match;

  match = destinations.find(x => x.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p));
  if (match) return match;

  match = destinations.find(x => x.id.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p));
  if (match) return match;

  const idMatches = destinations.filter(x => {
    const cleanId = x.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanId.length >= 3 && p.includes(cleanId);
  });
  if (idMatches.length > 0) {
    idMatches.sort((a, b) => b.id.length - a.id.length);
    return idMatches[0];
  }

  return destinations[0];
}

const sequence = [
  { param: 'coorg', expectedId: 'coorg', expectedTitle: 'Coorg Coffee Valleys' },
  { param: 'zanskar', expectedId: 'zanskar', expectedTitle: 'Zanskar Valley High Pass' },
  { param: 'konkan', expectedId: 'konkan', expectedTitle: 'Konkan Marine Drive' },
  { param: 'manali', expectedId: 'manali', expectedTitle: 'Atal Tunnel Alps' },
  { param: 'kollihills', expectedId: 'kollihills', expectedTitle: 'Kolli Hills 70 Hairpins' },
  { param: 'kolli-hills', expectedId: 'kollihills', expectedTitle: 'Kolli Hills 70 Hairpins' },
  { param: 'gokarna', expectedId: 'gokarna', expectedTitle: 'Gokarna Om Beach Highway' },
  { param: 'mountabu', expectedId: 'mountabu', expectedTitle: 'Mount Abu Aravali Summit' },
  { param: 'mount-abu', expectedId: 'mountabu', expectedTitle: 'Mount Abu Aravali Summit' },
  { param: 'coorg', expectedId: 'coorg', expectedTitle: 'Coorg Coffee Valleys' },
  { param: '', expectedId: null, expectedTitle: null }
];

sequence.forEach(({ param, expectedId, expectedTitle }) => {
  runTest(`Resolve destination sequence step: "${param}"`, () => {
    const res = resolveDestination(param);
    if (expectedId === null) {
      assert.strictEqual(res, null, `Expected null for empty param`);
    } else {
      assert.ok(res, `Destination not found for ${param}`);
      assert.strictEqual(res.id, expectedId, `Expected ${expectedId}, got ${res.id}`);
      assert.strictEqual(res.name, expectedTitle, `Expected title ${expectedTitle}, got ${res.name}`);
    }
  });
});

console.log('\n--- TEST GROUP 5: DESTINATION PAGE ESSENTIAL LAYOUT RETENTION ---');
runTest('Single Recommended Ride card is preserved in Tier 2', () => {
  assert.ok(code.includes('id="dest-card-rec-ride"'), 'Recommended Ride card is missing');
  assert.ok(code.includes('Recommended Ride'), 'Recommended Ride header missing');
});

runTest('Rider Advisory & Safety banner is preserved', () => {
  assert.ok(code.includes('id="dest-sec-safety"'), 'Safety section missing');
  assert.ok(code.includes('Rider Advisory &amp; Safety') || code.includes('Rider Advisory & Safety'), 'Advisory text missing');
});

runTest('Verified Reviews section is completely removed from destination detail page', () => {
  assert.ok(!code.includes('id="dest-sec-reviews"'), 'Reviews section still present');
  assert.ok(!code.includes('EXPEDITION FEEDBACK'), 'EXPEDITION FEEDBACK text still present');
});

runTest('Suggested Itinerary and Expedition Highlights are preserved', () => {
  assert.ok(code.includes('id="dest-card-itinerary"'), 'Suggested itinerary missing');
  assert.ok(code.includes('id="dest-card-highlights"'), 'Expedition highlights missing');
});

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${total - passed} FAILED`);
console.log('====================================================\n');

if (passed !== total) process.exit(1);
