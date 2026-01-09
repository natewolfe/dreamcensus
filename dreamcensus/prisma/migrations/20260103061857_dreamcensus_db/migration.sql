-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "encryptionKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "keyRecoveryMethod" TEXT,
    "keySalt" BYTEA,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deviceId" TEXT,
    "deviceName" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequence" BIGSERIAL NOT NULL,
    "aggregateId" TEXT,
    "aggregateType" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ciphertext" BYTEA,
    "iv" BYTEA,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "audioUrl" TEXT,
    "title" TEXT,
    "emotions" TEXT[],
    "vividness" INTEGER,
    "lucidity" TEXT,
    "dreamTypes" TEXT[],
    "sleepQuality" INTEGER,
    "hoursSlept" DOUBLE PRECISION,
    "wakeTime" TIMESTAMP(3),
    "wakingLifeLink" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreamEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalFact" (
    "id" TEXT NOT NULL,
    "dreamEntryId" TEXT NOT NULL,
    "factType" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "ontologyVersion" INTEGER NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "promptVersion" INTEGER NOT NULL,
    "startIndex" INTEGER,
    "endIndex" INTEGER,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "taxonomyId" TEXT,
    "taxonomyVersion" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamTag" (
    "id" TEXT NOT NULL,
    "dreamEntryId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DreamTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusInstrument" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CensusInstrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusSection" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "estimatedTime" INTEGER NOT NULL DEFAULT 120,

    CONSTRAINT "CensusSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusQuestion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "helpText" TEXT,
    "type" TEXT NOT NULL,
    "props" JSONB NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "validation" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "irtParams" JSONB,

    CONSTRAINT "CensusQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "instrumentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CensusAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionProgress" JSONB NOT NULL,
    "totalCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "scores" JSONB,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CensusProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "responseType" TEXT NOT NULL,
    "responseProps" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT,
    "targetingRules" JSONB,
    "studyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "shownAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PromptResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptHash" TEXT NOT NULL,
    "policyHash" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherAggregate" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "value" JSONB NOT NULL,
    "sampleN" INTEGER NOT NULL,
    "dpEpsilon" DOUBLE PRECISION,
    "dpDelta" DOUBLE PRECISION,
    "minNThreshold" INTEGER NOT NULL DEFAULT 50,
    "region" TEXT,
    "methodVersion" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalWeather" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weather" JSONB NOT NULL,
    "streaks" JSONB,
    "lastComputedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "institution" TEXT,
    "dataScope" JSONB NOT NULL,
    "duration" TEXT,
    "consentText" TEXT NOT NULL,
    "consentVersion" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentVersion" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "withdrawnAt" TIMESTAMP(3),
    "withdrawalReason" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StudyParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "valence" DOUBLE PRECISION NOT NULL,
    "arousal" DOUBLE PRECISION NOT NULL,
    "parentId" TEXT,
    "translations" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Emotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symbol" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "interpretations" JSONB,
    "translations" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Symbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "relatedSlugs" TEXT[],
    "translations" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncQueueItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "SyncQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Event_userId_type_idx" ON "Event"("userId", "type");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");

-- CreateIndex
CREATE INDEX "Event_timestamp_idx" ON "Event"("timestamp");

-- CreateIndex
CREATE INDEX "Event_sequence_idx" ON "Event"("sequence");

-- CreateIndex
CREATE INDEX "Event_aggregateId_aggregateType_idx" ON "Event"("aggregateId", "aggregateType");

-- CreateIndex
CREATE INDEX "DreamEntry_userId_capturedAt_idx" ON "DreamEntry"("userId", "capturedAt");

-- CreateIndex
CREATE INDEX "DreamEntry_capturedAt_idx" ON "DreamEntry"("capturedAt");

-- CreateIndex
CREATE INDEX "JournalFact_dreamEntryId_factType_idx" ON "JournalFact"("dreamEntryId", "factType");

-- CreateIndex
CREATE INDEX "JournalFact_factType_idx" ON "JournalFact"("factType");

-- CreateIndex
CREATE INDEX "JournalFact_modelVersion_idx" ON "JournalFact"("modelVersion");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "DreamTag_tagId_idx" ON "DreamTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "DreamTag_dreamEntryId_tagId_key" ON "DreamTag"("dreamEntryId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "CensusInstrument_slug_key" ON "CensusInstrument"("slug");

