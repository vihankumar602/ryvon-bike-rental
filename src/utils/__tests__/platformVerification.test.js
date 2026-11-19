import {
  getTodayDateString,
  getTomorrowDateString,
  getMinReturnDate,
  calculateDurationDays,
  validateBookingDates,
  addDays
} from '../dateValidation.js';
import { bikes } from '../../data/bikes.js';
import { getSeedBookings } from '../../data/seedBookings.js';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🧪 RUNNING RYVON PLATFORM VERIFICATION TEST SUITE');
console.log('====================================================\n');

let failedTests = 0;
let passedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

// ---------------------------------------------------------------------
// TEST 1: GLOBAL DATE VALIDATION
// ---------------------------------------------------------------------
console.log('--- TEST GROUP 1: GLOBAL BOOKING DATE VALIDATION ---');
const today = getTodayDateString();
const tomorrow = getTomorrowDateString();
const in3Days = addDays(today, 3);
const pastDate = '2024-01-01';

// 1.1 Valid range
const validRes = validateBookingDates(today, in3Days);
assert(validRes.isValid === true, 'Valid date combination accepted');
assert(validRes.days === 3, `Calculated duration is 3 days (got ${validRes.days})`);
assert(validRes.error === null, 'No error on valid date combination');

// 1.2 Return date EQUAL to pickup date
const equalRes = validateBookingDates(today, today);
assert(equalRes.isValid === false, 'Return date equal to pickup date is rejected');
assert(equalRes.error && equalRes.error.includes('later than pickup date'), 'Clear inline error for return == pickup');

// 1.3 Return date BEFORE pickup date
const earlierRes = validateBookingDates(in3Days, today);
assert(earlierRes.isValid === false, 'Return date earlier than pickup date is rejected');
assert(earlierRes.error && earlierRes.error.includes('later than pickup date'), 'Clear inline error for return < pickup');

// 1.4 Pickup date in past
const pastRes = validateBookingDates(pastDate, tomorrow);
assert(pastRes.isValid === false, 'Past pickup date is rejected');
assert(pastRes.error && pastRes.error.includes('past'), 'Clear inline error for past pickup');

// 1.5 Empty dates
const emptyRes1 = validateBookingDates('', tomorrow);
assert(emptyRes1.isValid === false, 'Empty pickup date is rejected');

const emptyRes2 = validateBookingDates(today, '');
assert(emptyRes2.isValid === false, 'Empty return date is rejected');

// 1.6 getMinReturnDate
const minRet = getMinReturnDate(today);
assert(minRet === tomorrow, `getMinReturnDate(today) returns tomorrow (${minRet})`);

// ---------------------------------------------------------------------
// TEST 2: EXPLORE FLEET & INVENTORY INTEGRITY
// ---------------------------------------------------------------------
console.log('\n--- TEST GROUP 2: FLEET INVENTORY & CATEGORIES ---');

assert(bikes.length >= 34, `Fleet has substantial inventory (${bikes.length} bikes)`);

// Check categories
const requiredCategories = ['Sport', 'Cruiser', 'Adventure', 'Roadster', 'Scooter', 'Touring'];
const categoryCounts = {};
bikes.forEach(b => {
  categoryCounts[b.type] = (categoryCounts[b.type] || 0) + 1;
});

requiredCategories.forEach(cat => {
  assert(categoryCounts[cat] > 0, `Category '${cat}' exists in fleet with ${categoryCounts[cat]} vehicles`);
});

// Check unique vehicle names and images
const bikeNames = new Set();
const bikeIds = new Set();
const bikeImages = new Set();
let hasDuplicateNames = false;
let hasDuplicateIds = false;
let hasDuplicateImages = false;

bikes.forEach(b => {
  if (bikeNames.has(b.name.toLowerCase())) {
    console.error(`Duplicate name found: ${b.name}`);
    hasDuplicateNames = true;
  }
  bikeNames.add(b.name.toLowerCase());

  if (bikeIds.has(b.id)) {
    console.error(`Duplicate id found: ${b.id}`);
    hasDuplicateIds = true;
  }
  bikeIds.add(b.id);

  if (b.imgFile) {
    if (bikeImages.has(b.imgFile)) {
      console.error(`Duplicate image found: ${b.imgFile} on ${b.name}`);
      hasDuplicateImages = true;
    }
    bikeImages.add(b.imgFile);
  }

  // Specifications completeness check
  if (!b.engine || !b.power || !b.price || !b.deposit || !b.transmission) {
    console.error(`Incomplete specs on: ${b.name}`);
  }
});

assert(!hasDuplicateNames, 'All vehicle names are unique');
assert(!hasDuplicateIds, 'All vehicle IDs are unique');
assert(!hasDuplicateImages, 'All vehicle images are unique (no reused images)');

// Verify that all images actually exist on disk in public/assets/images
let missingImages = 0;
bikes.forEach(b => {
  if (b.imgFile) {
    const pubPath = path.join('public', 'assets', 'images', b.imgFile);
    if (!fs.existsSync(pubPath)) {
      console.error(`Missing image file on disk: ${pubPath}`);
      missingImages++;
    }
  }
});
assert(missingImages === 0, 'All referenced motorcycle image files exist on disk');

// ---------------------------------------------------------------------
// TEST 3: JOURNEY LOGS & SEED BOOKINGS
// ---------------------------------------------------------------------
console.log('\n--- TEST GROUP 3: JOURNEY LOGS & BOOKING CONSISTENCY ---');

const seeds = getSeedBookings();
assert(seeds.length >= 3, `Seed bookings present (${seeds.length} records)`);

seeds.forEach(s => {
  assert(!!s.id && !!s.bikeName && !!s.pickupCity && !!s.startDate && !!s.endDate, `Booking #${s.id} has all required journey telemetry`);
  assert(s.total > 0 && s.deposit > 0, `Booking #${s.id} has positive financial totals`);
});

// ---------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------
console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
