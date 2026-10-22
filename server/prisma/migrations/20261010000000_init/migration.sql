-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "licenseNumber" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bikes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pricePerDay" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL,
    "fuel" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "imgFile" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "power" TEXT NOT NULL,
    "torque" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "seat" TEXT NOT NULL,
    "topSpeed" TEXT NOT NULL,
    "fuelCap" TEXT NOT NULL,
    "extra" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_extras" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePerDay" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rental_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "bikeId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "days" INTEGER NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "pickupHub" TEXT NOT NULL,
    "destination" TEXT,
    "source" TEXT,
    "dailyRate" INTEGER NOT NULL,
    "rentalAmount" INTEGER NOT NULL,
    "extrasAmount" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "serviceFee" INTEGER NOT NULL,
    "gstAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "couponCode" TEXT,
    "extras" JSONB NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "bookings_userId_createdAt_idx" ON "bookings"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_bikeId_startDate_endDate_idx" ON "bookings"("bikeId", "startDate", "endDate");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "bikes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Hand-written section (Prisma's schema language cannot express these).
-- ---------------------------------------------------------------------------

-- Needed so a plain "bikeId =" comparison can live inside a GiST exclusion constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_dates_valid" CHECK ("endDate" >= "startDate");
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_days_positive" CHECK ("days" >= 1);
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_amounts_nonnegative"
  CHECK ("totalAmount" >= 0 AND "rentalAmount" >= 0 AND "extrasAmount" >= 0
         AND "discountAmount" >= 0 AND "serviceFee" >= 0 AND "gstAmount" >= 0);

-- The core guarantee: the database itself rejects two non-cancelled bookings for the
-- same bike whose date ranges (start and end days both INCLUSIVE) overlap. Because this
-- is enforced by PostgreSQL, it holds for concurrent requests and multiple server
-- processes; application-level checks alone cannot guarantee that.
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "bikeId" WITH =,
    daterange("startDate", "endDate", '[]') WITH &&
  )
  WHERE ("status" <> 'CANCELLED');
