const prisma = require('../src/db');

async function check() {
  const [users, bookings, bikes] = await Promise.all([
    prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } }),
    prisma.booking.findMany({
      include: { user: { select: { email: true, name: true } }, bike: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.bike.count()
  ]);

  console.log(`DATABASE SUMMARY:`);
  console.log(`- Bikes count: ${bikes}`);
  console.log(`- Users count: ${users.length}`);
  users.forEach(u => console.log(`  User: ${u.email} (${u.name}, ID: ${u.id})`));
  console.log(`- Bookings count: ${bookings.length}`);
  bookings.forEach(b => {
    console.log(`  Booking ID: ${b.id}`);
    console.log(`    User: ${b.user.email}`);
    console.log(`    Bike: ${b.bike.name} (${b.bike.id})`);
    console.log(`    Status: ${b.status}`);
    console.log(`    Dates: ${b.startDate.toISOString().slice(0, 10)} to ${b.endDate.toISOString().slice(0, 10)}`);
    console.log(`    Total: ₹${b.totalAmount}`);
    console.log(`    Cancelled At: ${b.cancelledAt}`);
    console.log(`    Created At: ${b.createdAt}`);
  });
}

check()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
