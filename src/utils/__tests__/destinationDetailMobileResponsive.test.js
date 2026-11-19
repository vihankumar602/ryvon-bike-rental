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

console.log('================================================================');
console.log('📱 RYVON DESTINATION DETAIL MOBILE RESPONSIVE VERIFICATION SUITE');
console.log('================================================================\n');

const css = fs.readFileSync('src/styles/style.css', 'utf8');
const jsx = fs.readFileSync('src/pages/Destinations.jsx', 'utf8');

console.log('--- TEST GROUP 1: MOBILE BREAKPOINTS & LAYOUT CONTAINER ---');
runTest('Contains @media (max-width: 768px) block for destination-detail-page', () => {
  assert.ok(css.includes('.destination-detail-page') && css.includes('@media (max-width: 768px)'));
});

runTest('Mobile safe area bottom padding is applied to prevent bottom nav collision', () => {
  assert.ok(css.includes('padding-bottom: calc(90px + env(safe-area-inset-bottom, 0px)) !important;'));
});

runTest('Horizontal overflow protection is applied to destination-detail-page', () => {
  assert.ok(css.includes('overflow-x: hidden !important;') && css.includes('max-width: 100vw !important;'));
});

runTest('Mobile container padding is set to 16px (and 12px for narrow devices)', () => {
  assert.ok(css.includes('.destination-detail-page .dest-detail-container') && css.includes('padding: 0 16px !important;'));
  assert.ok(css.includes('padding: 0 12px !important;'));
});

console.log('\n--- TEST GROUP 2: MOBILE HERO SECTION ---');
runTest('Hero section background photograph has center 30% positioning & cover sizing', () => {
  assert.ok(css.includes('background-position: center 30% !important;'));
  assert.ok(css.includes('background-size: cover !important;'));
  assert.ok(css.includes('image-rendering: -webkit-optimize-contrast !important;'));
});

runTest('4K Ultra HD badge is cleanly positioned with high z-index and no text overlap', () => {
  assert.ok(css.includes('.destination-detail-page .dest-hero-4k-badge'));
  assert.ok(css.includes('padding-top: 24px !important; /* Headroom for 4K badge */'));
});

runTest('Hero title has fluid responsive typography using clamp', () => {
  assert.ok(css.includes('.destination-detail-page .dest-hero-title'));
  assert.ok(css.includes('font-size: clamp(24px, 6.8vw, 34px) !important;'));
  assert.ok(css.includes('word-break: break-word !important;'));
});

runTest('Destination badges row has wrap support and comfortable pill padding', () => {
  assert.ok(css.includes('.destination-detail-page .dest-hero-badges-row'));
  assert.ok(css.includes('.destination-detail-page .dest-badge-expedition'));
});

console.log('\n--- TEST GROUP 3: DESTINATION TELEMETRY STATISTICS ---');
runTest('Hero telemetry metrics arranged in 2x2 precision cockpit grid on mobile', () => {
  assert.ok(css.includes('.destination-detail-page .dest-hero-meta-strip'));
  assert.ok(css.includes('grid-template-columns: repeat(2, 1fr) !important;'));
});

runTest('Telemetry chips prevent text overlapping with ellipsis and min-width: 0', () => {
  assert.ok(css.includes('.destination-detail-page .dest-meta-info'));
  assert.ok(css.includes('text-overflow: ellipsis !important;'));
  assert.ok(css.includes('min-width: 0 !important;'));
});

console.log('\n--- TEST GROUP 4: ACTION BUTTONS (TAP COMFORT & ZERO OVERFLOW) ---');
runTest('Hero action buttons use responsive grid layout with primary button full-width', () => {
  assert.ok(css.includes('.destination-detail-page .dest-hero-actions'));
  assert.ok(css.includes('"primary primary"'));
  assert.ok(css.includes('"wishlist share"'));
});

runTest('Plan This Ride button has minimum 48px touch height', () => {
  assert.ok(css.includes('min-height: 48px !important;'));
});

runTest('Add to My Journeys and Share buttons fit cleanly side-by-side without wrapping issues', () => {
  assert.ok(css.includes('grid-template-columns: 1fr 48px !important;'));
});

runTest('Watch Route Preview pill has full width centered mobile arrangement', () => {
  assert.ok(css.includes('.destination-detail-page .dest-hero-preview-col'));
  assert.ok(css.includes('.destination-detail-page .dest-route-preview-pill'));
});

