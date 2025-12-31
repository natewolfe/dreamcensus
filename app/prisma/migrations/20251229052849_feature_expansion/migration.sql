-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "displayName" TEXT,
    "birthYear" INTEGER,
    "country" TEXT,
    "dreamFrequency" TEXT,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "consentData" BOOLEAN NOT NULL DEFAULT false,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "help" TEXT,
    "props" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceHash" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusChapter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "iconEmoji" TEXT,
    "estimatedMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CensusChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusStep" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "chapterId" TEXT,
    "parentId" TEXT,
    "orderHint" INTEGER NOT NULL,
    "analyticsKey" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CensusStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "device" TEXT,
    "userAgent" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CensusResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusResponsePart" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CensusResponsePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "tier" INTEGER NOT NULL DEFAULT 2,
    "parentId" TEXT,
    "yesFollowups" JSONB NOT NULL DEFAULT '[]',
    "noFollowups" JSONB NOT NULL DEFAULT '[]',
    "timesShown" INTEGER NOT NULL DEFAULT 0,
    "yesCount" INTEGER NOT NULL DEFAULT 0,
    "noCount" INTEGER NOT NULL DEFAULT 0,
    "expandRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "expandedText" TEXT,
    "threadPath" JSONB NOT NULL DEFAULT '[]',
    "timeOnCard" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "captureMode" TEXT NOT NULL DEFAULT 'text',
    "textRaw" TEXT NOT NULL,
    "transcript" TEXT,
    "audioUrl" TEXT,
    "drawingUrl" TEXT,
    "clarity" INTEGER,
    "lucidity" INTEGER,
    "emotional" INTEGER,
    "isNightmare" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "sleepDuration" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "isPublicAnon" BOOLEAN NOT NULL DEFAULT true,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreamEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symbol" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxonomy" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "Symbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "valence" DOUBLE PRECISION,
    "arousal" DOUBLE PRECISION,
    "locale" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "Emotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamEntrySymbol" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "DreamEntrySymbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamEntryEmotion" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "emotionId" TEXT NOT NULL,
    "intensity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "DreamEntryEmotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AggregateStats" (
    "id" TEXT NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" JSONB NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AggregateStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_userId_idx" ON "VerificationToken"("userId");

-- CreateIndex
CREATE INDEX "VerificationToken_token_idx" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_externalId_key" ON "ContentBlock"("externalId");

-- CreateIndex
CREATE INDEX "ContentBlock_kind_idx" ON "ContentBlock"("kind");

-- CreateIndex
CREATE INDEX "ContentBlock_locale_idx" ON "ContentBlock"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "CensusChapter_slug_key" ON "CensusChapter"("slug");

-- CreateIndex
CREATE INDEX "CensusChapter_orderIndex_idx" ON "CensusChapter"("orderIndex");

-- CreateIndex
CREATE INDEX "CensusStep_parentId_idx" ON "CensusStep"("parentId");

-- CreateIndex
CREATE INDEX "CensusStep_orderHint_idx" ON "CensusStep"("orderHint");

-- CreateIndex
CREATE INDEX "CensusStep_chapterId_idx" ON "CensusStep"("chapterId");

-- CreateIndex
CREATE INDEX "CensusStep_chapterId_version_idx" ON "CensusStep"("chapterId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "CensusStep_blockId_version_key" ON "CensusStep"("blockId", "version");

-- CreateIndex
CREATE INDEX "CensusResponse_userId_idx" ON "CensusResponse"("userId");

-- CreateIndex
CREATE INDEX "CensusResponse_status_idx" ON "CensusResponse"("status");

-- CreateIndex
CREATE INDEX "CensusResponse_userId_version_status_idx" ON "CensusResponse"("userId", "version", "status");

-- CreateIndex
CREATE INDEX "CensusResponsePart_stepId_idx" ON "CensusResponsePart"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "CensusResponsePart_responseId_stepId_key" ON "CensusResponsePart"("responseId", "stepId");

-- CreateIndex
CREATE INDEX "StreamQuestion_category_idx" ON "StreamQuestion"("category");

-- CreateIndex
CREATE INDEX "StreamQuestion_tier_idx" ON "StreamQuestion"("tier");

-- CreateIndex
CREATE INDEX "StreamQuestion_approved_idx" ON "StreamQuestion"("approved");

-- CreateIndex
CREATE INDEX "StreamResponse_userId_idx" ON "StreamResponse"("userId");

-- CreateIndex
CREATE INDEX "StreamResponse_questionId_idx" ON "StreamResponse"("questionId");

-- CreateIndex
CREATE INDEX "StreamResponse_createdAt_idx" ON "StreamResponse"("createdAt");

-- CreateIndex
CREATE INDEX "StreamResponse_userId_createdAt_idx" ON "StreamResponse"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DreamEntry_userId_idx" ON "DreamEntry"("userId");

-- CreateIndex
CREATE INDEX "DreamEntry_capturedAt_idx" ON "DreamEntry"("capturedAt");

-- CreateIndex
CREATE INDEX "DreamEntry_userId_capturedAt_idx" ON "DreamEntry"("userId", "capturedAt");

-- CreateIndex
CREATE INDEX "DreamEntry_isPublicAnon_aiProcessed_idx" ON "DreamEntry"("isPublicAnon", "aiProcessed");

-- CreateIndex
CREATE UNIQUE INDEX "Symbol_name_locale_key" ON "Symbol"("name", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Emotion_name_locale_key" ON "Emotion"("name", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "DreamEntrySymbol_entryId_symbolId_key" ON "DreamEntrySymbol"("entryId", "symbolId");

-- CreateIndex
CREATE UNIQUE INDEX "DreamEntryEmotion_entryId_emotionId_key" ON "DreamEntryEmotion"("entryId", "emotionId");

-- CreateIndex
CREATE UNIQUE INDEX "AggregateStats_statKey_key" ON "AggregateStats"("statKey");

-- CreateIndex
CREATE INDEX "AggregateStats_statKey_idx" ON "AggregateStats"("statKey");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusStep" ADD CONSTRAINT "CensusStep_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ContentBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusStep" ADD CONSTRAINT "CensusStep_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "CensusChapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusStep" ADD CONSTRAINT "CensusStep_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CensusStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusResponse" ADD CONSTRAINT "CensusResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusResponsePart" ADD CONSTRAINT "CensusResponsePart_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "CensusResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusResponsePart" ADD CONSTRAINT "CensusResponsePart_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "CensusStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamResponse" ADD CONSTRAINT "StreamResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "StreamQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamEntry" ADD CONSTRAINT "DreamEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamEntrySymbol" ADD CONSTRAINT "DreamEntrySymbol_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DreamEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamEntrySymbol" ADD CONSTRAINT "DreamEntrySymbol_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "Symbol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamEntryEmotion" ADD CONSTRAINT "DreamEntryEmotion_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DreamEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamEntryEmotion" ADD CONSTRAINT "DreamEntryEmotion_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "Emotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
