const prisma = require('../src/db');

async function main() {
  const b = await prisma.booking.findUnique({
    where: { id: 'RDS-2026-412529' },
    include: { user: true, bike: true }
  });
  console.log(JSON.stringify(b, null, 2));
}

main().finally(() => prisma.$disconnect());
