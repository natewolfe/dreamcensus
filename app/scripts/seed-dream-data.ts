/**
 * Seed script for Dream Data
 * Creates mock dream entries with emotions and symbols for testing the Data Observatory
 * 
 * Usage:
 *   cd app
 *   npx tsx scripts/seed-dream-data.ts
 */

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

// Common dream emotions with valence/arousal
const emotionsData = [
  { name: 'Joy', valence: 0.8, arousal: 0.7 },
  { name: 'Fear', valence: -0.7, arousal: 0.9 },
  { name: 'Anxiety', valence: -0.5, arousal: 0.7 },
  { name: 'Peace', valence: 0.6, arousal: 0.2 },
  { name: 'Confusion', valence: -0.2, arousal: 0.5 },
  { name: 'Excitement', valence: 0.7, arousal: 0.9 },
  { name: 'Sadness', valence: -0.6, arousal: 0.3 },
  { name: 'Wonder', valence: 0.5, arousal: 0.6 },
  { name: 'Love', valence: 0.9, arousal: 0.6 },
  { name: 'Anger', valence: -0.8, arousal: 0.8 },
  { name: 'Curiosity', valence: 0.4, arousal: 0.6 },
  { name: 'Relief', valence: 0.5, arousal: 0.3 },
  { name: 'Nostalgia', valence: 0.3, arousal: 0.4 },
  { name: 'Terror', valence: -0.9, arousal: 1.0 },
  { name: 'Calmness', valence: 0.5, arousal: 0.1 },
]

// Common dream symbols grouped by taxonomy
const symbolsData = [
  // People & Relationships
  { name: 'Family', taxonomy: 'people' },
  { name: 'Stranger', taxonomy: 'people' },
  { name: 'Friend', taxonomy: 'people' },
  { name: 'Child', taxonomy: 'people' },
  { name: 'Authority Figure', taxonomy: 'people' },
  
  // Places
  { name: 'House', taxonomy: 'places' },
  { name: 'School', taxonomy: 'places' },
  { name: 'Ocean', taxonomy: 'places' },
  { name: 'Forest', taxonomy: 'places' },
  { name: 'City', taxonomy: 'places' },
  { name: 'Childhood Home', taxonomy: 'places' },
  { name: 'Mountain', taxonomy: 'places' },
  
  // Animals
  { name: 'Dog', taxonomy: 'animals' },
  { name: 'Cat', taxonomy: 'animals' },
  { name: 'Snake', taxonomy: 'animals' },
  { name: 'Bird', taxonomy: 'animals' },
  { name: 'Spider', taxonomy: 'animals' },
  { name: 'Horse', taxonomy: 'animals' },
  
  // Objects
  { name: 'Door', taxonomy: 'objects' },
  { name: 'Mirror', taxonomy: 'objects' },
  { name: 'Car', taxonomy: 'objects' },
  { name: 'Phone', taxonomy: 'objects' },
  { name: 'Book', taxonomy: 'objects' },
  { name: 'Key', taxonomy: 'objects' },
  
  // Actions & Themes
  { name: 'Flying', taxonomy: 'actions' },
  { name: 'Falling', taxonomy: 'actions' },
  { name: 'Chase', taxonomy: 'actions' },
  { name: 'Lost', taxonomy: 'themes' },
  { name: 'Late', taxonomy: 'themes' },
  { name: 'Naked', taxonomy: 'themes' },
  { name: 'Death', taxonomy: 'themes' },
  { name: 'Water', taxonomy: 'elements' },
  { name: 'Fire', taxonomy: 'elements' },
  { name: 'Darkness', taxonomy: 'elements' },
]

