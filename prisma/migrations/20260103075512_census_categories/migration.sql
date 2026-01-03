-- CreateTable
CREATE TABLE "CensusCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CensusCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusForm" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "prerequisiteFormId" TEXT,
    "promptThreshold" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CensusForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "promptAnswers" INTEGER NOT NULL DEFAULT 0,
    "formsStarted" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "formsComplete" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CensusCategory_slug_key" ON "CensusCategory"("slug");

-- CreateIndex
CREATE INDEX "CensusCategory_sortOrder_idx" ON "CensusCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "CensusForm_categoryId_sortOrder_idx" ON "CensusForm"("categoryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CensusForm_categoryId_slug_key" ON "CensusForm"("categoryId", "slug");

-- CreateIndex
CREATE INDEX "CategoryProgress_userId_idx" ON "CategoryProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryProgress_userId_categoryId_key" ON "CategoryProgress"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "CensusForm" ADD CONSTRAINT "CensusForm_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CensusCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryProgress" ADD CONSTRAINT "CategoryProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
