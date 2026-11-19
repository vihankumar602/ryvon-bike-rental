import { destinations, DEST_CATEGORIES, getCategoryCounts, matchesDestinationSeason } from '../../data/destinations.js';

console.log('====================================================');
console.log('🏔️ RUNNING RYVON DESTINATIONS VERIFICATION SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

// GROUP 1: CATALOG INVENTORY & SCREENSHOT ALIGNMENT
console.log('--- TEST GROUP 1: CATALOG INVENTORY & SCREENSHOT ROW 1 ---');
assert(destinations.length === 32, `Catalog has exactly 32 destinations (got ${destinations.length})`);
assert(destinations[0].id === 'srinagar-to-gulmarg', `Card 1 is Srinagar to Gulmarg`);
assert(destinations[0].state === 'Jammu & Kashmir', `Card 1 state is Jammu & Kashmir`);
assert(destinations[1].id === 'coorg', `Card 2 is Coorg Coffee Valleys`);
assert(destinations[1].state === 'Karnataka', `Card 2 state is Karnataka`);
assert(destinations[2].id === 'jaipur', `Card 3 is Jaipur`);
assert(destinations[2].state === 'Rajasthan', `Card 3 state is Rajasthan`);
assert(destinations[3].id === 'jaipur-to-jaisalmer', `Card 4 is Jaipur to Jaisalmer`);
assert(destinations[3].state === 'Rajasthan', `Card 4 state is Rajasthan`);

// GROUP 2: CATEGORY INTEGRITY & COUNTS
console.log('\n--- TEST GROUP 2: CATEGORY COUNTS & DISTRIBUTION ---');
const counts = getCategoryCounts();
assert(counts.mountain >= 7, `Mountain category has >= 7 routes (got ${counts.mountain})`);
assert(counts.coastal >= 4, `Coastal category has >= 4 routes (got ${counts.coastal})`);
assert(counts.desert >= 5, `Desert category has >= 5 routes (got ${counts.desert})`);
assert(counts.forest >= 5, `Forest category has >= 5 routes (got ${counts.forest})`);
assert(DEST_CATEGORIES.length === 4, `4 Terrain categories defined`);

// GROUP 3: ASSET & TELEMETRY FIDELITY (NO WRONG OR LEAKING IMAGES)
console.log('\n--- TEST GROUP 3: DESTINATION DETAIL ASSET ISOLATION ---');
const gulmarg = destinations.find(d => d.id === 'srinagar-to-gulmarg');
const coorg = destinations.find(d => d.id === 'coorg');
const jaisalmer = destinations.find(d => d.id === 'jaipur-to-jaisalmer');
const spiti = destinations.find(d => d.id === 'spiti');

assert(gulmarg.img.includes('srinagar-gulmarg'), `Gulmarg uses dedicated snow resort image`);
assert(coorg.img.includes('coorg-chikmagalur'), `Coorg uses dedicated coffee valley waterfall image`);
assert(jaisalmer.img.includes('jaipur-jaisalmer'), `Jaisalmer uses dedicated Thar dunes image`);
assert(!coorg.gallery.some(img => img.includes('jaisalmer')), `Coorg gallery does NOT contain Jaisalmer images`);
assert(!jaisalmer.gallery.some(img => img.includes('coorg')), `Jaisalmer gallery does NOT contain Coorg images`);
assert(!gulmarg.gallery.some(img => img.includes('jaisalmer')), `Gulmarg gallery does NOT contain Jaisalmer images`);

// GROUP 4: ROUTE OVERVIEW & HIGHLIGHTS
console.log('\n--- TEST GROUP 4: ROUTE OVERVIEW WAYPOINTS ---');
assert(jaisalmer.routeOverview.length === 4, `Jaisalmer has 4 overview waypoints`);
assert(jaisalmer.routeOverview[0] === 'Jaipur' && jaisalmer.routeOverview[3] === 'Jaisalmer', `Jaisalmer waypoints connect Jaipur to Jaisalmer`);
assert(gulmarg.routeOverview[0] === 'Srinagar' && gulmarg.routeOverview[2] === 'Gulmarg', `Gulmarg waypoints connect Srinagar to Gulmarg`);
assert(coorg.routeOverview[0] === 'Bengaluru' && coorg.routeOverview[2] === 'Madikeri', `Coorg waypoints connect Bengaluru to Madikeri`);

// GROUP 5: SEASONS & FILTERS
console.log('\n--- TEST GROUP 5: FILTER FUNCTIONALITY ---');
assert(matchesDestinationSeason(jaisalmer, 'oct-mar'), `Jaisalmer matches oct-mar peak winter season`);
assert(matchesDestinationSeason(spiti, 'jun-oct'), `Spiti matches jun-oct high pass season`);
assert(matchesDestinationSeason(coorg, 'year-round'), `Coorg matches year-round season`);

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) process.exit(1);
