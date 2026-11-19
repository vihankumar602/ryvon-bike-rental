export const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: '📄', desc: 'Browse our complete knowledge base covering licensing, escrow deposits, insurance, fleet pickup, and mountain tours.' },
  { id: 'docs', label: 'Licenses & Docs', icon: '📄', desc: 'Driver licence validity, minimum age limits, IDP permits, and KYC verification rules.' },
  { id: 'pricing', label: 'Security & Escrow', icon: '🔒', desc: 'Transparent deposit tiers, 24-hour bank escrow refunds, and zero hidden fees.' },
  { id: 'insurance', label: 'Insurance & Damage', icon: '🛡️', desc: 'Comprehensive damage protection, zero-dep options, and pre-ride check-in audits.' },
  { id: 'fleet', label: 'Fleet & Equipment', icon: '🏍️', desc: '32-point mechanical inspections, Bluetooth ignition unlock, and sanitized ECE gear.' },
  { id: 'booking', label: 'Trip & Booking', icon: '📅', desc: 'Online reservation, date changes, hub pickup times, and rental duration extensions.' },
  { id: 'expeditions', label: 'High-Altitude & Expeditions', icon: '⛰️', desc: 'High-altitude Spiti/Ladakh gear kits, luggage racks, and green pass permits.' },
  { id: 'support', label: 'Roadside & SOS', icon: '🆘', desc: '24/7 highway breakdown SOS, emergency towing dispatch, and flexible refunds.' }
];

