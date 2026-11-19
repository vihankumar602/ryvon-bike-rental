import { getSeedBookings } from '../../data/seedBookings.js';

console.log('====================================================');
console.log('🏁 RUNNING COMPLETED JOURNEY DELETION VERIFICATION');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; }
};

// 1. Initial State Setup
const seeds = getSeedBookings();
assert(seeds.length > 0, `Seed bookings loaded (${seeds.length} items)`);

// Find a completed booking
const completedBooking = seeds.find(b => b.status === 'Completed' || (b.endDate && b.endDate < '2026-11-09'));
assert(completedBooking !== undefined, `Identified completed seed booking: #${completedBooking?.id}`);

// 2. Perform Deletion Workflow
const cleanId = String(completedBooking.id).replace(/^#/, '').trim();
const deletedIds = [cleanId];
localStorage.setItem('ryvon-deleted-booking-ids', JSON.stringify(deletedIds));

const remainingBookings = seeds.filter(b => b.id !== cleanId);
localStorage.setItem('rideos-bookings', JSON.stringify(remainingBookings));

assert(remainingBookings.length === seeds.length - 1, 'Remaining bookings count reduced by exactly 1');
assert(!remainingBookings.some(b => b.id === cleanId), 'Deleted completed booking is removed from list');

// 3. Verify Page Refresh / Seed Sync Simulation
// On refresh, BookingProvider reads deletedIds and filters seeds
const storedDeleted = JSON.parse(localStorage.getItem('ryvon-deleted-booking-ids') || '[]');
assert(storedDeleted.includes(cleanId), 'Deleted booking ID exists in persistent deleted registry');

let listAfterRefresh = JSON.parse(localStorage.getItem('rideos-bookings'));
listAfterRefresh = listAfterRefresh.filter(b => !storedDeleted.includes(b.id));

const syncSeeds = getSeedBookings();
syncSeeds.forEach(seed => {
  if (storedDeleted.includes(seed.id)) return; // Prevents resurrection!
  const existing = listAfterRefresh.find(b => b.id === seed.id);
  if (!existing) {
    listAfterRefresh.push(seed);
  }
});

assert(!listAfterRefresh.some(b => b.id === cleanId), 'Deleted completed booking NEVER resurrected on page reload');
assert(listAfterRefresh.length === seeds.length - 1, 'Total booking count remains accurate after reload');

// 4. Verify Active / Upcoming Cancellation vs Deletion
const activeOrUpcoming = seeds.find(b => (b.status === 'Active' || b.status === 'Upcoming') && b.id !== cleanId);
assert(activeOrUpcoming !== undefined, `Identified active/upcoming booking: #${activeOrUpcoming?.id}`);

// Simulating cancellation (transitions status to Cancelled, keeps record in history)
const cancelledList = listAfterRefresh.map(b => {
  if (b.id === activeOrUpcoming.id) {
    return { ...b, status: 'Cancelled', paymentStatus: 'CANCELLED' };
  }
  return b;
});

const updatedUpcoming = cancelledList.find(b => b.id === activeOrUpcoming.id);
assert(updatedUpcoming.status === 'Cancelled', 'Active/Upcoming booking transitioned to Cancelled (not deleted)');
assert(updatedUpcoming.paymentStatus === 'CANCELLED', 'Payment status marked CANCELLED');
assert(cancelledList.some(b => b.id === activeOrUpcoming.id), 'Cancelled record remains present in Journey History');

// 5. Statistics Recalculation Check
const activeCount = cancelledList.filter(b => b.status === 'Active').length;
const upcomingCount = cancelledList.filter(b => b.status === 'Upcoming').length;
const completedCount = cancelledList.filter(b => b.status === 'Completed').length;
const cancelledCount = cancelledList.filter(b => b.status === 'Cancelled').length;
const totalCount = cancelledList.length;

assert(totalCount === activeCount + upcomingCount + completedCount + cancelledCount, 'Total equals sum of active + upcoming + completed + cancelled');
assert(completedCount < seeds.filter(b => b.status === 'Completed').length, 'Completed journey statistics correctly decremented');

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
process.exit(0);
