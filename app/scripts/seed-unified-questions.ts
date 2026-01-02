/**
 * Seed script for unified Question/Theme system
 * Populates the new unified schema with questions
 */

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

// Theme definitions
const themes = [
  {
    slug: 'threshold',
    name: 'Threshold',
    description: 'Welcome to the Dream Census. Let\'s begin your journey.',
    icon: '🚪',
    orderIndex: 1,
    estimatedMinutes: 5,
    prerequisiteThemeId: null,
  },
  {
    slug: 'dream-recall',
    name: 'Dream Recall',
    description: 'How well do you remember your dreams?',
    icon: '💭',
    orderIndex: 2,
    estimatedMinutes: 8,
    prerequisiteThemeId: null,
  },
  {
    slug: 'lucid-dreaming',
    name: 'Lucid Dreaming',
    description: 'Awareness and control in your dreams',
    icon: '✨',
    orderIndex: 3,
    estimatedMinutes: 10,
    prerequisiteThemeId: null,
  },
  {
    slug: 'dream-content',
    name: 'Dream Content',
    description: 'What do you dream about?',
    icon: '🎭',
    orderIndex: 4,
    estimatedMinutes: 12,
    prerequisiteThemeId: null,
  },
  {
    slug: 'sleep-habits',
    name: 'Sleep Habits',
    description: 'Your relationship with sleep',
    icon: '🌙',
    orderIndex: 5,
    estimatedMinutes: 7,
    prerequisiteThemeId: null,
  },
]

// Question definitions
const questions = [
  // Dream Recall - Tier 1 (Census Core)
  {
    text: 'Do you often remember your dreams?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 1,
    themeSlug: 'dream-recall',
    orderInTheme: 1,
    help: 'This helps us understand your natural dream recall ability',
    tags: ['memory', 'recall'],
  },
  {
    text: 'How often do you have vivid dreams?',
    kind: 'single_choice',
    category: 'dreams',
    tier: 1,
    themeSlug: 'dream-recall',
    orderInTheme: 2,
    help: 'Vivid dreams feel very real and detailed',
    props: {
      choices: [
        { ref: 'never', label: 'Never or almost never' },
        { ref: 'rarely', label: 'Rarely (less than once a month)' },
        { ref: 'sometimes', label: 'Sometimes (1-3 times a month)' },
        { ref: 'often', label: 'Often (1-3 times a week)' },
        { ref: 'very_often', label: 'Very often (4+ times a week)' },
      ],
    },
    tags: ['vividness', 'frequency'],
  },
  {
    text: 'How would you rate your average dream clarity?',
    kind: 'opinion_scale',
    category: 'dreams',
    tier: 1,
    themeSlug: 'dream-recall',
    orderInTheme: 3,
    help: 'Clarity refers to how clear and detailed your dreams are',
    props: {
      steps: 5,
      labels: {
        left: 'Very blurry',
        center: 'Moderately clear',
        right: 'Crystal clear',
      },
    },
    tags: ['clarity', 'vividness'],
  },
  {
    text: 'Do you keep a dream journal?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 2,
    themeSlug: 'dream-recall',
    orderInTheme: 4,
    tags: ['journaling', 'practice'],
  },

  // Lucid Dreaming - Tier 1
  {
    text: 'Have you ever had a lucid dream?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 1,
    themeSlug: 'lucid-dreaming',
    orderInTheme: 1,
    help: 'A lucid dream is when you become aware that you\'re dreaming while still in the dream',
    tags: ['lucid', 'awareness'],
  },
  {
    text: 'How often do you have lucid dreams?',
    kind: 'single_choice',
    category: 'dreams',
    tier: 1,
    themeSlug: 'lucid-dreaming',
    orderInTheme: 2,
    props: {
      choices: [
        { ref: 'never', label: 'Never' },
        { ref: 'once', label: 'Only once or twice ever' },
        { ref: 'rarely', label: 'Rarely (a few times a year)' },
        { ref: 'monthly', label: 'Monthly' },
        { ref: 'weekly', label: 'Weekly or more' },
      ],
    },
    tags: ['lucid', 'frequency'],
  },
  {
    text: 'Can you control what happens in your lucid dreams?',
    kind: 'single_choice',
    category: 'dreams',
    tier: 2,
    themeSlug: 'lucid-dreaming',
    orderInTheme: 3,
    props: {
      choices: [
        { ref: 'no_control', label: 'No control at all' },
        { ref: 'little', label: 'A little control' },
        { ref: 'some', label: 'Some control' },
        { ref: 'good', label: 'Good control' },
        { ref: 'full', label: 'Full control' },
      ],
    },
    tags: ['lucid', 'control'],
  },

  // Dream Content - Tier 1 & 2
  {
    text: 'Have you ever had a recurring dream?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 1,
    themeSlug: 'dream-content',
    orderInTheme: 1,
    tags: ['recurring', 'patterns'],
  },
  {
    text: 'Do you dream in color?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 1,
    themeSlug: 'dream-content',
    orderInTheme: 2,
    tags: ['visuals', 'senses'],
  },
  {
    text: 'Do you dream about flying?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 2,
    themeSlug: 'dream-content',
    orderInTheme: 3,
    tags: ['flying', 'themes', 'freedom'],
  },
  {
    text: 'Have you dreamed of falling?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 2,
    themeSlug: 'dream-content',
    orderInTheme: 4,
    tags: ['falling', 'themes', 'anxiety'],
  },
  {
    text: 'Do you ever have nightmares?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 1,
    themeSlug: 'dream-content',
    orderInTheme: 5,
    tags: ['nightmares', 'fear'],
  },
  {
    text: 'Do you dream about people you know in real life?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 2,
    themeSlug: 'dream-content',
    orderInTheme: 6,
    tags: ['people', 'relationships'],
  },
  {
    text: 'Have you ever had a dream that felt prophetic?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 2,
    themeSlug: 'dream-content',
    orderInTheme: 7,
    tags: ['precognition', 'psychic'],
  },

  // Sleep Habits - Tier 1
  {
    text: 'Have you experienced sleep paralysis?',
    kind: 'yes_no',
    category: 'sleep',
    tier: 1,
    themeSlug: 'sleep-habits',
    orderInTheme: 1,
    tags: ['phenomena', 'sleep disorders'],
  },
  {
    text: 'How many hours do you typically sleep per night?',
    kind: 'single_choice',
    category: 'sleep',
    tier: 1,
    themeSlug: 'sleep-habits',
    orderInTheme: 2,
    props: {
      choices: [
        { ref: 'less_5', label: 'Less than 5 hours' },
        { ref: '5_6', label: '5-6 hours' },
        { ref: '6_7', label: '6-7 hours' },
        { ref: '7_8', label: '7-8 hours' },
        { ref: '8_plus', label: '8+ hours' },
      ],
    },
    tags: ['sleep', 'duration'],
  },
  {
    text: 'Do you sleep better in complete darkness?',
    kind: 'yes_no',
    category: 'sleep',
    tier: 1,
    themeSlug: 'sleep-habits',
    orderInTheme: 3,
    tags: ['environment', 'preferences'],
  },
  {
    text: 'Do you use any sleep aids (medication, white noise, etc.)?',
    kind: 'yes_no',
    category: 'sleep',
    tier: 2,
    themeSlug: 'sleep-habits',
    orderInTheme: 4,
    tags: ['aids', 'habits'],
  },

  // Exploration questions - Tier 3 (no theme)
  {
    text: 'Do you often daydream during conversations?',
    kind: 'yes_no',
    category: 'imagination',
    tier: 3,
    themeSlug: null,
    orderInTheme: null,
    tags: ['daydreaming', 'attention'],
  },
  {
    text: 'Can you visualize scenes from books you read?',
    kind: 'yes_no',
    category: 'imagination',
    tier: 3,
    themeSlug: null,
    orderInTheme: null,
    tags: ['visualization', 'reading'],
  },
  {
    text: 'Do you create fictional worlds or characters in your mind?',
    kind: 'yes_no',
    category: 'imagination',
    tier: 3,
    themeSlug: null,
    orderInTheme: null,
    tags: ['creativity', 'fiction'],
  },
  {
    text: 'Have you ever had an out-of-body experience?',
    kind: 'yes_no',
    category: 'perception',
    tier: 3,
    themeSlug: null,
    orderInTheme: null,
    tags: ['OBE', 'consciousness'],
  },
  {
    text: 'Do you think in images rather than words?',
    kind: 'yes_no',
    category: 'perception',
    tier: 3,
    themeSlug: null,
    orderInTheme: null,
    tags: ['thinking', 'cognition'],
  },
  {
    text: 'Have you ever had a spiritual experience in a dream?',
    kind: 'yes_no',
    category: 'dreams',
    tier: 3,
    themeSlug: null,
    orderInTheme: null,
    tags: ['spirituality', 'transcendence'],
  },
]

