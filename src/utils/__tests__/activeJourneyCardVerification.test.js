import fs from 'fs';
import assert from 'assert';

console.log('====================================================');
console.log('🏍️ RUNNING ACTIVE JOURNEY CARD & IMAGE VERIFICATION');
console.log('====================================================\n');

// 1. Verify BookingHistory.jsx markup
const bookingCode = fs.readFileSync('src/pages/BookingHistory.jsx', 'utf8');
assert(bookingCode.includes('featured-journey-master-card'), 'Featured journey master card exists');
assert(bookingCode.includes('CURRENT EXPEDITION • ACTIVE ⚡'), 'Has CURRENT EXPEDITION status badge');
assert(bookingCode.includes('featured-booking-id-gold'), 'Has gold booking ID');
assert(bookingCode.includes('EXPEDITION ENDS IN'), 'Has countdown timer label');
assert(bookingCode.includes('featured-visual-route-track'), 'Has route indicator track');
assert(bookingCode.includes('featured-dates-summary-row'), 'Has 3-box pickup/return/duration row');
assert(bookingCode.includes('btn-featured-primary-gold'), 'Has View Details button');
assert(bookingCode.includes('handleRouteTelemetry'), 'Has Route Telemetry handler');
assert(bookingCode.includes('handleSOSDispatch'), 'Has SOS Dispatch handler');
assert(bookingCode.includes('RYVON Fleet Direct'), 'Journey History cards have RYVON Fleet Direct chip');
console.log('  ✅ PASS: BookingHistory.jsx implements all required card components & action handlers');

// 2. Verify CSS styles
const cssCode = fs.readFileSync('src/styles/style.css', 'utf8');
assert(cssCode.includes('grid-template-columns: 50% 50%'), 'Featured card uses exact 50/50 two-column layout');
assert(cssCode.includes('height: 585px'), 'Left image has 585px height on desktop');
assert(cssCode.includes('height: 245px'), 'Journey History card image height upgraded to 245px (55-60% area)');
assert(cssCode.includes('.btn-featured-sos'), 'CSS defines SOS Dispatch button styling');
assert(cssCode.includes('.featured-countdown-box'), 'CSS defines countdown timer container');
console.log('  ✅ PASS: style.css defines exact 50/50 dimensions, 585px desktop height, and 245px history cards');

// 3. Verify Dynamic Bike Image Resolution for BMW F 850 GS, Super Meteor, Himalayan
const { resolveJourneyBikeImage } = await import('../../utils/journeyImageResolver.js');

const bmwImg = resolveJourneyBikeImage({ bikeId: 'bmwf850', bikeName: 'BMW F 850 GS Expedition' });
assert.strictEqual(bmwImg, '/assets/images/bmw-f850-gs.jpg', 'BMW F 850 GS resolves exact studio image');

const superMeteorImg = resolveJourneyBikeImage({ bikeId: 'supermeteor', bikeName: 'Super Meteor 650 Tourer' });
assert.strictEqual(superMeteorImg, '/assets/images/royal-enfield-super-meteor-650.jpg', 'Super Meteor resolves exact image');

const himalayanImg = resolveJourneyBikeImage({ bikeId: 'himalayan', bikeName: 'Himalayan 450 Summit' });
assert.strictEqual(himalayanImg, '/assets/images/himalayan-450-expedition.jpg', 'Himalayan 450 resolves exact image');

console.log('  ✅ PASS: Dynamic motorcycle image resolution strictly verified for all models');

console.log('\n====================================================');
console.log('🏁 ALL ACTIVE JOURNEY CARD & IMAGE TESTS PASSED');
console.log('====================================================\n');
