/**
 * Migration script from SQLite to PostgreSQL
 * 
 * Usage:
 *   SQLITE_URL="file:./prisma/dev.db" \
 *   DATABASE_URL="postgresql://..." \
 *   npx tsx scripts/migrate-to-postgres.ts
 */

import { PrismaClient } from '@prisma/client'

const sqliteUrl = process.env.SQLITE_URL || 'file:./prisma/dev.db'
const postgresUrl = process.env.DATABASE_URL

if (!postgresUrl) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

// Create two separate clients
const sqlite = new PrismaClient({
  datasources: {
    db: { url: sqliteUrl },
  },
})

const postgres = new PrismaClient({
  datasources: {
    db: { url: postgresUrl },
  },
})

interface MigrationStats {
  table: string
  count: number
  duration: number
}

const stats: MigrationStats[] = []

async function migrateTable<T extends Record<string, any>>(
  tableName: string,
  fetchFn: () => Promise<T[]>,
  createFn: (data: T[]) => Promise<any>,
  transformFn?: (item: T) => any
) {
  const start = Date.now()
  console.log(`\n📦 Migrating ${tableName}...`)
  
  try {
    const items = await fetchFn()
    console.log(`   Found ${items.length} records`)
    
    if (items.length === 0) {
      stats.push({ table: tableName, count: 0, duration: Date.now() - start })
      return
    }
    
    // Transform data if needed (e.g., JSON string to JSON object)
    const transformedItems = transformFn 
      ? items.map(transformFn)
      : items
    
    // Batch insert (PostgreSQL handles this efficiently)
    await createFn(transformedItems)
    
    const duration = Date.now() - start
    stats.push({ table: tableName, count: items.length, duration })
    console.log(`   ✅ Migrated ${items.length} records in ${duration}ms`)
  } catch (error) {
    console.error(`   ❌ Error migrating ${tableName}:`, error)
    throw error
  }
}

async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL\n')
  console.log(`   Source: ${sqliteUrl}`)
  console.log(`   Target: ${postgresUrl.replace(/:[^:@]+@/, ':****@')}`)
  
  try {
    await sqlite.$connect()
    await postgres.$connect()
    console.log('\n✅ Connected to both databases')
    
    // Migrate in order respecting foreign key constraints
    
    // 1. Users (no dependencies)
    await migrateTable(
      'User',
      () => sqlite.user.findMany(),
      (data) => postgres.user.createMany({ data, skipDuplicates: true })
    )
    
    // 2. Sessions (depends on User)
    await migrateTable(
      'Session',
      () => sqlite.session.findMany(),
      (data) => postgres.session.createMany({ data, skipDuplicates: true })
    )
    
    // 3. ContentBlock (no dependencies)
    await migrateTable(
      'ContentBlock',
      () => sqlite.contentBlock.findMany(),
      (data) => postgres.contentBlock.createMany({ data, skipDuplicates: true }),
      (item) => ({
        ...item,
        props: typeof item.props === 'string' ? JSON.parse(item.props) : item.props,
      })
    )
    
    // 4. CensusChapter (no dependencies)
    await migrateTable(
      'CensusChapter',
      () => sqlite.censusChapter.findMany(),
      (data) => postgres.censusChapter.createMany({ data, skipDuplicates: true })
    )
    
    // 5. CensusStep (depends on ContentBlock, CensusChapter)
    await migrateTable(
      'CensusStep',
      () => sqlite.censusStep.findMany(),
      (data) => postgres.censusStep.createMany({ data, skipDuplicates: true })
    )
    
    // 6. CensusResponse (depends on User)
    await migrateTable(
      'CensusResponse',
      () => sqlite.censusResponse.findMany(),
      (data) => postgres.censusResponse.createMany({ data, skipDuplicates: true })
    )
    
    // 7. CensusResponsePart (depends on CensusResponse, CensusStep)
    await migrateTable(
      'CensusResponsePart',
      () => sqlite.censusResponsePart.findMany(),
      (data) => postgres.censusResponsePart.createMany({ data, skipDuplicates: true }),
      (item) => ({
        ...item,
        answer: typeof item.answer === 'string' ? JSON.parse(item.answer) : item.answer,
      })
    )
    
    // 8. StreamQuestion (no dependencies)
    await migrateTable(
      'StreamQuestion',
      () => sqlite.streamQuestion.findMany(),
      (data) => postgres.streamQuestion.createMany({ data, skipDuplicates: true }),
      (item) => ({
        ...item,
        tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags,
        yesFollowups: typeof item.yesFollowups === 'string' ? JSON.parse(item.yesFollowups) : item.yesFollowups,
        noFollowups: typeof item.noFollowups === 'string' ? JSON.parse(item.noFollowups) : item.noFollowups,
      })
    )
    
    // 9. StreamResponse (depends on StreamQuestion)
    await migrateTable(
      'StreamResponse',
      () => sqlite.streamResponse.findMany(),
      (data) => postgres.streamResponse.createMany({ data, skipDuplicates: true }),
      (item) => ({
        ...item,
        threadPath: typeof item.threadPath === 'string' ? JSON.parse(item.threadPath) : item.threadPath,
      })
    )
    
    // 10. Symbol (no dependencies)
    await migrateTable(
      'Symbol',
      () => sqlite.symbol.findMany(),
      (data) => postgres.symbol.createMany({ data, skipDuplicates: true })
    )
    
    // 11. Emotion (no dependencies)
    await migrateTable(
      'Emotion',
      () => sqlite.emotion.findMany(),
      (data) => postgres.emotion.createMany({ data, skipDuplicates: true })
    )
    
    // 12. DreamEntry (depends on User)
    await migrateTable(
      'DreamEntry',
      () => sqlite.dreamEntry.findMany(),
      (data) => postgres.dreamEntry.createMany({ data, skipDuplicates: true })
    )
    
    // 13. DreamEntrySymbol (depends on DreamEntry, Symbol)
    await migrateTable(
      'DreamEntrySymbol',
      () => sqlite.dreamEntrySymbol.findMany(),
      (data) => postgres.dreamEntrySymbol.createMany({ data, skipDuplicates: true })
    )
    
    // 14. DreamEntryEmotion (depends on DreamEntry, Emotion)
    await migrateTable(
      'DreamEntryEmotion',
      () => sqlite.dreamEntryEmotion.findMany(),
      (data) => postgres.dreamEntryEmotion.createMany({ data, skipDuplicates: true })
    )
    
    // Print summary
    console.log('\n\n📊 Migration Summary:')
    console.log('━'.repeat(60))
    
    const totalRecords = stats.reduce((sum, s) => sum + s.count, 0)
    const totalDuration = stats.reduce((sum, s) => sum + s.duration, 0)
    
    stats.forEach(({ table, count, duration }) => {
      const padded = table.padEnd(25)
      const countStr = count.toString().padStart(6)
      const durationStr = `${duration}ms`.padStart(8)
      console.log(`   ${padded} ${countStr} records  ${durationStr}`)
    })
    
    console.log('━'.repeat(60))
    console.log(`   ${'TOTAL'.padEnd(25)} ${totalRecords.toString().padStart(6)} records  ${totalDuration}ms`)
    console.log('\n✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

// Run migration
migrate()

