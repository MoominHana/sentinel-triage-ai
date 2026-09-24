-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'GENERAL_INQUIRY';

-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "isPriorityFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[];
