/**
 * Integration test setup utilities for Prisma
 */

import { PrismaClient } from '@/generated/prisma'
import { beforeAll, afterAll, beforeEach } from 'vitest'

// Test database instance
let prisma: PrismaClient

/**
 * Setup test database connection
 * Call this in your test file's beforeAll
 */
export function setupTestDatabase() {
  beforeAll(async () => {
    // Use in-memory SQLite for tests
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file::memory:?cache=shared',
        },
      },
    })
    
    await prisma.$connect()
    
    // Run migrations
    // Note: In a real setup, you'd use `prisma migrate deploy` or similar
    // For now, this is a placeholder for the migration logic
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up database between tests
    await cleanDatabase()
  })
}

/**
 * Get the test Prisma client
 */
export function getTestDb(): PrismaClient {
  if (!prisma) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.')
  }
  return prisma
}

/**
 * Clean all tables in the database
 */
async function cleanDatabase() {
  if (!prisma) return

  const tables = [
    'StreamResponse',
    'StreamQuestion',
    'CensusResponsePart',
    'CensusResponse',
    'CensusStep',
    'ContentBlock',
    'CensusChapter',
    'DreamEntryEmotion',
    'DreamEntrySymbol',
    'DreamEntry',
    'Emotion',
    'Symbol',
    'Session',
    'User',
  ]

  // Delete in reverse order to respect foreign key constraints
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`)
    } catch (error) {
      // Table might not exist yet, ignore
    }
  }
}

/**
 * Create a test user
 */
export async function createTestUser(overrides?: Partial<{
  email: string
  locale: string
  timezone: string
}>) {
  return await prisma.user.create({
    data: {
      email: overrides?.email,
      locale: overrides?.locale || 'en',
      timezone: overrides?.timezone || 'UTC',
    },
  })
}

/**
 * Create a test session
 */
export async function createTestSession(userId: string, overrides?: Partial<{
  expiresAt: Date
}>) {
  return await prisma.session.create({
    data: {
      userId,
      expiresAt: overrides?.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })
}

/**
 * Create a test content block
 */
export async function createTestContentBlock(overrides?: Partial<{
  externalId: string
  kind: string
  label: string
  props: string
}>) {
  return await prisma.contentBlock.create({
    data: {
      externalId: overrides?.externalId || `test-${Date.now()}`,
      kind: overrides?.kind || 'short_text',
      label: overrides?.label || 'Test Question',
      props: overrides?.props || '{}',
    },
  })
}

/**
 * Create a test census chapter
 */
export async function createTestChapter(overrides?: Partial<{
  slug: string
  name: string
  orderIndex: number
  estimatedMinutes: number
}>) {
  return await prisma.censusChapter.create({
    data: {
      slug: overrides?.slug || `test-chapter-${Date.now()}`,
      name: overrides?.name || 'Test Chapter',
      orderIndex: overrides?.orderIndex || 1,
      estimatedMinutes: overrides?.estimatedMinutes || 5,
    },
  })
}

/**
 * Create a test census step
 */
export async function createTestStep(
  blockId: string,
  overrides?: Partial<{
    chapterId: string
    orderHint: number
    analyticsKey: string
  }>
) {
  return await prisma.censusStep.create({
    data: {
      blockId,
      chapterId: overrides?.chapterId,
      orderHint: overrides?.orderHint || 0,
      analyticsKey: overrides?.analyticsKey,
    },
  })
}

/**
 * Create a test stream question
 */
export async function createTestStreamQuestion(overrides?: Partial<{
  text: string
  category: string
  tags: string
  approved: boolean
}>) {
  return await prisma.streamQuestion.create({
    data: {
      text: overrides?.text || 'Test stream question?',
      category: overrides?.category || 'dreams',
      tags: overrides?.tags || '[]',
      approved: overrides?.approved ?? true,
    },
  })
}

