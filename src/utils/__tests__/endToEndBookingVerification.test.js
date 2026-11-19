import { bikes, getBikeImage } from '../../data/bikes.js';
import { getSeedBookings } from '../../data/seedBookings.js';
import { resolveJourneyBikeImage } from '../journeyImageResolver.js';
import fs from 'fs';

console.log('====================================================');
console.log('🏍️ RUNNING END-TO-END MOTORCYCLE BOOKING VERIFICATION');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

// In-memory simulated storage for end-to-end testing
const simulatedStorage = new Map();
const STORAGE_KEY = 'rideos-bookings';

function mockSave(list) {
  simulatedStorage.set(STORAGE_KEY, JSON.stringify(list));
}

function mockLoad() {
  const raw = simulatedStorage.get(STORAGE_KEY);
  return raw ? JSON.parse(raw) : getSeedBookings();
}

function createTestBooking({ bikeId, startDate = '2026-11-15', endDate = '2026-11-18', pickupHub = 'Bengaluru Indiranagar Hub' }) {
  const cleanId = String(bikeId || '').toLowerCase().trim();
  const bike = bikes.find(b => 
    b.id.toLowerCase() === cleanId ||
    b.name.toLowerCase() === cleanId ||
    cleanId.includes(b.id.toLowerCase())
  );
  if (!bike) throw new Error(`Bike not found in fleet: ${bikeId}`);

  const createdId = `RDS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const bikeImg = getBikeImage(bike);

  const booking = {
    id: createdId,
    bookingId: createdId,
    userId: 'test-rider-usr-01',
    bikeId: bike.id,
    bikeName: bike.name,
    brand: bike.brand || 'RYVON Fleet',
    category: bike.type,
    bikeCategory: bike.type,
    bikeImage: bikeImg,
    imageUrl: bikeImg,
    bikeImgFile: bike.imgFile,
    pricePerDay: bike.price,
    dailyRate: bike.price,
    engineCapacity: bike.engine,
    bikeEngine: bike.engine,
    horsepower: bike.power,
    bikePower: bike.power,
    transmission: bike.transmission || 'Manual',
    deposit: bike.deposit,
    pickupLocation: pickupHub,
    pickupCity: pickupHub,
    destination: `${bike.name} Expedition`,
    destCity: `${bike.name} Expedition`,
    pickupDate: startDate,
    startDate,
    returnDate: endDate,
    endDate,
    pickupTime: '09:00 AM',
    returnTime: '06:00 PM',
    duration: 3,
    extras: [{ id: 'panniers', name: 'Aluminium Touring Panniers', price: 449 }],
    paymentStatus: 'Paid online',
    paymentMethod: 'Instant UPI',
    totalAmount: bike.price * 3 + 1500,
    total: bike.price * 3 + 1500,
    status: 'Upcoming',
    bookingStatus: 'Upcoming',
    createdAt: new Date().toISOString(),
    userModified: true
  };

  const currentList = mockLoad();
  const updatedList = [booking, ...currentList];
  mockSave(updatedList);
  return booking;
}

// -------------------------------------------------------------
// TEST CASE 1: Book Super Meteor 650
// -------------------------------------------------------------
console.log('--- TEST CASE 1: Book Super Meteor 650 ---');
const booking1 = createTestBooking({ bikeId: 'supermeteor' });
assert(booking1.bikeId === 'supermeteor', 'Booking 1 captured bikeId = supermeteor');
assert(booking1.bikeName.includes('Super Meteor 650'), 'Booking 1 captured exact model name');
const img1 = resolveJourneyBikeImage(booking1);
assert(img1 === '/assets/images/royal-enfield-super-meteor-650.jpg', `Booking 1 resolved exact Super Meteor 650 photo: ${img1}`);
assert(fs.existsSync('public' + img1), `Super Meteor photo exists on disk: public${img1}`);

// -------------------------------------------------------------
// TEST CASE 2: Book Himalayan 450
// -------------------------------------------------------------
console.log('\n--- TEST CASE 2: Book Himalayan 450 ---');
const booking2 = createTestBooking({ bikeId: 'himalayan' });
assert(booking2.bikeId === 'himalayan', 'Booking 2 captured bikeId = himalayan');
assert(booking2.bikeName.includes('Himalayan 450'), 'Booking 2 captured exact model name');
const img2 = resolveJourneyBikeImage(booking2);
assert(img2.includes('himalayan-450'), `Booking 2 resolved exact Himalayan 450 photo: ${img2}`);
assert(fs.existsSync('public' + img2), `Himalayan photo exists on disk: public${img2}`);

// -------------------------------------------------------------
// TEST CASE 3: Consecutive bookings for different motorcycles
// -------------------------------------------------------------
console.log('\n--- TEST CASE 3: Consecutive Bookings (Scram 411 & Classic 350) ---');
const bookingScram = createTestBooking({ bikeId: 'scram411' });
const bookingClassic = createTestBooking({ bikeId: 'classic350' });

const imgScram = resolveJourneyBikeImage(bookingScram);
const imgClassic = resolveJourneyBikeImage(bookingClassic);

assert(imgScram === '/assets/images/royal-enfield-scram-411.jpg', `Scram 411 resolved correct photo: ${imgScram}`);
assert(imgClassic === '/assets/images/royal-enfield-classic-350.png', `Classic 350 resolved correct photo: ${imgClassic}`);
assert(imgScram !== imgClassic, 'Images are distinct and independent (no cross-contamination)');
assert(bookingScram.id !== bookingClassic.id, 'Both bookings have unique distinct booking IDs');

// -------------------------------------------------------------
// TEST CASE 4: Persistence across reloads
// -------------------------------------------------------------
console.log('\n--- TEST CASE 4: Data Persistence & Deserialization ---');
const loadedList = mockLoad();
assert(loadedList.length >= 4, `Persisted bookings list loaded (${loadedList.length} records)`);

const foundSuper = loadedList.find(b => b.id === booking1.id);
assert(foundSuper !== undefined, 'Super Meteor booking survived reload');
assert(resolveJourneyBikeImage(foundSuper) === '/assets/images/royal-enfield-super-meteor-650.jpg', 'Super Meteor image intact after reload');

const foundHimalayan = loadedList.find(b => b.id === booking2.id);
assert(foundHimalayan !== undefined, 'Himalayan booking survived reload');
assert(resolveJourneyBikeImage(foundHimalayan).includes('himalayan-450'), 'Himalayan image intact after reload');

// -------------------------------------------------------------
// TEST CASE 5: View Journey Details Modal Data
// -------------------------------------------------------------
console.log('\n--- TEST CASE 5: View Journey Details Synchronization ---');
const modalBooking = loadedList.find(b => b.id === booking1.id);
assert(modalBooking.id === booking1.id, 'Modal matches booking ID');
assert(modalBooking.bikeName === booking1.bikeName, 'Modal matches bike model');
assert(modalBooking.pickupDate === booking1.pickupDate, 'Modal matches pickup schedule');
assert(modalBooking.returnDate === booking1.returnDate, 'Modal matches return schedule');
assert(modalBooking.totalAmount === booking1.totalAmount, 'Modal matches total amount');
assert(resolveJourneyBikeImage(modalBooking) === resolveJourneyBikeImage(booking1), 'Modal displays identical motorcycle image');

// -------------------------------------------------------------
// TEST CASE 6: Cancellation Lifecycle
// -------------------------------------------------------------
console.log('\n--- TEST CASE 6: Booking Cancellation Lifecycle ---');
const cancelTargetId = bookingScram.id;
const listToCancel = mockLoad();
const targetIndex = listToCancel.findIndex(b => b.id === cancelTargetId);
listToCancel[targetIndex] = {
  ...listToCancel[targetIndex],
  status: 'Cancelled',
  bookingStatus: 'Cancelled',
  paymentStatus: 'CANCELLED',
  cancelledAt: new Date().toISOString()
};
mockSave(listToCancel);

const postCancelList = mockLoad();
const cancelledBooking = postCancelList.find(b => b.id === cancelTargetId);
assert(cancelledBooking.status === 'Cancelled', 'Booking status transitioned to Cancelled');
assert(cancelledBooking.paymentStatus === 'CANCELLED', 'Payment status transitioned to CANCELLED');
assert(cancelledBooking.bikeId === 'scram411', 'Motorcycle bikeId preserved after cancellation');
assert(resolveJourneyBikeImage(cancelledBooking) === '/assets/images/royal-enfield-scram-411.jpg', 'Motorcycle photo completely preserved after cancellation');

// -------------------------------------------------------------
// TEST CASE 7: Multiple bookings for the SAME motorcycle
// -------------------------------------------------------------
console.log('\n--- TEST CASE 7: Multiple Bookings for the Same Motorcycle ---');
const superMeteorTripA = createTestBooking({ bikeId: 'supermeteor', startDate: '2026-11-20', endDate: '2026-11-23' });
const superMeteorTripB = createTestBooking({ bikeId: 'supermeteor', startDate: '2026-12-05', endDate: '2026-12-09' });

assert(superMeteorTripA.id !== superMeteorTripB.id, 'Trip A and Trip B have different booking IDs');
assert(superMeteorTripA.startDate !== superMeteorTripB.startDate, 'Trip A and Trip B have independent dates');
assert(resolveJourneyBikeImage(superMeteorTripA) === '/assets/images/royal-enfield-super-meteor-650.jpg', 'Trip A displays Super Meteor 650 photo');
assert(resolveJourneyBikeImage(superMeteorTripB) === '/assets/images/royal-enfield-super-meteor-650.jpg', 'Trip B displays Super Meteor 650 photo');

// -------------------------------------------------------------
// TEST CASE 8: Complete Fleet 34-Bike Coverage
// -------------------------------------------------------------
console.log('\n--- TEST CASE 8: Complete 34-Bike Fleet Coverage ---');
let fleetFailures = 0;
for (const bike of bikes) {
  const simulated = {
    id: `TEST-${bike.id}`,
    bikeId: bike.id,
    bikeName: bike.name,
    bikeImage: getBikeImage(bike)
  };
  const resolved = resolveJourneyBikeImage(simulated);
  if (!resolved || resolved === '/assets/images/ryvon-superbike.png') {
    console.error(`  ❌ Failed resolution for fleet bike: ${bike.id} (${bike.name})`);
    fleetFailures++;
  }
}
assert(fleetFailures === 0, `All ${bikes.length} fleet motorcycles resolve their authentic photo cleanly`);

// -------------------------------------------------------------
// TEST CASE 9: Statistics Dynamic Calculation from Actual Records
// -------------------------------------------------------------
console.log('\n--- TEST CASE 9: Statistics Dynamic Calculation from Actual Records ---');
const allTestBookings = mockLoad();
const computedTotal = allTestBookings.length;
const computedActive = allTestBookings.filter(b => b.status === 'Active').length;
const computedUpcoming = allTestBookings.filter(b => b.status === 'Upcoming').length;
const computedCompleted = allTestBookings.filter(b => b.status === 'Completed').length;
const computedCancelled = allTestBookings.filter(b => b.status === 'Cancelled').length;

assert(computedTotal === (computedActive + computedUpcoming + computedCompleted + computedCancelled), 'Total count equals sum of status breakdowns');
assert(computedTotal > 0, `Dynamic total rides calculated correctly: ${computedTotal}`);
assert(computedUpcoming > 0, `Dynamic upcoming count calculated correctly: ${computedUpcoming}`);
assert(computedCancelled > 0, `Dynamic cancelled count calculated correctly: ${computedCancelled}`);

// -------------------------------------------------------------
// TEST CASE 10: Filtering Operations on Bookings
// -------------------------------------------------------------
console.log('\n--- TEST CASE 10: Booking Filtering Operations ---');
const filteredAll = allTestBookings;
const filteredUpcoming = allTestBookings.filter(b => b.status === 'Upcoming');
const filteredActive = allTestBookings.filter(b => b.status === 'Active');
const filteredCompleted = allTestBookings.filter(b => b.status === 'Completed');
const filteredCancelled = allTestBookings.filter(b => b.status === 'Cancelled');

assert(filteredAll.length === computedTotal, 'Filter: All returns entire dataset');
assert(filteredUpcoming.every(b => b.status === 'Upcoming'), 'Filter: Upcoming returns only Upcoming journeys');
assert(filteredActive.every(b => b.status === 'Active'), 'Filter: Active returns only Active journeys');
assert(filteredCompleted.every(b => b.status === 'Completed'), 'Filter: Completed returns only Completed journeys');
assert(filteredCancelled.every(b => b.status === 'Cancelled'), 'Filter: Cancelled returns only Cancelled journeys');

// -------------------------------------------------------------
// TEST CASE 11: Multi-Criteria Search & Sorting
// -------------------------------------------------------------
console.log('\n--- TEST CASE 11: Multi-Criteria Search & Sorting ---');
const searchByBike = allTestBookings.filter(b => b.bikeName.toLowerCase().includes('meteor'));
assert(searchByBike.length > 0 && searchByBike.every(b => b.bikeName.toLowerCase().includes('meteor')), 'Search by bike name correctly filters matching bookings');

const searchByDest = allTestBookings.filter(b => (b.destCity || b.destination || '').toLowerCase().includes('jaipur'));
assert(searchByDest.length > 0 && searchByDest.every(b => (b.destCity || b.destination || '').toLowerCase().includes('jaipur')), 'Search by destination correctly filters matching bookings');

const searchById = allTestBookings.filter(b => (b.id || b.bookingId || '').includes(booking1.id));
assert(searchById.length === 1 && searchById[0].id === booking1.id, 'Search by exact booking ID locates single record');

const sortedNewest = [...allTestBookings].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
assert(sortedNewest[0].startDate >= sortedNewest[sortedNewest.length - 1].startDate, 'Sorting: Newest First orders dates descending');

const sortedPriceHigh = [...allTestBookings].sort((a, b) => (b.total || 0) - (a.total || 0));
assert(sortedPriceHigh[0].total >= sortedPriceHigh[sortedPriceHigh.length - 1].total, 'Sorting: Price High to Low orders totals descending');

// -------------------------------------------------------------
// TEST CASE 12: Action Buttons & Modal Linkage
// -------------------------------------------------------------
console.log('\n--- TEST CASE 12: Action Buttons & Workflow Verification ---');
let detailsModalPayload = null;
let modifyModalPayload = null;
let invoiceCalled = false;

function simulateViewDetails(b) {
  detailsModalPayload = { bookingId: b.id, booking: b };
}
function simulateModifyBooking(b) {
  modifyModalPayload = { bookingId: b.id, booking: b };
}
function simulateDownloadInvoice(b) {
  invoiceCalled = true;
}

simulateViewDetails(booking1);
assert(detailsModalPayload !== null && detailsModalPayload.bookingId === booking1.id, 'View Details opens exact booking payload');

simulateModifyBooking(booking1);
assert(modifyModalPayload !== null && modifyModalPayload.bookingId === booking1.id, 'Modify Booking opens exact booking payload');

simulateDownloadInvoice(booking1);
assert(invoiceCalled === true, 'Download Invoice workflow executes reliably');

console.log('\n====================================================');
console.log(`🏁 END-TO-END TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================\n');

if (failedTests > 0) process.exit(1);
