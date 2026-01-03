-- AlterTable
ALTER TABLE "CensusQuestion" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "groupLabel" TEXT,
ADD COLUMN     "showWhen" JSONB;
