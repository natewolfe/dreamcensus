/**
 * Verification script for dream data
 * Checks that the seeded data is properly accessible
 */

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying dream data...\n')

  // Check dream entries
  const dreamCount = await prisma.dreamEntry.count({
    where: { isPublicAnon: true }
  })
  console.log(`✅ Dreams: ${dreamCount}`)

  // Check emotions
  const emotionCount = await prisma.emotion.count()
  console.log(`✅ Emotions: ${emotionCount}`)

  // Check symbols
  const symbolCount = await prisma.symbol.count()
  console.log(`✅ Symbols: ${symbolCount}`)

  // Check emotion associations
  const emotionAssociations = await prisma.dreamEntryEmotion.count()
  console.log(`✅ Emotion associations: ${emotionAssociations}`)

  // Check symbol associations
  const symbolAssociations = await prisma.dreamEntrySymbol.count()
  console.log(`✅ Symbol associations: ${symbolAssociations}`)

  // Check aggregate stats
  const stats = await prisma.aggregateStats.findUnique({
    where: { statKey: 'global_stats' }
  })
  
  if (stats) {
    console.log(`✅ Aggregate stats cached: ${new Date(stats.lastUpdated).toLocaleString()}`)
    const data = stats.statValue as any
    console.log(`   - Total dreams: ${data.totalDreams}`)
    console.log(`   - Average clarity: ${data.averageClarity.toFixed(2)}`)
    console.log(`   - Lucid rate: ${(data.lucidRate * 100).toFixed(1)}%`)
    console.log(`   - Nightmare rate: ${(data.nightmareRate * 100).toFixed(1)}%`)
    console.log(`   - Top emotions: ${data.emotionDistribution.slice(0, 3).map((e: any) => e.emotion).join(', ')}`)
    console.log(`   - Top symbols: ${data.symbolFrequency.slice(0, 3).map((s: any) => s.symbol).join(', ')}`)
    console.log(`   - Dream weather points: ${data.dreamWeather.points.length}`)
    console.log(`   - Current condition: ${data.dreamWeather.current.condition}`)
  } else {
    console.log('⚠️  No aggregate stats found')
  }

  console.log('\n✨ Data verification complete!')
}

main()
  .catch((error) => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

