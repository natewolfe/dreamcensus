/**
 * Test Data Seeding Script
 * 
 * Generates mock users, consents, and dream entries for testing
 * the Weather page and related components.
 * 
 * Run with: pnpm db:seed-test
 */

import { PrismaClient } from '@/generated/prisma'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Emotion pools by valence category (maps to weather conditions)
const EMOTION_POOLS = {
  stormy: ['fear', 'dread', 'terror', 'panic', 'horror'],          // valence < -0.4
  cloudy: ['anxiety', 'sadness', 'anger', 'frustration'],          // valence -0.4 to -0.1
  calm: ['confusion', 'nostalgia', 'contemplation', 'surprise'],   // valence -0.1 to 0.2
  pleasant: ['hope', 'contentment', 'peace', 'relief'],            // valence 0.2 to 0.5
  radiant: ['joy', 'love', 'bliss', 'ecstasy', 'wonder'],          // valence > 0.5
} as const

type WeatherType = keyof typeof EMOTION_POOLS

/**
 * Pick weighted weather type - more neutral/positive dreams
 */
function pickWeightedWeather(): WeatherType {
  const weights = {
    stormy: 0.1,    // 10% - nightmares/intense negative
    cloudy: 0.15,   // 15% - mildly negative
    calm: 0.35,     // 35% - neutral
    pleasant: 0.25, // 25% - positive
    radiant: 0.15,  // 15% - very positive
  }
  
  const rand = Math.random()
  let cumulative = 0
  
  for (const [weather, weight] of Object.entries(weights)) {
    cumulative += weight
    if (rand < cumulative) return weather as WeatherType
  }
  
  return 'calm'
}

/**
 * Pick random emotions from a weather category
 */
function pickEmotions(weatherType: WeatherType, count: number): string[] {
  const pool = EMOTION_POOLS[weatherType]
  const selected: string[] = []
  
  for (let i = 0; i < count; i++) {
    const emotion = pool[Math.floor(Math.random() * pool.length)]
    if (!selected.includes(emotion)) {
      selected.push(emotion)
    }
  }
  
  return selected
}

/**
 * Create test users with commons consent
 */
async function seedTestUsers() {
  console.log('👥 Creating test users...')
  const users = []
  
  for (let i = 1; i <= 5; i++) {
    const email = `dreamer${i}@test.local`
    
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        displayName: `Test Dreamer ${i}`,
        timezone: 'America/New_York',
      },
      update: {},
    })
    
    // Check if commons consent already exists
    const existingConsent = await prisma.consent.findFirst({
      where: {
        userId: user.id,
        scope: 'commons',
      },
    })
    
    if (!existingConsent) {
      // Create commons consent for collective weather
      await prisma.consent.create({
        data: {
          userId: user.id,
          scope: 'commons',
          version: 1,
          granted: true,
          receiptHash: createHash('sha256').update(`${user.id}-commons-${Date.now()}`).digest('hex'),
          policyHash: createHash('sha256').update('commons-policy-v1').digest('hex'),
        },
      })
      console.log(`  ✓ Created user: ${email} (with commons consent)`)
    } else {
      console.log(`  ✓ User exists: ${email} (consent already granted)`)
    }
    
    users.push(user)
  }
  
  return users
}

/**
 * Create dream entries distributed across 90 days
 */
async function seedDreamEntries(users: Array<{ id: string; email: string | null }>) {
  console.log('💭 Creating dream entries...')
  
  const now = Date.now()
  const dreamCount = 500 // Comprehensive coverage across all time ranges
  
  // Delete existing test dreams to avoid duplicates
  const testUserIds = users.map(u => u.id)
  const deleted = await prisma.dreamEntry.deleteMany({
    where: { userId: { in: testUserIds } },
  })
  console.log(`  ✓ Cleaned up ${deleted.count} existing test dreams`)
  
  for (let i = 0; i < dreamCount; i++) {
    const user = users[i % users.length]
    
    // Distribute timestamps across 90 days window
    // Use a distribution that favors recent days (more realistic)
    const daysAgo = Math.floor(Math.random() * Math.random() * 90) // Weighted toward recent
    const hoursOffset = Math.floor(Math.random() * 24) // Random hour of that day
    const capturedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - hoursOffset * 60 * 60 * 1000)
    
    // Vary the weather conditions with weighted distribution
    const weatherType = pickWeightedWeather()
    const emotionCount = 2 + Math.floor(Math.random() * 3) // 2-4 emotions
    const emotions = pickEmotions(weatherType, emotionCount)
    
    const isNightmare = weatherType === 'stormy' && Math.random() > 0.5
    const isLucid = Math.random() > 0.85 // 15% lucid
    const isRecurring = Math.random() > 0.9 // 10% recurring
    
    const dreamTypes = [
      isNightmare ? 'nightmare' : 'normal',
      ...(isLucid ? ['lucid'] : []),
      ...(isRecurring ? ['recurring'] : []),
    ]
    
    await prisma.dreamEntry.create({
      data: {
        userId: user.id,
        emotions,
        vividness: 20 + Math.floor(Math.random() * 75), // 20-95
        lucidity: isLucid ? 'yes' : Math.random() > 0.7 ? 'maybe' : 'no',
        dreamTypes,
        sleepQuality: 40 + Math.floor(Math.random() * 50), // 40-90
        hoursSlept: 5 + Math.random() * 4, // 5-9 hours
        capturedAt,
      },
    })
    
    if ((i + 1) % 50 === 0) {
      console.log(`  ✓ Created ${i + 1}/${dreamCount} dreams`)
    }
  }
  
  console.log(`  ✓ Created ${dreamCount} dream entries`)
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Seeding test data...\n')
  
  try {
    // Create users with consents
    const users = await seedTestUsers()
    console.log(`✓ ${users.length} users ready\n`)
    
    // Create dream entries
    await seedDreamEntries(users)
    console.log('')
    
    // Summary
    const totalDreams = await prisma.dreamEntry.count()
    const totalUsers = await prisma.user.count()
    const commonsConsents = await prisma.consent.count({
      where: { scope: 'commons', granted: true },
    })
    
    console.log('📊 Database Summary:')
    console.log(`  • Total users: ${totalUsers}`)
    console.log(`  • Users with commons consent: ${commonsConsents}`)
    console.log(`  • Total dreams: ${totalDreams}`)
    console.log('')
    console.log('✅ Test data seeded successfully!')
    console.log('   Visit /weather to see the Dream Weather Chart')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