export const FAQ_DATA = [
  // 1. Licenses & Documents (5 Questions)
  {
    cat: 'docs',
    tag: 'ELIGIBILITY & LICENCE',
    icon: '📄',
    hasDocGraphic: true,
    q: 'What documents and driving licence are required to rent a motorcycle?',
    a: `<p>You need a valid <strong>driving licence</strong> (with motorcycle gear/MCWG endorsement), a government-issued ID (Aadhaar/Passport/Voter ID), and a security deposit (refundable). For international riders, a valid passport and <strong>International Driving Permit (IDP)</strong> are required.</p>`
  },
  {
    cat: 'docs',
    tag: 'INTERNATIONAL RIDERS',
    icon: '🪖',
    q: 'Can international tourists and foreign passport holders rent motorcycles in India?',
    a: `<p><strong>Yes, absolutely!</strong> We welcome international riders and adventure travelers from around the world. Foreign passport holders can book seamlessly by providing:</p>
    <ul>
      <li><strong>Original Passport &amp; Valid Indian Visa / OCI card.</strong></li>
      <li><strong>International Driving Permit (IDP)</strong> accompanied by your home country driving licence with two-wheeler motorcycle endorsement.</li>
      <li><strong>Local accommodation address</strong> (hotel booking voucher) and active WhatsApp contact for telematics support.</li>
    </ul>`
  },
  {
    cat: 'docs',
    tag: 'CO-RIDERS',
    icon: '👥',
    q: 'Can I register an additional rider or pillion on the same booking?',
    a: `<p><strong>Yes, secondary rider registration is 100% complimentary.</strong> You can register a co-rider during key handover by submitting their valid driving licence. Both riders are fully covered under our commercial safety charter and road insurance.</p>`
  },
  {
    cat: 'docs',
    tag: 'MINIMUM AGE',
    icon: '📅',
    q: 'What is the minimum age requirement to rent a superbike vs commuter bike?',
    a: `<p>To ensure road safety and compliance with insurance underwriters:</p>
    <ul>
      <li><strong>18 Years+:</strong> Eligible for scooters (Activa 6G, Jupiter, Aerox) and motorcycles up to 350cc (Classic 350, Hunter, Bullet).</li>
      <li><strong>21 Years+:</strong> Eligible for adventure tourers and mid-weight machines (Himalayan 450, Scrambler 400X, Duke 390).</li>
      <li><strong>23 Years+:</strong> Required for premium superbikes and heavy tourers (BMW F 850 GS, Triumph Trident, Super Meteor 650).</li>
    </ul>`
  },
  {
    cat: 'docs',
    tag: 'DIGILOCKER KYC',
    icon: '📄',
    q: 'Is a digital driving licence (DigiLocker / mParivahan) accepted at pickup?',
    a: `<p><strong>Yes.</strong> Government-approved digital driving licences displayed directly inside the official <strong>DigiLocker</strong> or <strong>mParivahan</strong> app are 100% legally recognized at all RYVON pickup hubs. Screenshots or photocopies are not accepted.</p>`
  },

  // 2. Security & Escrow (4 Questions)
  {
    cat: 'pricing',
    tag: 'ESCROW DEPOSIT',
    icon: '📅',
    q: 'How does the escrow deposit work, and when do I get my refund?',
    a: `<p>RYVON operates a <strong>100% transparent digital escrow deposit system</strong>. Your security deposit is held securely in an RBI-regulated bank escrow account and is never commingled with operational funds.</p>
    <ul>
      <li><strong>Scooters &amp; 125cc City Commuters:</strong> ₹1,000</li>
      <li><strong>350cc – 450cc Cruisers &amp; Scramblers:</strong> ₹3,000</li>
      <li><strong>650cc+ Superbikes &amp; Heavy Tourers:</strong> ₹5,000</li>
    </ul>
    <p style="margin-top:8px"><strong>Refund Speed:</strong> Upon returning the motorcycle at the hub, our automated digital inspection triggers an instant release. Funds reflect back in your original bank account or UPI within <strong>24 hours</strong> guaranteed.</p>`
  },
  {
    cat: 'pricing',
    tag: 'TRANSPARENT PRICING',
    icon: '🔒',
    q: 'How much is the security deposit for scooters vs 350cc–650cc motorcycles?',
    a: `<p>Security deposits vary strictly based on vehicle category and replacement part costs:</p>
    <ul>
      <li><strong>City Commuter Scooters (Activa 6G, Ntorq 125, Burgman):</strong> ₹1,000 refundable escrow.</li>
      <li><strong>Classic &amp; Mid-Weight Cruisers (Classic 350, Meteor 350, Hunter):</strong> ₹2,500 refundable escrow.</li>
      <li><strong>All-Terrain Adventure Tourers (Himalayan 450, KTM 390 Adventure, Scrambler 400X):</strong> ₹3,500 refundable escrow.</li>
      <li><strong>Premium Superbikes (BMW G 310 GS, Super Meteor 650, BMW F 850 GS):</strong> ₹5,000 refundable escrow.</li>
    </ul>`
  },
  {
    cat: 'pricing',
    tag: 'ZERO HIDDEN FEES',
    icon: '🔒',
    q: 'Are there any hidden costs, prep charges, or helmet rental fees?',
    a: `<p><strong>Zero Hidden Charges Guaranteed.</strong> What you see during checkout is exactly what you pay:</p>
    <ul>
      <li>✓ 1 Sanitized ISI/ECE-22.06 certified rider helmet included 100% free with every booking.</li>
      <li>✓ 32-point pre-trip mechanical inspection and sanitization prep included.</li>
      <li>✓ Unlimited riding kilometers on all expedition tourer models.</li>
      <li>✓ Transparent 18% GST itemization with instant tax invoice receipt.</li>
    </ul>`
  },
  {
    cat: 'pricing',
    tag: 'PAYMENT GATEWAYS',
    icon: '🔒',
    q: 'What payment modes are supported for booking and security deposits?',
    a: `<p>We support all modern, 256-bit encrypted payment gateways including <strong>Instant UPI (Google Pay, PhonePe, Paytm, BHIM, Cred)</strong>, all Major Credit &amp; Debit Cards (Visa, MasterCard, RuPay, American Express), and Net Banking across 50+ nationalized banks.</p>`
  },

  // 3. Insurance & Damage (4 Questions)
  {
    cat: 'insurance',
    tag: 'ZERO-DEDUCTIBLE',
    icon: '🛡️',
    q: 'What is covered under the Comprehensive Zero-Deductible Protection?',
    a: `<p>Our optional <strong>Comprehensive Zero-Deductible Cover (+₹199/day)</strong> provides complete peace of mind on open highways:</p>
    <ul>
      <li><strong>Zero Deductible Liability:</strong> 100% coverage for accidental damage, broken levers, crash guards, and fairing scuffs.</li>
      <li><strong>24/7 Highway Towing:</strong> Free flatbed towing to the nearest authorized service center in case of mechanical breakdown.</li>
      <li><strong>Puncture Assistance:</strong> Roadside flat tire repair support on all major tourist corridors.</li>
      <li><strong>Third-Party Protection:</strong> Comprehensive third-party bodily injury and property coverage under Indian Motor Vehicles Act.</li>
    </ul>`
  },
  {
    cat: 'insurance',
    tag: 'WEAR & SCRATCHES',
    icon: '🛡️',
    q: 'What happens in the event of minor scratches, dust, or accidental wear?',
    a: `<p>Normal highway dust, chain grease, and regular road grime are <strong>never penalized or charged</strong>. If accidental structural damage occurs without Zero-Deductible cover, repair costs are strictly assessed at standardized OEM manufacturer part prices without arbitrary labor markups.</p>`
  },
  {
    cat: 'insurance',
    tag: 'LEGAL COVERAGE',
    icon: '🛡️',
    q: 'Is commercial third-party insurance included by default with my rental?',
    a: `<p><strong>Yes.</strong> 100% of vehicles in the RYVON fleet hold valid commercial rental registration (black &amp; yellow plates) with mandatory third-party liability insurance, fitness certification, and PUC compliance certificates.</p>`
  },
  {
    cat: 'insurance',
    tag: 'ACCIDENT PROTOCOL',
    icon: '🛡️',
    q: 'How do I report an on-road accident or mechanical incident?',
    a: `<p>In case of an incident, ensure your personal safety first, then tap <strong>Emergency SOS</strong> in your RYVON app or call <code>1800-RYVON-RIDE</code>. Our dispatch team will log the GPS telemetry, coordinate roadside assistance or towing, and assist with police/insurance documentation if required.</p>`
  },

  // 4. Fleet & Equipment (5 Questions)
  {
    cat: 'fleet',
    tag: 'HELMETS & GEAR',
    icon: '🪖',
    q: 'Are helmets and riding gear included in the rental?',
    a: `<p><strong>Yes, 1 Sanitized ISI/ECE-22.06 certified rider helmet is included 100% free</strong> with every reservation. For added safety and passenger comfort:</p>
    <ul>
      <li><strong>Pillion Helmet:</strong> Available for a nominal add-on fee of ₹99/day.</li>
      <li><strong>Armored Riding Jackets:</strong> CE Level-2 armored all-weather jackets available at ₹299/day.</li>
      <li><strong>Knee &amp; Elbow Guards:</strong> Ergonomic hard-shell impact protectors available at ₹149/day.</li>
      <li><strong>Action Camera Mounts &amp; Waterproof Phone Mounts:</strong> Vibration-dampened mounts pre-installed upon request.</li>
    </ul>`
  },
  {
    cat: 'fleet',
    tag: 'KEYLESS PICKUP',
    icon: '🏍️',
    q: 'How does the digital key and keyless pickup work at the base hub?',
    a: `<p>We engineered a frictionless, queue-free pickup experience:</p>
    <ol style="margin:8px 0;padding-left:20px;line-height:1.6">
      <li><strong>15 minutes before your time slot:</strong> Your encrypted digital pickup pass activates in your Rider Dashboard and via SMS.</li>
      <li><strong>Arrive at Station Hub:</strong> Show your QR pass or digital booking ID at the designated bay.</li>
      <li><strong>60-Second Walkaround:</strong> Review the 32-point inspection check on your phone, inspect your machine, unlock, and ride away.</li>
    </ol>`
  },
  {
    cat: 'fleet',
    tag: 'FUEL POLICY',
    icon: '🏍️',
    q: 'What is the fuel policy on vehicle collection and return?',
    a: `<p>We follow a transparent <strong>Same-to-Same Fuel Policy</strong>. The vehicle is provided with recorded fuel bars (typically 2+ liters or full tank) and you simply return it with approximately the same fuel level. No surge refueling penalties are applied.</p>`
  },
  {
    cat: 'fleet',
    tag: 'ONE-WAY EXPEDITIONS',
    icon: '🏍️',
    q: 'Can I pick up in one city and drop off in another (One-Way Rentals)?',
    a: `<p><strong>Yes, on popular expedition corridors!</strong> One-way drop-offs are available between Manali ⇄ Leh, Chandigarh ⇄ Shimla, and Bengaluru ⇄ Goa. Select your alternate drop hub during checkout to view the nominal inter-hub relocation fee.</p>`
  },
  {
    cat: 'fleet',
    tag: 'SAFETY AUDIT',
    icon: '🏍️',
    q: 'What mechanical checks are performed during the 32-point safety audit?',
    a: `<p>Before any motorcycle leaves our bay, a master technician inspects: front and rear brake pads, hydraulic fluid, tire tread depth and pressure, chain slack and lubrication, suspension seals, clutch cable tension, electrical switchgear, headlight alignment, and battery cranking voltage.</p>`
  },

  // 5. Trip & Booking (4 Questions)
  {
    cat: 'booking',
    tag: 'TRIP MODIFICATIONS',
    icon: '📅',
    q: 'How do I modify my pickup date or return time after booking?',
    a: `<p>You can reschedule your dates free of charge up to <strong>12 hours prior</strong> to your scheduled pickup time directly from the <strong>My Journeys</strong> tab. If you wish to adjust your return time while already riding, request a trip extension from your active dashboard.</p>`
  },
  {
    cat: 'booking',
    tag: 'CANCELLATION & REFUNDS',
    icon: '📅',
    q: 'What is the cancellation and refund policy for reserved trips?',
    a: `<p>We offer flexible cancellation terms for adventure riders:</p>
    <ul>
      <li><strong>Up to 24 hours prior to pickup:</strong> 100% Full Refund credited to your original payment method within 24 hours.</li>
      <li><strong>Within 24 hours of pickup:</strong> 100% Store Credit issued with lifetime validity and no deduction.</li>
      <li><strong>No-Show:</strong> In case of unnotified no-show, first day rental is retained and remainder credited.</li>
    </ul>`
  },
  {
    cat: 'booking',
    tag: 'EXTENSIONS',
    icon: '📅',
    q: 'Can I extend my rental duration while already on the road?',
    a: `<p><strong>Yes.</strong> Open your active journey in the Rider Dashboard and tap <strong>"Extend Trip"</strong> at least 4 hours before your scheduled return time. If the vehicle is available for the additional days, pay the standard daily rate without surcharge.</p>`
  },
  {
    cat: 'booking',
    tag: 'HUB ARRIVAL',
    icon: '📅',
    q: 'How early should I arrive at the hub for motorcycle handover?',
    a: `<p>We recommend arriving <strong>10 to 15 minutes prior</strong> to your booked departure time. This allows enough time for the digital walkaround inspection, gear sizing (helmets and jackets), luggage mounting, and route briefing with our hub marshal.</p>`
  },

  // 6. High-Altitude & Expeditions (3 Questions)
  {
    cat: 'expeditions',
    tag: 'HIGH ALTITUDE',
    icon: '⛰️',
    q: 'Are RYVON motorcycles permitted in Leh-Ladakh, Spiti Valley & North East?',
    a: `<p><strong>Yes, absolutely.</strong> Our entire adventure line (Royal Enfield Himalayan 450, BMW F 850 GS, Triumph Scrambler 400X, KTM 390 Adventure) is certified for high-altitude mountain circuits with all-India permits, high-altitude ECU tuning, and heavy-duty dual-channel ABS.</p>`
  },
  {
    cat: 'expeditions',
    tag: 'PERMITS & PASSES',
    icon: '⛰️',
    q: 'Do I need special permits for Rohtang Pass, Pangong Tso, or Khardung La?',
    a: `<p>Certain border corridors (Nubra Valley, Pangong Tso, Hanle, Umling La) require an <strong>Inner Line Permit (ILP)</strong> for Indian and foreign nationals. Our expedition team can pre-process your digital ILP and Rohtang green passes when you reserve an expedition route.</p>`
  },
  {
    cat: 'expeditions',
    tag: 'LUGGAGE & ACCESSORIES',
    icon: '⛰️',
    q: 'Can I attach my own luggage or rent waterproof saddlebags from RYVON?',
    a: `<p>All expedition motorcycles come factory-fitted with reinforced rear tail racks and side stays. During Step 2 of booking, you can also rent our <strong>50L IP67 Waterproof Tourer Saddlebags (+₹299/day)</strong>, vibration-dampened wireless charging phone mounts, and CE-Level 2 armored riding jackets.</p>`
  },

  // 7. Roadside & SOS (3 Questions)
  {
    cat: 'support',
    tag: '24/7 HIGHWAY SOS',
    icon: '🆘',
    q: 'What should I do if I experience a flat tire or breakdown in remote terrain?',
    a: `<p>Every RYVON rider has direct access to our <strong>24/7 Highway Command Dispatch</strong>:</p>
    <ul>
      <li><strong>One-Touch SOS:</strong> Press the Emergency SOS button in your Telemetry Dashboard to transmit your exact GPS coordinates to our nearest recovery partner.</li>
      <li><strong>Toll-Free Dispatch Hotline:</strong> Call <code>1800-RYVON-RIDE</code> for immediate roadside assistance or mechanical dispatch.</li>
      <li><strong>Corridor Network:</strong> 500+ service points across mountain and coastal highway routes.</li>
    </ul>`
  },
  {
    cat: 'support',
    tag: 'HOTLINE DISPATCH',
    icon: '🆘',
    q: 'How does the 24/7 Highway SOS dispatch hotline work?',
    a: `<p>When you dial <code>1800-RYVON-RIDE</code> (toll-free), your call connects immediately to a live emergency coordinator who cross-references your bike's live GPS beacon and dispatches the closest mobile service technician or flatbed recovery vehicle within 45 to 60 minutes.</p>`
  },
  {
    cat: 'support',
    tag: 'EMERGENCY TOWING',
    icon: '🆘',
    q: 'What emergency medical and towing assistance is included?',
    a: `<p>All bookings include emergency mechanical assistance coordination. If you opted for Comprehensive Zero-Deductible cover, <strong>100% of flatbed towing fees</strong> to the nearest authorized dealership and on-demand replacement bike relocation (subject to availability) are covered free of charge.</p>`
  }
];
