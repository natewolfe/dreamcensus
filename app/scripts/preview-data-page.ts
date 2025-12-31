/**
 * Preview what the Data Observatory page will display
 * Simulates the data fetching that happens on /data page
 */

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Data Observatory Preview\n')
  console.log('=' .repeat(60))

  // Fetch aggregate stats (same as data page)
  const stats = await prisma.aggregateStats.findUnique({
    where: { statKey: 'global_stats' }
  })

  if (!stats) {
    console.log('\n❌ No aggregate stats found')
    console.log('   Run: npx tsx scripts/seed-dream-data.ts')
    return
  }

  const data = stats.statValue as any

  // Display what the page shows
  console.log('\n🌤️  DREAM WEATHER')
  console.log('─'.repeat(60))
  console.log(`Current Condition: ${data.dreamWeather.current.condition.toUpperCase()}`)
  console.log(`Valence: ${data.dreamWeather.current.valence.toFixed(2)} (-1 to 1)`)
  console.log(`Intensity: ${data.dreamWeather.current.intensity.toFixed(2)} (0 to 1)`)
  console.log(`Trend: ${data.dreamWeather.current.trend}`)
  console.log(`Data Points: ${data.dreamWeather.points.length} hours`)

  console.log('\n📈 KEY METRICS')
  console.log('─'.repeat(60))
  console.log(`Total Dreams:    ${data.totalDreams.toLocaleString()}`)
  console.log(`Avg Clarity:     ${data.averageClarity.toFixed(1)}/5`)
  console.log(`Lucid Rate:      ${(data.lucidRate * 100).toFixed(0)}%`)
  console.log(`Nightmare Rate:  ${(data.nightmareRate * 100).toFixed(0)}%`)

  console.log('\n🏷️  TOP SYMBOLS')
  console.log('─'.repeat(60))
  data.symbolFrequency.slice(0, 10).forEach((symbol: any, i: number) => {
    const bar = '█'.repeat(Math.ceil(symbol.count / 5))
    console.log(`${(i + 1).toString().padStart(2)}. ${symbol.symbol.padEnd(20)} ${bar} ${symbol.count}`)
  })

  console.log('\n💭 EMOTION DISTRIBUTION')
  console.log('─'.repeat(60))
  data.emotionDistribution.slice(0, 10).forEach((emotion: any, i: number) => {
    const bar = '█'.repeat(Math.ceil(emotion.count / 5))
    console.log(`${(i + 1).toString().padStart(2)}. ${emotion.emotion.padEnd(20)} ${bar} ${emotion.count}`)
  })

  console.log('\n🌊 DREAM WEATHER TIMELINE (Last 12 hours)')
  console.log('─'.repeat(60))
  const recentPoints = data.dreamWeather.points.slice(-12)
  recentPoints.forEach((point: any) => {
    const time = new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const valenceBar = point.avgValence > 0 
      ? '▲'.repeat(Math.ceil(point.avgValence * 10))
      : '▼'.repeat(Math.ceil(Math.abs(point.avgValence) * 10))
    const condition = point.avgValence < -0.4 ? '⛈️ ' : 
                     point.avgValence < -0.1 ? '☁️ ' : 
                     point.avgValence < 0.2 ? '🌤️ ' : 
                     point.avgValence < 0.5 ? '☀️ ' : '✨'
    console.log(`${time}  ${condition} ${valenceBar} (${point.dreamCount} dreams)`)
  })

  console.log('\n' + '='.repeat(60))
  console.log('✨ Visit http://localhost:3000/data to see this live!')
  console.log('='.repeat(60))
}

main()
  .catch((error) => {
    console.error('❌ Preview failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

