/**
 * 🏍️ RYVON EXPLORE FLEET PAGE VERIFICATION SUITE
 * Validates the recreated Explore Fleet page against the master reference specification:
 * - Preservation of global navbar
 * - Cinematic sunrise hero with "Find Your Next Ride", 4 trust metrics, and "How It Works" button
 * - Floating glassmorphism booking capsule with 3 tabs, search input, location, dates, and Search CTA
 * - 7 image-based category cards (All Bikes, Adventure, Cruiser, Sport, Touring, Scooter, Commuter)
 * - Refine Fleet sidebar (Daily budget, Brand, Category, Transmission, Availability)
 * - 4-column motorcycle cards grid with studio pedestal, badges, specs, rating, price, and Book Now CTA
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
console.log('🏍️ RUNNING RYVON EXPLORE FLEET VERIFICATION SUITE');
console.log('====================================================\n');

console.log('--- TEST GROUP 1: HERO ASSETS & STRUCTURE ---');

runTest('Hero backdrop image exists on disk in public/assets/images', () => {
  const file = path.resolve('public/assets/images/fleet-hero-sunrise.jpg');
  assert.ok(fs.existsSync(file), 'fleet-hero-sunrise.jpg missing');
  const stat = fs.statSync(file);
  assert.ok(stat.size > 50000, `Image size too small: ${stat.size}`);
});

const bikesCode = fs.readFileSync('src/pages/Bikes.jsx', 'utf8');

runTest('Hero section contains "Find Your Next Ride" headline with gold italic', () => {
  assert.ok(bikesCode.includes('Find Your'), 'Missing Find Your in hero');
  assert.ok(bikesCode.includes('Next Ride'), 'Missing Next Ride in hero');
  assert.ok(bikesCode.includes('fleet-headline-gold-italic'), 'Missing gold italic class on Next Ride');
});

runTest('Hero section contains 4 trust indicators and "How It Works" CTA', () => {
  assert.ok(bikesCode.includes('34+'), 'Missing 34+');
  assert.ok(bikesCode.includes('Premium Bikes'), 'Missing Premium Bikes');
  assert.ok(bikesCode.includes('100%'), 'Missing 100%');
  assert.ok(bikesCode.includes('Verified Fleet'), 'Missing Verified Fleet');
  assert.ok(bikesCode.includes('Expert'), 'Missing Expert');
  assert.ok(bikesCode.includes('Maintenance'), 'Missing Maintenance');
  assert.ok(bikesCode.includes('24/7'), 'Missing 24/7');
  assert.ok(bikesCode.includes('Ride Support'), 'Missing Ride Support');
  assert.ok(bikesCode.includes('How It Works'), 'Missing How It Works button');
});

console.log('\n--- TEST GROUP 2: GLASSMORPHISM BOOKING & SEARCH BAR ---');

runTest('Booking panel contains 3 tabs: Rent a Bike, Plan by Trip, Build with AI', () => {
  assert.ok(bikesCode.includes('Rent a Bike'), 'Missing Rent a Bike tab');
  assert.ok(bikesCode.includes('Plan by Trip'), 'Missing Plan by Trip tab');
  assert.ok(bikesCode.includes('Build with AI'), 'Missing Build with AI tab');
});

runTest('Booking panel contains search input, location selector, dates selector, and Search CTA', () => {
  assert.ok(bikesCode.includes('Search bikes (e.g., KTM Adventure, Royal Enfield...)'), 'Missing search placeholder');
  assert.ok(bikesCode.includes('Pickup Location'), 'Missing Pickup Location label');
  assert.ok(bikesCode.includes('Bengaluru'), 'Missing Bengaluru default location');
  assert.ok(bikesCode.includes('Rental Dates'), 'Missing Rental Dates label');
  assert.ok(bikesCode.includes('Search Fleet'), 'Missing Search Fleet CTA');
});

console.log('\n--- TEST GROUP 3: BROWSE BY RIDE STYLE (7 CATEGORIES) ---');

runTest('Browse by Ride Style section contains 7 categories matching reference screenshot', () => {
  assert.ok(bikesCode.includes('Browse by Ride Style'), 'Missing Browse by Ride Style heading');
  assert.ok(bikesCode.includes('View All'), 'Missing View All link');
  assert.ok(bikesCode.includes("'All Bikes'"), 'Missing All Bikes category');
  assert.ok(bikesCode.includes("'Adventure'"), 'Missing Adventure category');
  assert.ok(bikesCode.includes("'Cruiser'"), 'Missing Cruiser category');
  assert.ok(bikesCode.includes("'Sport'"), 'Missing Sport category');
  assert.ok(bikesCode.includes("'Touring'"), 'Missing Touring category');
  assert.ok(bikesCode.includes("'Scooter'"), 'Missing Scooter category');
  assert.ok(bikesCode.includes("'Commuter'"), 'Missing Commuter category');
});

console.log('\n--- TEST GROUP 4: REFINE FLEET SIDEBAR & LISTINGS ---');

runTest('Sidebar contains Daily budget slider, Brand, Category, Transmission, and Availability', () => {
  assert.ok(bikesCode.includes('Refine Fleet'), 'Missing Refine Fleet title');
  assert.ok(bikesCode.includes('Daily Budget'), 'Missing Daily Budget filter');
  assert.ok(bikesCode.includes('id="price"'), 'Missing price range slider input');
  assert.ok(bikesCode.includes('Brand'), 'Missing Brand filter');
  assert.ok(bikesCode.includes('Category'), 'Missing Category filter');
  assert.ok(bikesCode.includes('Transmission'), 'Missing Transmission filter');
  assert.ok(bikesCode.includes('Available Today'), 'Missing Available Today filter');
});

const bikeCardCode = fs.readFileSync('src/components/bikes/BikeCard.jsx', 'utf8');

runTest('Motorcycle card contains image, badges, title, specs, rating, price, and Book Now CTA', () => {
  assert.ok(bikeCardCode.includes('fleet-bike-card'), 'Missing fleet-bike-card class');
  assert.ok(bikeCardCode.includes('fleet-badge-category'), 'Missing category badge');
  assert.ok(bikeCardCode.includes('✓ VERIFIED'), 'Missing VERIFIED badge');
  assert.ok(bikeCardCode.includes('fleet-card-title'), 'Missing card title');
  assert.ok(bikeCardCode.includes('fleet-spec-item'), 'Missing spec pills');
  assert.ok(bikeCardCode.includes('rides'), 'Missing rides count');
  assert.ok(bikeCardCode.includes('Book Now →'), 'Missing Book Now button');
  assert.ok(bikeCardCode.includes('fleet-card-wish-btn'), 'Missing wishlist heart button');
});

console.log('\n--- TEST GROUP 5: STYLESHEET STRICT SCOPING ---');

const css = fs.readFileSync('src/styles/style.css', 'utf8');

runTest('Stylesheet has scoped rules for .ryvon-fleet-page and 4-column grid', () => {
  assert.ok(css.includes('.ryvon-fleet-page'), 'Missing .ryvon-fleet-page');
  assert.ok(css.includes('.fleet-cinematic-hero'), 'Missing .fleet-cinematic-hero');
  assert.ok(css.includes('.fleet-glass-booking-capsule'), 'Missing .fleet-glass-booking-capsule');
  assert.ok(css.includes('.fleet-categories-grid'), 'Missing .fleet-categories-grid');
  assert.ok(css.includes('.fleet-refine-sidebar'), 'Missing .fleet-refine-sidebar');
  assert.ok(css.includes('.fleet-motorcycle-grid'), 'Missing .fleet-motorcycle-grid');
});

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${totalTests - passedTests} FAILED`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
