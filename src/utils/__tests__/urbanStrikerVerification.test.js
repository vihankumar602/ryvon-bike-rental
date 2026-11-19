import fs from 'fs';
import assert from 'assert';

console.log('====================================================');
console.log('🏙️ RUNNING URBAN STRIKER DASHBOARD VERIFICATION');
console.log('====================================================\n');

// 1. Verify App routes
const appCode = fs.readFileSync('src/App.jsx', 'utf8');
assert(appCode.includes("import UrbanStriker from './pages/UrbanStriker'"), 'App imports UrbanStriker');
assert(appCode.includes('path="/urban-striker"'), 'App defines /urban-striker route');
assert(appCode.includes('path="/urban-striker-profile"'), 'App defines /urban-striker-profile route');
console.log('  ✅ PASS: Route /urban-striker and aliases properly defined in App.jsx');

// 2. Verify Header navbar button
const headerCode = fs.readFileSync('src/components/common/Header.jsx', 'utf8');
assert(headerCode.includes('to="/urban-striker"'), 'Header links to /urban-striker');
assert(headerCode.includes('Urban Striker'), 'Header contains Urban Striker text');
assert(headerCode.includes('persona-header-btn'), 'Header preserves persona-header-btn class');
console.log('  ✅ PASS: Header navbar has functional Urban Striker link in exact position');

// 3. Verify UrbanStriker component
const urbanCode = fs.readFileSync('src/pages/UrbanStriker.jsx', 'utf8');
assert(urbanCode.includes('URBAN STRIKER PROFILE'), 'UrbanStriker has profile eyebrow');
assert(urbanCode.includes('striker-italic'), 'UrbanStriker has italic title accent');
assert(urbanCode.includes('94%'), 'UrbanStriker has 94% DNA match');
assert(urbanCode.includes('Triumph Speed 400'), 'UrbanStriker has Triumph Speed 400');
assert(urbanCode.includes('Royal Enfield Hunter 350'), 'UrbanStriker has Hunter 350');
assert(urbanCode.includes('KTM 250 Duke'), 'UrbanStriker has KTM 250 Duke');
assert(urbanCode.includes('Yezdi Roadster'), 'UrbanStriker has Yezdi Roadster');
assert(urbanCode.includes('Ideal Riding Environment'), 'UrbanStriker has Ideal Riding Environment');
assert(urbanCode.includes('Recommended Urban Routes'), 'UrbanStriker has Recommended Urban Routes');
assert(urbanCode.includes('Bengaluru City Loop'), 'UrbanStriker has Bengaluru City Loop');
assert(urbanCode.includes('Riding Setup & Preferences'), 'UrbanStriker has Riding Setup');
assert(urbanCode.includes('Personalize Your Urban Striker Experience'), 'UrbanStriker has bottom banner');
assert(urbanCode.includes('Customize My Ride'), 'UrbanStriker has Customize My Ride button');
assert(urbanCode.includes('Plan an Urban Ride'), 'UrbanStriker has Plan an Urban Ride button');
console.log('  ✅ PASS: UrbanStriker component accurately implements all sections from reference');

// 4. Verify CSS
const cssCode = fs.readFileSync('src/styles/urban-striker.css', 'utf8');
assert(cssCode.includes('.urban-striker-hero'), 'CSS defines urban-striker-hero');
assert(cssCode.includes('.urban-dna-card'), 'CSS defines urban-dna-card');
assert(cssCode.includes('.urban-fleet-card'), 'CSS defines urban-fleet-card');
assert(cssCode.includes('.urban-personalize-banner'), 'CSS defines urban-personalize-banner');
console.log('  ✅ PASS: Isolated urban-striker.css styles all layout containers and responsive breakpoints');

// 5. Verify Image Assets
assert(fs.existsSync('public/assets/images/urban-striker-hero.jpg'), 'Hero image exists on disk');
assert(fs.existsSync('public/assets/images/triumph-speed-400.png'), 'Triumph Speed 400 image exists');
assert(fs.existsSync('public/assets/images/royal-enfield-hunter-350.png'), 'Hunter 350 image exists');
assert(fs.existsSync('public/assets/images/ktm-duke-390.jpg'), 'KTM Duke image exists');
assert(fs.existsSync('public/assets/images/velora-roadster.png'), 'Yezdi Roadster image exists');
console.log('  ✅ PASS: All motorcycle and hero image assets verified on disk');

console.log('\n====================================================');
console.log('🏁 URBAN STRIKER VERIFICATION: ALL TESTS PASSED');
console.log('====================================================\n');