// Sample dream texts with metadata hints
const dreamTemplates = [
  {
    text: "I was flying over my childhood neighborhood. Everything looked familiar but slightly different. I felt completely free and euphoric.",
    symbols: ['Flying', 'Childhood Home'],
    emotions: ['Joy', 'Wonder'],
    clarity: 4, lucidity: 2, emotional: 4, isNightmare: false,
  },
  {
    text: "I was being chased through a dark forest by something I couldn't see. My heart was pounding and I kept stumbling.",
    symbols: ['Chase', 'Forest', 'Darkness'],
    emotions: ['Fear', 'Anxiety'],
    clarity: 3, lucidity: 1, emotional: 5, isNightmare: true,
  },
  {
    text: "I was back in school taking a test I hadn't studied for. Everyone else seemed to know what they were doing.",
    symbols: ['School', 'Anxiety'],
    emotions: ['Anxiety', 'Confusion'],
    clarity: 3, lucidity: 1, emotional: 4, isNightmare: false,
  },
  {
    text: "I was swimming in a crystal clear ocean. Fish of every color surrounded me. I could breathe underwater.",
    symbols: ['Ocean', 'Water'],
    emotions: ['Peace', 'Wonder'],
    clarity: 5, lucidity: 3, emotional: 3, isNightmare: false,
  },
  {
    text: "My childhood dog was there, looking just like I remember. We played together in the backyard.",
    symbols: ['Dog', 'Childhood Home'],
    emotions: ['Joy', 'Nostalgia'],
    clarity: 4, lucidity: 1, emotional: 4, isNightmare: false,
  },
  {
    text: "I couldn't find my car in a massive parking lot. I kept pressing the key fob but nothing responded.",
    symbols: ['Car', 'Lost', 'Key'],
    emotions: ['Anxiety', 'Confusion'],
    clarity: 3, lucidity: 1, emotional: 3, isNightmare: false,
  },
  {
    text: "I was talking to my grandmother who passed away years ago. She gave me advice about something I'm struggling with.",
    symbols: ['Family', 'Death'],
    emotions: ['Love', 'Sadness', 'Peace'],
    clarity: 5, lucidity: 2, emotional: 5, isNightmare: false,
  },
  {
    text: "There was a snake in my bedroom. I was frozen, unable to move or scream. It kept getting closer.",
    symbols: ['Snake', 'House'],
    emotions: ['Terror', 'Fear'],
    clarity: 4, lucidity: 1, emotional: 5, isNightmare: true,
  },
  {
    text: "I discovered a hidden room in my house I'd never noticed before. It was filled with old books and mysterious objects.",
    symbols: ['House', 'Door', 'Book'],
    emotions: ['Curiosity', 'Wonder'],
    clarity: 4, lucidity: 2, emotional: 3, isNightmare: false,
  },
  {
    text: "I was standing on top of a mountain watching the sunrise. Everything felt peaceful and meaningful.",
    symbols: ['Mountain'],
    emotions: ['Peace', 'Joy'],
    clarity: 5, lucidity: 3, emotional: 4, isNightmare: false,
  },
  {
    text: "I looked in the mirror and didn't recognize my own reflection. It was disturbing and surreal.",
    symbols: ['Mirror'],
    emotions: ['Confusion', 'Fear'],
    clarity: 4, lucidity: 2, emotional: 4, isNightmare: false,
  },
  {
    text: "I was late for something important but couldn't remember what. I kept trying to run but moved in slow motion.",
    symbols: ['Late'],
    emotions: ['Anxiety', 'Confusion'],
    clarity: 3, lucidity: 1, emotional: 4, isNightmare: false,
  },
  {
    text: "I was at a party where I suddenly realized I was naked. Everyone else was fully dressed.",
    symbols: ['Naked', 'Stranger'],
    emotions: ['Anxiety', 'Fear'],
    clarity: 3, lucidity: 1, emotional: 4, isNightmare: false,
  },
  {
    text: "I could control the dream and decided to explore a vast city made of glass. Everything shimmered in the light.",
    symbols: ['City'],
    emotions: ['Excitement', 'Wonder'],
    clarity: 5, lucidity: 5, emotional: 4, isNightmare: false,
  },
  {
    text: "Birds were following me everywhere I went, chirping and swooping around my head. It felt ominous.",
    symbols: ['Bird'],
    emotions: ['Anxiety', 'Confusion'],
    clarity: 3, lucidity: 1, emotional: 3, isNightmare: false,
  },
  {
    text: "I was having a conversation with a stranger who seemed to know everything about me. They offered cryptic advice.",
    symbols: ['Stranger'],
    emotions: ['Curiosity', 'Confusion'],
    clarity: 4, lucidity: 2, emotional: 3, isNightmare: false,
  },
  {
    text: "I was falling from a tall building. The ground kept getting closer but I never hit it. I woke up just before impact.",
    symbols: ['Falling'],
    emotions: ['Fear', 'Terror'],
    clarity: 4, lucidity: 1, emotional: 5, isNightmare: true,
  },
  {
    text: "My phone kept ringing but I couldn't answer it. Each time I tried, it would slip out of my hands.",
    symbols: ['Phone'],
    emotions: ['Anxiety', 'Confusion'],
    clarity: 3, lucidity: 1, emotional: 3, isNightmare: false,
  },
  {
    text: "I was walking through an endless field of flowers under a bright sky. Everything felt perfect.",
    symbols: ['Peace'],
    emotions: ['Joy', 'Peace', 'Calmness'],
    clarity: 4, lucidity: 2, emotional: 2, isNightmare: false,
  },
  {
    text: "The house was on fire but I couldn't get out. The doors kept leading to more rooms.",
    symbols: ['House', 'Fire', 'Door'],
    emotions: ['Terror', 'Fear'],
    clarity: 4, lucidity: 1, emotional: 5, isNightmare: true,
  },
]

// Generate random timestamp in last 72 hours
function randomRecentDate(): Date {
  const now = Date.now()
  const hours72 = 72 * 60 * 60 * 1000
  const randomTime = now - Math.random() * hours72
  return new Date(randomTime)
}

// Pick random items from array
function randomPick<T>(arr: T[], count: number = 1): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, arr.length))
}

