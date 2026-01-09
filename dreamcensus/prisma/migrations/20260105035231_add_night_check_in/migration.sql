-- CreateTable
CREATE TABLE "NightCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mood" TEXT,
    "dayNotes" TEXT,
    "intention" TEXT,
    "plannedWakeTime" TEXT,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NightCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NightCheckIn_userId_idx" ON "NightCheckIn"("userId");

-- CreateIndex
CREATE INDEX "NightCheckIn_date_idx" ON "NightCheckIn"("date");

-- CreateIndex
CREATE UNIQUE INDEX "NightCheckIn_userId_date_key" ON "NightCheckIn"("userId", "date");

-- AddForeignKey
ALTER TABLE "NightCheckIn" ADD CONSTRAINT "NightCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