-- CreateIndex
CREATE INDEX "CensusInstrument_isActive_sortOrder_idx" ON "CensusInstrument"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "CensusSection_instrumentId_sortOrder_idx" ON "CensusSection"("instrumentId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CensusSection_instrumentId_slug_key" ON "CensusSection"("instrumentId", "slug");

-- CreateIndex
CREATE INDEX "CensusQuestion_sectionId_sortOrder_idx" ON "CensusQuestion"("sectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CensusQuestion_sectionId_slug_key" ON "CensusQuestion"("sectionId", "slug");

-- CreateIndex
CREATE INDEX "CensusAnswer_userId_idx" ON "CensusAnswer"("userId");

-- CreateIndex
CREATE INDEX "CensusAnswer_questionId_idx" ON "CensusAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "CensusAnswer_userId_questionId_key" ON "CensusAnswer"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "CensusProgress_userId_key" ON "CensusProgress"("userId");

-- CreateIndex
CREATE INDEX "CensusProgress_userId_idx" ON "CensusProgress"("userId");

-- CreateIndex
CREATE INDEX "Prompt_isActive_idx" ON "Prompt"("isActive");

-- CreateIndex
CREATE INDEX "Prompt_type_idx" ON "Prompt"("type");

-- CreateIndex
CREATE INDEX "PromptResponse_userId_idx" ON "PromptResponse"("userId");

-- CreateIndex
CREATE INDEX "PromptResponse_promptId_idx" ON "PromptResponse"("promptId");

-- CreateIndex
CREATE INDEX "PromptResponse_respondedAt_idx" ON "PromptResponse"("respondedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromptResponse_userId_promptId_shownAt_key" ON "PromptResponse"("userId", "promptId", "shownAt");

-- CreateIndex
CREATE INDEX "Consent_userId_scope_idx" ON "Consent"("userId", "scope");

-- CreateIndex
CREATE INDEX "Consent_scope_idx" ON "Consent"("scope");

-- CreateIndex
CREATE INDEX "Consent_timestamp_idx" ON "Consent"("timestamp");

-- CreateIndex
CREATE INDEX "WeatherAggregate_metric_idx" ON "WeatherAggregate"("metric");

-- CreateIndex
CREATE INDEX "WeatherAggregate_period_periodStart_idx" ON "WeatherAggregate"("period", "periodStart");

-- CreateIndex
CREATE INDEX "WeatherAggregate_region_idx" ON "WeatherAggregate"("region");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherAggregate_metric_period_periodStart_region_key" ON "WeatherAggregate"("metric", "period", "periodStart", "region");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalWeather_userId_key" ON "PersonalWeather"("userId");

-- CreateIndex
CREATE INDEX "PersonalWeather_userId_idx" ON "PersonalWeather"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Study_slug_key" ON "Study"("slug");

-- CreateIndex
CREATE INDEX "Study_status_idx" ON "Study"("status");

-- CreateIndex
CREATE INDEX "Study_slug_idx" ON "Study"("slug");

-- CreateIndex
CREATE INDEX "StudyParticipation_studyId_idx" ON "StudyParticipation"("studyId");

-- CreateIndex
CREATE INDEX "StudyParticipation_status_idx" ON "StudyParticipation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StudyParticipation_userId_studyId_key" ON "StudyParticipation"("userId", "studyId");

-- CreateIndex
CREATE UNIQUE INDEX "Emotion_slug_key" ON "Emotion"("slug");

-- CreateIndex
CREATE INDEX "Emotion_slug_idx" ON "Emotion"("slug");

-- CreateIndex
CREATE INDEX "Emotion_parentId_idx" ON "Emotion"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Symbol_slug_key" ON "Symbol"("slug");

-- CreateIndex
CREATE INDEX "Symbol_slug_idx" ON "Symbol"("slug");

-- CreateIndex
CREATE INDEX "Symbol_category_idx" ON "Symbol"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_slug_key" ON "Theme"("slug");

-- CreateIndex
CREATE INDEX "Theme_slug_idx" ON "Theme"("slug");

-- CreateIndex
CREATE INDEX "SyncQueueItem_userId_status_idx" ON "SyncQueueItem"("userId", "status");

-- CreateIndex
CREATE INDEX "SyncQueueItem_status_createdAt_idx" ON "SyncQueueItem"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamEntry" ADD CONSTRAINT "DreamEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalFact" ADD CONSTRAINT "JournalFact_dreamEntryId_fkey" FOREIGN KEY ("dreamEntryId") REFERENCES "DreamEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamTag" ADD CONSTRAINT "DreamTag_dreamEntryId_fkey" FOREIGN KEY ("dreamEntryId") REFERENCES "DreamEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamTag" ADD CONSTRAINT "DreamTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusSection" ADD CONSTRAINT "CensusSection_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "CensusInstrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusQuestion" ADD CONSTRAINT "CensusQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CensusSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusAnswer" ADD CONSTRAINT "CensusAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusAnswer" ADD CONSTRAINT "CensusAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CensusQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptResponse" ADD CONSTRAINT "PromptResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptResponse" ADD CONSTRAINT "PromptResponse_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyParticipation" ADD CONSTRAINT "StudyParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyParticipation" ADD CONSTRAINT "StudyParticipation_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emotion" ADD CONSTRAINT "Emotion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Emotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