async function main() {
  console.log('🌙 Seeding dream data...\n')

  // 1. Create test users
  console.log('Creating test users...')
  const userEmails = Array.from({ length: 12 }, (_, i) => `dreamer${i + 1}@test.local`)
  const users = []
  
  for (const email of userEmails) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          email,
          displayName: `Dreamer ${users.length + 1}`,
          onboardingStep: 100,
          consentData: true,
        },
      })
      users.push(user)
    } else {
      users.push(existing)
    }
  }
  console.log(`✅ ${users.length} users ready\n`)

  // 2. Create emotions taxonomy
  console.log('Creating emotions taxonomy...')
  const emotions = []
  for (const emotion of emotionsData) {
    const existing = await prisma.emotion.findFirst({
      where: { name: emotion.name, locale: 'en' },
    })
    if (!existing) {
      const created = await prisma.emotion.create({
        data: {
          name: emotion.name,
          valence: emotion.valence,
          arousal: emotion.arousal,
          locale: 'en',
        },
      })
      emotions.push(created)
    } else {
      emotions.push(existing)
    }
  }
  console.log(`✅ ${emotions.length} emotions ready\n`)

  // 3. Create symbols taxonomy
  console.log('Creating symbols taxonomy...')
  const symbols = []
  for (const symbol of symbolsData) {
    const existing = await prisma.symbol.findFirst({
      where: { name: symbol.name, locale: 'en' },
    })
    if (!existing) {
      const created = await prisma.symbol.create({
        data: {
          name: symbol.name,
          taxonomy: symbol.taxonomy,
          locale: 'en',
        },
      })
      symbols.push(created)
    } else {
      symbols.push(existing)
    }
  }
  console.log(`✅ ${symbols.length} symbols ready\n`)

  // 4. Create dream entries
  console.log('Creating dream entries...')
  let dreamCount = 0
  
  // Create ~100 dreams by repeating templates with variations
  const totalDreams = 100
  
  for (let i = 0; i < totalDreams; i++) {
    const template = dreamTemplates[i % dreamTemplates.length]
    const user = users[Math.floor(Math.random() * users.length)]
    
    // Add variation to ratings
    const clarityVariation = Math.floor(Math.random() * 3) - 1
    const lucidityVariation = Math.floor(Math.random() * 3) - 1
    const emotionalVariation = Math.floor(Math.random() * 3) - 1
    
    const dream = await prisma.dreamEntry.create({
      data: {
        userId: user.id,
        textRaw: template.text,
        capturedAt: randomRecentDate(),
        captureMode: 'text',
        clarity: Math.max(1, Math.min(5, template.clarity + clarityVariation)),
        lucidity: Math.max(1, Math.min(5, template.lucidity + lucidityVariation)),
        emotional: Math.max(1, Math.min(5, template.emotional + emotionalVariation)),
        isNightmare: template.isNightmare,
        isRecurring: Math.random() > 0.8, // 20% recurring
        sleepDuration: 6 + Math.random() * 3, // 6-9 hours
        sleepQuality: Math.floor(Math.random() * 5) + 1,
        aiProcessed: true,
        processedAt: new Date(),
        isPublicAnon: true,
      },
    })
    
    // Add emotions
    for (const emotionName of template.emotions) {
      const emotion = emotions.find(e => e.name === emotionName)
      if (emotion) {
        await prisma.dreamEntryEmotion.create({
          data: {
            entryId: dream.id,
            emotionId: emotion.id,
            intensity: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
          },
        })
      }
    }
    
    // Add symbols
    for (const symbolName of template.symbols) {
      const symbol = symbols.find(s => s.name === symbolName)
      if (symbol) {
        await prisma.dreamEntrySymbol.create({
          data: {
            entryId: dream.id,
            symbolId: symbol.id,
            strength: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
          },
        })
      }
    }
    
    // Occasionally add random additional symbols
    if (Math.random() > 0.7) {
      const randomSymbols = randomPick(symbols, 1 + Math.floor(Math.random() * 2))
      for (const symbol of randomSymbols) {
        // Check if not already added
        const existing = await prisma.dreamEntrySymbol.findFirst({
          where: { entryId: dream.id, symbolId: symbol.id },
        })
        if (!existing) {
          await prisma.dreamEntrySymbol.create({
            data: {
              entryId: dream.id,
              symbolId: symbol.id,
              strength: 0.3 + Math.random() * 0.4,
            },
          })
        }
      }
    }
    
    dreamCount++
    if (dreamCount % 20 === 0) {
      console.log(`  Created ${dreamCount} dreams...`)
    }
  }
  
  console.log(`✅ ${dreamCount} dreams created\n`)

  // 5. Calculate aggregate stats
  console.log('Calculating aggregate statistics...')
  const { calculateAggregateStats } = await import('../src/lib/data/aggregates')
  await calculateAggregateStats()
  console.log('✅ Aggregate stats updated\n')

  console.log('🌙 Dream data seeding complete!')
  console.log(`\n📊 Summary:`)
  console.log(`   - ${users.length} users`)
  console.log(`   - ${emotions.length} emotions`)
  console.log(`   - ${symbols.length} symbols`)
  console.log(`   - ${dreamCount} dream entries`)
  console.log(`\n✨ Visit /data to see the Dream Observatory in action!\n`)
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

