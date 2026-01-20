import { config } from 'dotenv'
import { PrismaClient } from '@/generated/prisma'

// Load environment variables from .env.local
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create census instrument
  const instrument = await prisma.censusInstrument.upsert({
    where: { slug: 'sleep-dream-census-v1' },
    create: {
      name: 'Sleep & Dream Census',
      slug: 'sleep-dream-census-v1',
      version: 1,
      description: 'Core questionnaire about sleep patterns, dream recall, and dreaming practices',
    },
    update: {},
  })

  console.log('✓ Created census instrument')

  // Create sections with questions
  const sections = [
    {
      name: 'Sleep Patterns',
      slug: 'sleep-patterns',
      description: 'Questions about your typical sleep habits and how they relate to dreaming',
      icon: '🌙',
      sortOrder: 1,
      estimatedTime: 240, // 4 minutes in seconds
      questions: [
        {
          type: 'choice',
          text: 'How many hours of sleep do you typically get per night?',
          order: 1,
          required: true,
          config: {
            options: ['Less than 5', '5-6 hours', '7-8 hours', '9+ hours'],
          },
        },
        {
          type: 'statement',
          text: 'I maintain a consistent sleep schedule (same bedtime/wake time)',
          order: 2,
          required: true,
          config: {
            scaleType: 'agreement',
            steps: 5,
          },
        },
        {
          type: 'scale',
          text: 'How would you rate your overall sleep quality?',
          order: 3,
          required: true,
          config: {
            min: 1,
            max: 10,
            minLabel: 'Very poor',
            maxLabel: 'Excellent',
          },
        },
        {
          type: 'choice',
          text: 'Do you use any sleep aids?',
          description: 'Select all that apply',
          order: 4,
          required: false,
          config: {
            options: [
              'None',
              'Melatonin',
              'Prescription medication',
              'White noise',
              'Meditation/breathing',
              'Cannabis',
            ],
            allowMultiple: true,
            allowOther: true,
          },
        },
      ],
    },
    {
      name: 'Dream Recall',
      slug: 'dream-recall',
      description: 'How often and what types of dreams you remember',
      icon: '🧠',
      sortOrder: 2,
      estimatedTime: 300, // 5 minutes in seconds
      questions: [
        {
          type: 'choice',
          text: 'How often do you remember your dreams?',
          order: 1,
          required: true,
          config: {
            options: [
              'Never or almost never',
              '1-2 times per week',
              '3-4 times per week',
              '5-6 times per week',
              'Every day or almost every day',
            ],
          },
        },
        {
          type: 'statement',
          text: 'I can remember vivid details from my dreams',
          order: 2,
          required: true,
          config: {
            scaleType: 'frequency',
            steps: 5,
          },
        },
        {
          type: 'choice',
          text: 'Have you ever experienced a lucid dream?',
          description: 'A dream where you knew you were dreaming',
          order: 3,
          required: true,
          config: {
            options: [
              'Yes, frequently',
              'Yes, occasionally',
              'Yes, but rarely',
              'No, never',
              'Not sure',
            ],
          },
        },
        {
          type: 'text',
          text: 'What techniques, if any, do you use to improve dream recall?',
          order: 4,
          required: false,
          config: {
            placeholder: 'Dream journal, reality checks, supplements...',
            maxLength: 500,
          },
        },
      ],
    },
    {
      name: 'Dream Content',
      slug: 'dream-content',
      description: 'The types of dreams and themes you experience',
      icon: '✨',
      sortOrder: 3,
      estimatedTime: 360, // 6 minutes in seconds
      questions: [
        {
          type: 'statement',
          text: 'My dreams often involve people I know in waking life',
          order: 1,
          required: true,
          config: {
            scaleType: 'frequency',
            steps: 5,
          },
        },
        {
          type: 'statement',
          text: 'My dreams often involve impossible or surreal scenarios',
          order: 2,
          required: true,
          config: {
            scaleType: 'frequency',
            steps: 5,
          },
        },
        {
          type: 'choice',
          text: 'How often do you experience nightmares?',
          order: 3,
          required: true,
          config: {
            options: [
              'Never',
              'Rarely (few times per year)',
              'Occasionally (monthly)',
              'Often (weekly)',
              'Very often (multiple times per week)',
            ],
          },
        },
        {
          type: 'choice',
          text: 'Do you have recurring dreams?',
          description: 'Dreams with the same or similar content that repeat',
          order: 4,
          required: true,
          config: {
            options: [
              'Yes, frequently',
              'Yes, occasionally',
              'Yes, but rarely',
              'No, never',
            ],
          },
        },
      ],
    },
  ]

  // Create sections and questions
  for (const sectionData of sections) {
    const { questions, ...sectionFields } = sectionData
    
    const section = await prisma.censusSection.upsert({
      where: {
        instrumentId_slug: {
          instrumentId: instrument.id,
          slug: sectionData.slug,
        },
      },
      create: {
        ...sectionFields,
        instrumentId: instrument.id,
      },
      update: sectionFields,
    })

    console.log(`✓ Created section: ${section.name}`)

    // Create questions
    for (const questionData of questions) {
      await prisma.censusQuestion.create({
        data: {
          sectionId: section.id,
          slug: `q${questionData.order}`,
          text: questionData.text,
          helpText: questionData.description,
          type: questionData.type,
          props: questionData.config ?? {},
          isRequired: questionData.required,
          sortOrder: questionData.order,
        },
      })
    }

    console.log(`  ✓ Created ${questions.length} questions`)
  }

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