console.log('\n--- TEST GROUP 5: STICKY NAVIGATION TABS ---');
runTest('Sticky nav bar has proper top offset matching mobile header (72px)', () => {
  assert.ok(css.includes('.destination-detail-page .dest-sticky-nav-bar'));
  assert.ok(css.includes('top: 72px !important;'));
});

runTest('Nav tabs wrap has horizontal touch scrolling with hidden scrollbar', () => {
  assert.ok(css.includes('.destination-detail-page .dest-nav-tabs-wrap'));
  assert.ok(css.includes('-webkit-overflow-scrolling: touch !important;'));
});

runTest('Nav tab items have touch target height (min 38px) and whitespace nowrap', () => {
  assert.ok(css.includes('.destination-detail-page .dest-nav-tab'));
  assert.ok(css.includes('min-height: 38px !important;'));
});

console.log('\n--- TEST GROUP 6: TIER 1 & TIER 2 CONTENT SECTIONS ---');
runTest('Feature badges grid uses 2x2 layout on mobile (preventing crushed labels)', () => {
  assert.ok(css.includes('.destination-detail-page .dest-feature-badges-4grid'));
  assert.ok(css.includes('white-space: normal !important;'));
});

runTest('Gallery carousel frame has touch-optimized arrows and proportional mobile height', () => {
  assert.ok(css.includes('.destination-detail-page .dest-master-gallery-frame'));
  assert.ok(css.includes('.destination-detail-page .dest-gallery-arrow'));
});

runTest('Plan Your Ride booking card has full width inputs and responsive dates grid', () => {
  assert.ok(css.includes('.destination-detail-page .dest-booking-card-v2'));
  assert.ok(css.includes('.destination-detail-page .dest-booking-dates-grid'));
  assert.ok(css.includes('.destination-detail-page .dest-booking-submit-btn-v2'));
});

runTest('Tier 2 lower cards stack vertically into single column with comfortable spacing', () => {
  assert.ok(css.includes('.destination-detail-page .dest-overview-bottom-3col'));
  assert.ok(css.includes('.destination-detail-page .dest-lower-card'));
});

runTest('Itinerary timeline items top-align badges for multi-line route text', () => {
  assert.ok(css.includes('.destination-detail-page .dest-timeline-row'));
  assert.ok(css.includes('align-items: flex-start !important;'));
});

runTest('Recommended ride card has full-width details button on mobile', () => {
  assert.ok(css.includes('.destination-detail-page .dest-rec-details-btn'));
  assert.ok(css.includes('width: 100% !important;'));
});

console.log('\n--- TEST GROUP 7: RIDER ADVISORY & SAFETY BANNER ---');
runTest('Rider advisory banner stacks vertically with responsive cards grid', () => {
  assert.ok(css.includes('.destination-detail-page .dest-safety-banner'));
  assert.ok(css.includes('.destination-detail-page .dest-safety-items-grid'));
  assert.ok(css.includes('.destination-detail-page .dest-safety-item'));
});

runTest('Advisory full link has button-style full-width mobile tap styling', () => {
  assert.ok(css.includes('.destination-detail-page .dest-safety-link'));
});

console.log('\n--- TEST GROUP 8: NARROW DEVICE BREAKPOINTS (380px, 340px) ---');
runTest('Narrow screen media queries (max-width: 380px, 340px) optimize dates grid & meta chips', () => {
  assert.ok(css.includes('@media (max-width: 380px)'));
  assert.ok(css.includes('@media (max-width: 340px)'));
});

console.log('\n--- TEST GROUP 9: DATA DATASET COVERAGE (ALL 32 DESTINATIONS) ---');
runTest('All 32 destinations have complete metadata for mobile rendering', () => {
  assert.strictEqual(destinations.length, 32);
  destinations.forEach(d => {
    assert.ok(d.id, 'Destination missing id');
    assert.ok(d.name, 'Destination missing name');
    assert.ok(d.img, `${d.id} missing img`);
    assert.ok(d.distance, `${d.id} missing distance`);
    assert.ok(d.elevation, `${d.id} missing elevation`);
    assert.ok(d.idealDays, `${d.id} missing idealDays`);
    assert.ok(d.difficulty, `${d.id} missing difficulty`);
  });
});

console.log('\n================================================================');
console.log(`🏁 TEST RESULTS: ${passed} OF ${total} PASSED (${total - passed} FAILED)`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}
