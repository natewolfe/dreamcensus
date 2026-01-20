/*
  Warnings:

  - You are about to drop the `CategoryProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CensusCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CensusForm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryProgress" DROP CONSTRAINT "CategoryProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "CensusForm" DROP CONSTRAINT "CensusForm_categoryId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarBgColor" TEXT NOT NULL DEFAULT '#5c6bc0',
ADD COLUMN     "avatarEmoji" TEXT NOT NULL DEFAULT '🌙';

-- DropTable
DROP TABLE "CategoryProgress";

-- DropTable
DROP TABLE "CensusCategory";

-- DropTable
DROP TABLE "CensusForm";

-- CreateTable
CREATE TABLE "AlarmSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isArmed" BOOLEAN NOT NULL DEFAULT false,
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "soundId" TEXT NOT NULL DEFAULT 'gentle-rise',
    "volume" INTEGER NOT NULL DEFAULT 80,
    "snoozeMinutes" INTEGER NOT NULL DEFAULT 9,
    "maxSnoozes" INTEGER NOT NULL DEFAULT 3,
    "lastSetTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlarmSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boundaryScore" INTEGER,
    "lucidityScore" INTEGER,
    "emotionScore" INTEGER,
    "meaningScore" INTEGER,
    "engagementScore" INTEGER,
    "boundaryConfidence" INTEGER,
    "lucidityConfidence" INTEGER,
    "emotionConfidence" INTEGER,
    "meaningConfidence" INTEGER,
    "engagementConfidence" INTEGER,
    "primaryArchetype" TEXT,
    "secondaryArchetype" TEXT,
    "archetypeConfidence" INTEGER,
    "unlockPoints" INTEGER NOT NULL DEFAULT 0,
    "unlockLevel" INTEGER NOT NULL DEFAULT 0,
    "journalDreamCount" INTEGER NOT NULL DEFAULT 0,
    "journalLucidPercent" INTEGER,
    "journalAvgVividness" INTEGER,
    "journalTopEmotions" TEXT[],
    "journalTopTags" TEXT[],
    "journalWakingLinkRate" INTEGER,
    "scoringVersion" INTEGER NOT NULL DEFAULT 1,
    "isStale" BOOLEAN NOT NULL DEFAULT true,
    "lastCalculatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreamerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlarmSettings_userId_key" ON "AlarmSettings"("userId");

-- CreateIndex
CREATE INDEX "AlarmSettings_userId_idx" ON "AlarmSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DreamerProfile_userId_key" ON "DreamerProfile"("userId");

-- CreateIndex
CREATE INDEX "DreamerProfile_userId_idx" ON "DreamerProfile"("userId");

-- AddForeignKey
ALTER TABLE "AlarmSettings" ADD CONSTRAINT "AlarmSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamerProfile" ADD CONSTRAINT "DreamerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
