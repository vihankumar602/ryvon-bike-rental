import { bikes, getBikeImage } from '../../data/bikes.js';
import { validateBookingDates, addDays, getTodayDateString, getMinReturnDate } from '../dateValidation.js';

console.log('====================================================');
console.log('⚡ RUNNING QUICK BOOK MODAL FUNCTIONAL VERIFICATION');
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

// 1. Initial State: Scrambler 400X
const defaultBike = bikes.find(b => b.id === 'scrambler400x');
assert(defaultBike !== undefined, 'Default bike Triumph Scrambler 400X exists in fleet');
assert(defaultBike.price === 1649, 'Triumph Scrambler 400X price is ₹1,649/day');
assert(defaultBike.engine === '398 cc', 'Engine capacity is 398 cc');
assert(defaultBike.power === '40 PS', 'Power rating is 40 PS');
assert(defaultBike.transmission === 'Manual', 'Transmission is Manual');
assert(defaultBike.type === 'Adventure', 'Category is Adventure');
assert(defaultBike.deposit === 4000, 'Security deposit is ₹4,000');

// 2. Date Calculations matching Reference Image
const today = '2026-11-09';
const returnDate = '2026-11-12';
const dateVal = validateBookingDates(today, returnDate);
assert(dateVal.isValid === true, 'Rental dates 2026-11-09 to 2026-11-12 are valid');
assert(dateVal.days === 3, 'Rental duration is exactly 3 Days');

// 3. Pricing Math Matching Reference Image
const subtotal = defaultBike.price * dateVal.days; // 1649 * 3 = 4947
assert(subtotal === 4947, '3 Days × ₹1,649 subtotal equals ₹4,947');
const deposit = defaultBike.deposit || 4000;
const totalPayable = subtotal + deposit; // 4947 + 4000 = 8947
assert(totalPayable === 8947, 'Estimated Total Payable equals ₹8,947 (matches reference image)');

// 4. Motorcycle Switching (KTM Adventure 390 Rally)
const ktm = bikes.find(b => b.id === 'ktmadv390');
assert(ktm !== undefined, 'KTM Adventure 390 Rally exists in fleet');
assert(ktm.price === 1749, 'KTM rate is ₹1,749/day');
const ktmSubtotal = ktm.price * dateVal.days;
const ktmDeposit = ktm.deposit || 4000;
const ktmTotal = ktmSubtotal + ktmDeposit;
assert(ktmTotal === (1749 * 3) + ktmDeposit, 'KTM 3-day total calculated dynamically');

// 5. Fleet Availability
assert(bikes.length === 34, 'Available fleet contains exactly 34 models');

// 6. Category Filtering
const adventureBikes = bikes.filter(b => b.type === 'Adventure');
assert(adventureBikes.length > 0, 'Adventure category filter returns adventure models');
assert(adventureBikes.some(b => b.id === 'scrambler400x'), 'Scrambler 400X present in Adventure category');
assert(adventureBikes.some(b => b.id === 'ktmadv390'), 'KTM Adventure 390 present in Adventure category');
assert(adventureBikes.some(b => b.id === 'scram411'), 'Royal Enfield Scram 411 present in Adventure category');

// 7. Date Validation Rules
const invalidReturn = '2026-11-08';
const invalidVal = validateBookingDates(today, invalidReturn);
assert(invalidVal.isValid === false, 'Return date earlier than pickup date correctly marked invalid');

const sameDayVal = validateBookingDates(today, today);
assert(sameDayVal.isValid === false, 'Same-day return correctly marked invalid (min 1 day required)');

// 8. Instant 1-Click Confirm Booking Payload Integrity
const bookingRef = `RDS-2026-999999`;
const bookingPayload = {
  id: bookingRef,
  status: 'Upcoming',
  bikeId: defaultBike.id,
  bikeName: defaultBike.name,
  bikeCategory: defaultBike.type,
  bikeEngine: defaultBike.engine,
  bikePower: defaultBike.power,
  bikeImage: getBikeImage(defaultBike),
  pickupCity: 'Indiranagar Hub, Bengaluru',
  destCity: `${defaultBike.name} Quick Expedition`,
  source: 'Quick Book Express',
  startDate: today,
  endDate: returnDate,
  pickupTime: '09:00 AM',
  duration: dateVal.days,
  dailyRate: defaultBike.price,
  rental: subtotal,
  deposit: defaultBike.deposit,
  total: subtotal + Math.round(subtotal * 0.18) + 149
};

assert(bookingPayload.bikeId === 'scrambler400x', 'Payload captures correct bikeId');
assert(bookingPayload.bikeName === 'Triumph Scrambler 400X', 'Payload captures exact model name');
assert(bookingPayload.duration === 3, 'Payload captures 3 days duration');
assert(bookingPayload.bikeImage.includes('triumph-scrambler-400x'), 'Payload captures authentic Triumph photo');

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
