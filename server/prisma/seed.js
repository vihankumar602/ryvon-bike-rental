// Idempotent seed: upserts bikes and extras from prisma/data/*.json (extracted from the
// frontend's own data). Safe to re-run; it never touches users or bookings.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env first.');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const bikes = require('./data/bikes.json');
  const extras = require('./data/extras.json');

  await prisma.$transaction([
    ...bikes.map((b) => prisma.bike.upsert({ where: { id: b.id }, create: b, update: b })),
    ...extras.map((e) => prisma.rentalExtra.upsert({ where: { id: e.id }, create: e, update: e })),
  ]);
  console.log(`Seeded ${bikes.length} bikes and ${extras.length} extras.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
