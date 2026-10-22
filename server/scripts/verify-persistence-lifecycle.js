const prisma = require('../src/db');

const SERVER_BASE = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const url = `${SERVER_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body: json };
}

async function verifyPersistenceLifecycle() {
  console.log('================================================================');
  console.log('📋 RYVON FINAL DATABASE PERSISTENCE VERIFICATION');
  console.log('================================================================\n');

  // PART A: Verify existing user booking created in browser
  console.log('--- PART A: Inspecting Browser Booking from User Session ---');
  const existingUserBooking = await prisma.booking.findUnique({
    where: { id: 'RDS-2026-412529' },
    include: { user: true, bike: true }
  });

  if (existingUserBooking) {
    console.log(`✓ Confirmed real browser booking in Prisma Postgres:`);
    console.log(`  - Booking Reference: #${existingUserBooking.id}`);
    console.log(`  - Rider: ${existingUserBooking.user.name} (${existingUserBooking.user.email})`);
    console.log(`  - Motorcycle: ${existingUserBooking.bike.name} (${existingUserBooking.bike.brand})`);
    console.log(`  - Destination: ${existingUserBooking.destination}`);
    console.log(`  - Pickup Hub: ${existingUserBooking.pickupHub}`);
    console.log(`  - Dates: ${existingUserBooking.startDate.toISOString().slice(0, 10)} to ${existingUserBooking.endDate.toISOString().slice(0, 10)} (${existingUserBooking.days} days)`);
    console.log(`  - Rental: ₹${existingUserBooking.rentalAmount}`);
    console.log(`  - Extras Total: ₹${existingUserBooking.extrasAmount}`);
    console.log(`  - Service Fee: ₹${existingUserBooking.serviceFee}`);
    console.log(`  - GST (18%): ₹${existingUserBooking.gstAmount}`);
    console.log(`  - Total Paid/Payable: ₹${existingUserBooking.totalAmount}`);
    console.log(`  - Status in PostgreSQL: ${existingUserBooking.status}`);
    console.log(`  - Persisted At: ${existingUserBooking.createdAt.toISOString()}`);
  } else {
    console.log('ℹ No browser booking found with ID RDS-2026-412529.');
  }

  // PART B: Execute full lifecycle test (Create -> Verify DB -> Refresh -> Ownership -> Cancel -> Free -> Cleanup)
  console.log('\n--- PART B: Executing Lifecycle Verification (Steps 1 to 6) ---');

  const ts = Date.now();
  const testUserEmail = `final_verification_rider_${ts}@ryvon-test.com`;
  const otherUserEmail = `other_rider_${ts}@ryvon-test.com`;
  const testPassword = 'Password123#';
  let testUserId = null;
  let otherUserId = null;
  let testBookingId = null;
  let testToken = null;
  let otherToken = null;

  try {
    // 1. Setup Test User
    console.log('\n[1] Creating authenticated test rider...');
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Arjun Verma',
        email: testUserEmail,
        password: testPassword
      })
    });
    if (!regRes.ok) throw new Error(`User registration failed: ${JSON.stringify(regRes.body)}`);
    testToken = regRes.body.data.token;
    testUserId = regRes.body.data.user.id;
    console.log(`  ✓ Registered test rider: ${regRes.body.data.user.name} (${testUserEmail})`);

    // Setup a second user to test ownership / tenant isolation
    const regOtherRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sneha Patel',
        email: otherUserEmail,
        password: testPassword
      })
    });
    otherToken = regOtherRes.body.data.token;
    otherUserId = regOtherRes.body.data.user.id;
    console.log(`  ✓ Registered secondary rider for ownership check: Sneha Patel (${otherUserEmail})`);

    // Step 1: Create one test booking through the frontend API
    console.log('\n[Step 1] Creating test booking via frontend API (POST /api/bookings)...');
    const startDate = '2027-11-15';
    const endDate = '2027-11-18'; // 3 days
    const bookingPayload = {
      bikeId: 'supermeteor',
      startDate: startDate,
      endDate: endDate,
      pickupHub: 'Goa Coastal Hub',
      pickupTime: '09:00 AM',
      destination: 'Goa Coastal Loop',
      source: 'Expedition: Goa Coastal Loop',
      paymentMode: 'Instant UPI',
      extras: ['insurance', 'jacket', 'phone-mount'],
      couponCode: 'WANDER20'
    };

    const bookRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify(bookingPayload)
    });

    if (!bookRes.ok || !bookRes.body.data?.booking) {
      throw new Error(`Booking creation failed: HTTP ${bookRes.status} ${JSON.stringify(bookRes.body)}`);
    }

    const created = bookRes.body.data.booking;
    testBookingId = created.id;
    console.log(`  ✓ Booking created successfully: Reference #${testBookingId}`);
    console.log(`    - Motorcycle: ${created.bikeName} (${created.bikeId})`);
    console.log(`    - Duration: ${created.duration} days (${created.startDate} to ${created.endDate})`);
    console.log(`    - Daily Rate: ₹${created.dailyRate}/day`);
    console.log(`    - Rental Amount: ₹${created.rental}`);
    console.log(`    - Discount: -₹${created.discount} (Coupon: ${created.couponCode})`);
    console.log(`    - Extras: ₹${created.extrasTotal}`);
    console.log(`    - Total Amount: ₹${created.total}`);
    console.log(`    - Security Deposit: ₹${created.deposit}`);
    console.log(`    - Status: ${created.status}`);

    // Step 2: Verify booking record exists in Prisma Postgres
    console.log('\n[Step 2] Verifying booking record in Prisma Postgres via direct DB query...');
    const dbRecord = await prisma.booking.findUnique({
      where: { id: testBookingId },
      include: { user: true, bike: true }
    });

    if (!dbRecord) {
      throw new Error(`CRITICAL: Booking ${testBookingId} NOT found in PostgreSQL database!`);
    }
    console.log(`  ✓ Record confirmed in PostgreSQL table "Booking":`);
    console.log(`    - DB Primary Key: ${dbRecord.id}`);
    console.log(`    - User Foreign Key: ${dbRecord.userId}`);
    console.log(`    - Bike Foreign Key: ${dbRecord.bikeId} ("${dbRecord.bike.name}")`);
    console.log(`    - DB Status: ${dbRecord.status}`);
    console.log(`    - Start Date: ${dbRecord.startDate.toISOString().slice(0, 10)}`);
    console.log(`    - End Date: ${dbRecord.endDate.toISOString().slice(0, 10)}`);
    console.log(`    - Total Amount in DB: ₹${dbRecord.totalAmount}`);
    console.log(`    - Extras in JSON: ${JSON.stringify(dbRecord.extras)}`);
    console.log(`    - Created At in DB: ${dbRecord.createdAt.toISOString()}`);

    // Step 3: Refresh website and confirm booking remains available
    console.log('\n[Step 3] Simulating website refresh / navigation to Journey Logs (GET /api/bookings)...');
    const refreshRes = await request('/bookings', {
      method: 'GET',
      headers: { Authorization: `Bearer ${testToken}` }
    });

    if (!refreshRes.ok || !Array.isArray(refreshRes.body.data)) {
      throw new Error(`Journey history fetch failed: HTTP ${refreshRes.status}`);
    }

    const reloadedBooking = refreshRes.body.data.find(b => b.id === testBookingId);
    if (!reloadedBooking) {
      throw new Error(`Booking ${testBookingId} was NOT returned on page refresh / history reload!`);
    }
    console.log(`  ✓ Booking persists across browser refresh / reloaded session:`);
    console.log(`    - Found Booking ID: #${reloadedBooking.id}`);
    console.log(`    - Status: ${reloadedBooking.status}`);
    console.log(`    - Dates: ${reloadedBooking.startDate} to ${reloadedBooking.endDate}`);
    console.log(`    - Total: ₹${reloadedBooking.total}`);

    // Step 4: Verify booking belongs to the correct user (and tenant isolation)
    console.log('\n[Step 4] Verifying user ownership & tenant isolation in PostgreSQL...');
    console.log(`  - Checking record userId in DB matches test user ID:`);
    console.log(`    dbRecord.userId: ${dbRecord.userId}`);
    console.log(`    testUserId:      ${testUserId}`);
    if (dbRecord.userId !== testUserId) {
      throw new Error(`OWNERSHIP MISMATCH: Booking belongs to ${dbRecord.userId}, expected ${testUserId}!`);
    }
    console.log(`  ✓ Verified: Booking belongs strictly to rider "${dbRecord.user.name}" (${dbRecord.user.email})`);

    // Verify tenant isolation: other user cannot see this booking
    const otherHistoryRes = await request('/bookings', {
      method: 'GET',
      headers: { Authorization: `Bearer ${otherToken}` }
    });
    const leak = otherHistoryRes.body.data.find(b => b.id === testBookingId);
    if (leak) {
      throw new Error(`SECURITY LEAK: Other user ${otherUserEmail} can see booking ${testBookingId}!`);
    }
    console.log(`  ✓ Tenant isolation verified: Other rider cannot see or access this reservation.`);

    // Step 5: Confirm booking cancellation updates the database correctly
    console.log(`\n[Step 5] Cancelling booking via frontend API (PATCH /api/bookings/${testBookingId}/cancel)...`);
    const cancelRes = await request(`/bookings/${testBookingId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${testToken}` }
    });

    if (!cancelRes.ok) {
      throw new Error(`Cancellation API call failed: HTTP ${cancelRes.status} ${JSON.stringify(cancelRes.body)}`);
    }

    const cancelledBookingResponse = cancelRes.body.data.booking || cancelRes.body.data;
    console.log(`  ✓ Cancellation response returned status: "${cancelledBookingResponse.status}"`);

    // Query Prisma Postgres directly to verify state change in database
    console.log('  - Directly querying PostgreSQL to verify DB state change...');
    const cancelledDbRecord = await prisma.booking.findUnique({
      where: { id: testBookingId }
    });

    if (cancelledDbRecord.status !== 'CANCELLED') {
      throw new Error(`DB STATUS MISMATCH: Expected 'CANCELLED', found '${cancelledDbRecord.status}'!`);
    }
    if (!cancelledDbRecord.cancelledAt) {
      throw new Error(`CANCELLED_AT MISMATCH: cancelledAt timestamp is null!`);
    }
    console.log(`  ✓ PostgreSQL status verified: "${cancelledDbRecord.status}"`);
    console.log(`  ✓ Cancellation timestamp in DB: ${cancelledDbRecord.cancelledAt.toISOString()}`);

    // Re-verify availability freed in DB
    const availCheckRes = await request(`/bikes/supermeteor/availability?start=${startDate}&end=${endDate}`);
    if (!availCheckRes.ok || availCheckRes.body.data?.available !== true) {
      throw new Error(`Bike should be available after cancellation, got: ${JSON.stringify(availCheckRes.body)}`);
    }
    console.log(`  ✓ Bike availability restored: supermeteor is available again for ${startDate}..${endDate}`);

    // Step 6: Clean up test records only if safe and appropriate
    console.log('\n[Step 6] Cleaning up test records safely...');
    if (testBookingId) {
      await prisma.booking.delete({ where: { id: testBookingId } });
      console.log(`  ✓ Cleaned up test booking: #${testBookingId}`);
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
      console.log(`  ✓ Cleaned up test user: ${testUserEmail}`);
    }
    if (otherUserId) {
      await prisma.user.delete({ where: { id: otherUserId } });
      console.log(`  ✓ Cleaned up secondary test user: ${otherUserEmail}`);
    }

    // Confirm real user booking remains untouched
    const realBookingStillExists = await prisma.booking.findUnique({
      where: { id: 'RDS-2026-412529' }
    });
    if (realBookingStillExists) {
      console.log(`  ✓ Verified real browser booking #${realBookingStillExists.id} is 100% PRESERVED and UNTOUCHED.`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL 6 VERIFICATION STEPS COMPLETED WITH FULL SUCCESS!');
    console.log('================================================================');

  } catch (err) {
    console.error('\n❌ Verification encountered an error:', err.message);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

verifyPersistenceLifecycle().catch(() => process.exit(1));
