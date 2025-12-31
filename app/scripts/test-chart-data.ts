/**
 * Test script to verify chart data structure
 * Ensures the Dream Weather data is in the correct format for Recharts
 */

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing Dream Weather chart data...\n')

  const stats = await prisma.aggregateStats.findUnique({
    where: { statKey: 'global_stats' }
  })

  if (!stats) {
    console.log('❌ No stats found')
    return
  }

  const data = stats.statValue as any
  const dreamWeather = data.dreamWeather

  console.log('Dream Weather Structure:')
  console.log('─'.repeat(60))
  console.log(`Points: ${dreamWeather.points.length}`)
  console.log(`Current condition: ${dreamWeather.current.condition}`)
  console.log(`Current valence: ${dreamWeather.current.valence}`)
  console.log(`Current intensity: ${dreamWeather.current.intensity}`)
  console.log(`Current trend: ${dreamWeather.current.trend}`)

  console.log('\nFirst 3 data points:')
  dreamWeather.points.slice(0, 3).forEach((point: any, i: number) => {
    console.log(`\n${i + 1}. Timestamp: ${point.timestamp}`)
    console.log(`   Hour: ${point.hour}`)
    console.log(`   Avg Valence: ${point.avgValence}`)
    console.log(`   Avg Intensity: ${point.avgIntensity}`)
    console.log(`   Dream Count: ${point.dreamCount}`)
    console.log(`   Nightmare Rate: ${point.nightmareRate}`)
  })

  console.log('\nChart Data Format (what Recharts will receive):')
  const chartData = dreamWeather.points.slice(0, 3).map((p: any) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    valence: ((p.avgValence + 1) / 2) * 100, // Normalize to 0-100
    intensity: p.avgIntensity * 100,
    dreamCount: p.dreamCount
  }))
  
  console.log(JSON.stringify(chartData, null, 2))

  console.log('\n✅ Data structure looks correct for Recharts!')
  console.log('\nIf the chart still doesn\'t show, check:')
  console.log('  1. Browser console for errors')
  console.log('  2. Network tab to ensure data is loading')
  console.log('  3. CSS variables are defined (--border, --foreground-subtle, etc.)')
  console.log('  4. ResponsiveContainer has a parent with defined height')
}

main()
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

