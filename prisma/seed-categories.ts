import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

const CATEGORIES = [
  {
    slug: 'personality',
    name: 'Personality',
    description: 'Traits, temperament, and how you see yourself',
    icon: '🎭',
    color: '#b093ff',
    sortOrder: 1,
  },
  {
    slug: 'sleep',
    name: 'Sleep Habits',
    description: 'Your sleep patterns, quality, and environment',
    icon: '😴',
    color: '#7986cb',
    sortOrder: 2,
  },
  {
    slug: 'recall',
    name: 'Dream Recall',
    description: 'How often and vividly you remember dreams',
    icon: '🧠',
    color: '#9575cd',
    sortOrder: 3,
  },
  {
    slug: 'content',
    name: 'Dream Content',
    description: 'What appears in your dreams',
    icon: '🎬',
    color: '#ba68c8',
    sortOrder: 4,
  },
  {
    slug: 'interiority',
    name: 'Interiority',
    description: 'Your inner life and self-awareness',
    icon: '🔮',
    color: '#ce93d8',
    sortOrder: 5,
  },
  {
    slug: 'emotion',
    name: 'Emotion',
    description: 'Emotional patterns in dreams and waking life',
    icon: '💜',
    color: '#ab47bc',
    sortOrder: 6,
  },
  {
    slug: 'imagination',
    name: 'Imagination',
    description: 'Creative capacity and visualization',
    icon: '✨',
    color: '#8e24aa',
    sortOrder: 7,
  },
  {
    slug: 'memory',
    name: 'Memory',
    description: 'How memory functions in your dreams',
    icon: '📚',
    color: '#7b1fa2',
    sortOrder: 8,
  },
  {
    slug: 'hope',
    name: 'Hope & Desire',
    description: 'Aspirations, wishes, and what you seek',
    icon: '🌟',
    color: '#6a1b9a',
    sortOrder: 9,
  },
  {
    slug: 'fear',
    name: 'Fear & Aversion',
    description: 'Anxieties, nightmares, and what you avoid',
    icon: '🌑',
    color: '#4a148c',
    sortOrder: 10,
  },
  {
    slug: 'symbolism',
    name: 'Symbolism',
    description: 'Recurring symbols and their meanings',
    icon: '🔑',
    color: '#9c27b0',
    sortOrder: 11,
  },
  {
    slug: 'relationships',
    name: 'Relationships',
    description: 'Social dreams and connections',
    icon: '👥',
    color: '#e1bee7',
    sortOrder: 12,
  },
  {
    slug: 'embodiment',
    name: 'Embodiment',
    description: 'Physical sensations and body awareness',
    icon: '🫀',
    color: '#f3e5f5',
    sortOrder: 13,
  },
  {
    slug: 'spacetime',
    name: 'Time & Space',
    description: 'Temporal and spatial experience in dreams',
    icon: '⏳',
    color: '#d1c4e9',
    sortOrder: 14,
  },
  {
    slug: 'lucidity',
    name: 'Lucidity',
    description: 'Awareness and control in dreams',
    icon: '💡',
    color: '#b39ddb',
    sortOrder: 15,
  },
]

const SAMPLE_FORMS = [
  // Dream Recall category
  {
    categorySlug: 'recall',
    slug: 'recall-frequency',
    name: 'Recall Frequency',
    description: 'How often do you remember your dreams?',
    estimatedMinutes: 5,
    sortOrder: 1,
  },
  {
    categorySlug: 'recall',
    slug: 'recall-vividness',
    name: 'Dream Vividness',
    description: 'How clear and detailed are your dreams?',
    estimatedMinutes: 5,
    sortOrder: 2,
  },
  // Lucidity category
  {
    categorySlug: 'lucidity',
    slug: 'lucidity-awareness',
    name: 'Lucid Awareness',
    description: 'Do you realize you\'re dreaming?',
    estimatedMinutes: 5,
    sortOrder: 1,
  },
  {
    categorySlug: 'lucidity',
    slug: 'lucidity-control',
    name: 'Dream Control',
    description: 'Can you influence your dreams?',
    estimatedMinutes: 7,
    sortOrder: 2,
  },
  // Symbolism category
  {
    categorySlug: 'symbolism',
    slug: 'recurring-symbols',
    name: 'Recurring Symbols',
    description: 'What symbols appear often in your dreams?',
    estimatedMinutes: 8,
    sortOrder: 1,
  },
]

async function main() {
  console.log('Seeding categories...')

  // Seed categories
  for (const category of CATEGORIES) {
    await prisma.censusCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    console.log(`✓ Category: ${category.name}`)
  }

  console.log('\nSeeding sample forms...')

  // Seed sample forms
  for (const form of SAMPLE_FORMS) {
    const category = await prisma.censusCategory.findUnique({
      where: { slug: form.categorySlug },
    })

    if (!category) {
      console.log(`✗ Category not found: ${form.categorySlug}`)
      continue
    }

    await prisma.censusForm.upsert({
      where: {
        categoryId_slug: {
          categoryId: category.id,
          slug: form.slug,
        },
      },
      update: {
        name: form.name,
        description: form.description,
        estimatedMinutes: form.estimatedMinutes,
        sortOrder: form.sortOrder,
      },
      create: {
        categoryId: category.id,
        slug: form.slug,
        name: form.name,
        description: form.description,
        estimatedMinutes: form.estimatedMinutes,
        sortOrder: form.sortOrder,
      },
    })
    console.log(`✓ Form: ${form.name}`)
  }

  console.log('\n✓ Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