async function main() {
  console.log('🌙 Seeding unified Question/Theme system...\n')

  // 1. Create Themes
  console.log('📁 Creating themes...')
  const themeMap = new Map<string, string>() // slug -> id

  for (const themeData of themes) {
    const existing = await prisma.theme.findUnique({
      where: { slug: themeData.slug },
    })

    if (existing) {
      themeMap.set(themeData.slug, existing.id)
      console.log(`  ⏭️  Theme "${themeData.name}" already exists`)
    } else {
      const theme = await prisma.theme.create({
        data: themeData,
      })
      themeMap.set(themeData.slug, theme.id)
      console.log(`  ✅ Created theme: ${themeData.name}`)
    }
  }

  // 2. Create Questions
  console.log('\n💭 Creating questions...')
  let created = 0
  let skipped = 0

  for (const questionData of questions) {
    // Check if question already exists (by text)
    const existing = await prisma.question.findFirst({
      where: { text: questionData.text },
    })

    if (existing) {
      skipped++
      continue
    }

    // Get theme ID from map
    const themeId = questionData.themeSlug ? themeMap.get(questionData.themeSlug) : null

    // Create the question
    await prisma.question.create({
      data: {
        text: questionData.text,
        kind: questionData.kind,
        category: questionData.category,
        tier: questionData.tier,
        themeId,
        orderInTheme: questionData.orderInTheme,
        help: questionData.help || null,
        props: questionData.props || {},
        tags: questionData.tags || [],
      },
    })

    created++
  }

  console.log(`\n✅ Created ${created} new questions`)
  console.log(`⏭️  Skipped ${skipped} existing questions`)
  
  // 3. Update theme question counts
  console.log('\n📊 Updating theme statistics...')
  for (const [slug, themeId] of themeMap) {
    const count = await prisma.question.count({
      where: { themeId },
    })
    
    await prisma.theme.update({
      where: { id: themeId },
      data: { totalQuestions: count },
    })
    
    console.log(`  📋 Theme "${slug}": ${count} questions`)
  }

  console.log('\n🎉 Unified question seeding complete!\n')
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })

