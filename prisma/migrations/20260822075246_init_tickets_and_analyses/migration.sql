-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'URGENT');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('BILLING', 'BUG', 'FEATURE_REQUEST', 'OUTAGE');

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "ticketBody" TEXT NOT NULL,
    "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "isPriority" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "category" "Category" NOT NULL,
    "urgencyScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_ticketId_key" ON "Analysis"("ticketId");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
