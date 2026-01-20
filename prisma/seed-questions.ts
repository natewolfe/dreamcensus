/**
 * Comprehensive seed script to populate the Dream Census v2
 * Migrates from Typeform + adds research-aligned questions
 * 
 * Usage: npx tsx prisma/seed-questions.ts
 */

import { config } from 'dotenv'
import { PrismaClient } from '@/generated/prisma'

// Load environment variables from .env.local
config({ path: '.env.local' })

import { beginQuestions } from './data/questions/begin'
import { personalityQuestions } from './data/questions/personality'
import { sleepQuestions } from './data/questions/sleep'
import { recallQuestions } from './data/questions/recall'
import { contentQuestions } from './data/questions/content'
import { interiorityQuestions } from './data/questions/interiority'
import { emotionQuestions } from './data/questions/emotion'
import { imaginationQuestions } from './data/questions/imagination'
import { memoryQuestions } from './data/questions/memory'
import { hopeQuestions } from './data/questions/hope'
import { fearQuestions } from './data/questions/fear'
import { symbolismQuestions } from './data/questions/symbolism'
import { relationshipsQuestions } from './data/questions/relationships'
import { embodimentQuestions } from './data/questions/embodiment'
import { spacetimeQuestions } from './data/questions/spacetime'
import { lucidityQuestions } from './data/questions/lucidity'

const prisma = new PrismaClient()

/**
 * Section metadata for census sections
 * This replaces the CensusCategory table which was redundant with SECTION_KINDS in constants.ts
 */
const SECTION_METADATA = {
  begin: { name: 'Basics', description: 'Getting started with who you are', icon: '👋', sortOrder: 0 },
  personality: { name: 'Personality', description: 'Traits, temperament, and how you see yourself', icon: '🎭', sortOrder: 1 },
  sleep: { name: 'Sleep Habits', description: 'Your sleep patterns, quality, and environment', icon: '😴', sortOrder: 2 },
  recall: { name: 'Dream Recall', description: 'How often and vividly you remember dreams', icon: '🧠', sortOrder: 3 },
  content: { name: 'Dream Content', description: 'What appears in your dreams', icon: '🎬', sortOrder: 4 },
  interiority: { name: 'Interiority', description: 'Your inner life and self-awareness', icon: '🔮', sortOrder: 5 },
  emotion: { name: 'Emotion', description: 'Emotional patterns in dreams and waking life', icon: '💜', sortOrder: 6 },
  imagination: { name: 'Imagination', description: 'Creative capacity and visualization', icon: '✨', sortOrder: 7 },
  memory: { name: 'Memory', description: 'How memory functions in your dreams', icon: '📚', sortOrder: 8 },
  hope: { name: 'Hope & Desire', description: 'Aspirations, wishes, and what you seek', icon: '🌟', sortOrder: 9 },
  fear: { name: 'Fear & Aversion', description: 'Anxieties, nightmares, and what you avoid', icon: '🌑', sortOrder: 10 },
  symbolism: { name: 'Symbolism', description: 'Recurring symbols and their meanings', icon: '🔑', sortOrder: 11 },
  relationships: { name: 'Relationships', description: 'Social dreams and connections', icon: '👥', sortOrder: 12 },
  embodiment: { name: 'Embodiment', description: 'Physical sensations and body awareness', icon: '🫀', sortOrder: 13 },
  spacetime: { name: 'Time & Space', description: 'Temporal and spatial experience in dreams', icon: '⏳', sortOrder: 14 },
  lucidity: { name: 'Lucidity', description: 'Awareness and control in dreams', icon: '💡', sortOrder: 15 },
} as const

type SectionSlug = keyof typeof SECTION_METADATA

const SECTION_QUESTION_MAP: Record<SectionSlug, unknown[]> = {
  begin: beginQuestions,
  personality: personalityQuestions,
  sleep: sleepQuestions,
  recall: recallQuestions,
  content: contentQuestions,
  interiority: interiorityQuestions,
  emotion: emotionQuestions,
  imagination: imaginationQuestions,
  memory: memoryQuestions,
  hope: hopeQuestions,
  fear: fearQuestions,
  symbolism: symbolismQuestions,
  relationships: relationshipsQuestions,
  embodiment: embodimentQuestions,
  spacetime: spacetimeQuestions,
  lucidity: lucidityQuestions,
}

async function main() {
  console.log('🌱 Starting Dream Census seed...\n')

  // Create or get the main census instrument
  const instrument = await prisma.censusInstrument.upsert({
    where: { slug: 'dream-census-v2' },
    create: {
      slug: 'dream-census-v2',
      name: 'Dream Census v2',
      description: 'Comprehensive research-grade dream and sleep questionnaire',
      version: 2,
      isActive: true,
      isRequired: false,
    },
    update: {
      name: 'Dream Census v2',
      description: 'Comprehensive research-grade dream and sleep questionnaire',
    },
  })

  console.log(`✓ Census instrument: ${instrument.name}`)

  const sectionSlugs = Object.keys(SECTION_METADATA) as SectionSlug[]
  console.log(`✓ Processing ${sectionSlugs.length} sections\n`)

  let totalQuestions = 0
  let totalSections = 0

  // Process each section
  for (const slug of sectionSlugs) {
    const metadata = SECTION_METADATA[slug]
    const questions = SECTION_QUESTION_MAP[slug]
    
    if (!questions || questions.length === 0) {
      console.log(`⚠️  No questions defined for ${slug}, skipping...`)
      continue
    }

    console.log(`📁 ${metadata.name} (${slug})`)

    // Create main section
    const section = await prisma.censusSection.upsert({
      where: {
        instrumentId_slug: {
          instrumentId: instrument.id,
          slug: slug,
        },
      },
      create: {
        instrumentId: instrument.id,
        slug: slug,
        name: metadata.name,
        description: metadata.description,
        icon: metadata.icon,
        sortOrder: metadata.sortOrder,
        estimatedTime: Math.ceil(questions.length * 30), // 30 seconds per question estimate
      },
      update: {
        name: metadata.name,
        description: metadata.description,
        icon: metadata.icon,
        sortOrder: metadata.sortOrder,
        estimatedTime: Math.ceil(questions.length * 30),
      },
    })

    totalSections++

    // Create all questions for this section
    for (const questionData of questions) {
      const data = questionData as any
      await prisma.censusQuestion.upsert({
        where: {
          sectionId_slug: {
            sectionId: section.id,
            slug: data.slug,
          },
        },
        create: {
          sectionId: section.id,
          slug: data.slug,
          text: data.text,
          helpText: data.helpText || null,
          type: data.type,
          props: data.props || {},
          isRequired: data.isRequired,
          sortOrder: data.sortOrder,
          showWhen: data.showWhen || null,
          groupId: data.groupId || null,
          groupLabel: data.groupLabel || null,
        },
        update: {
          text: data.text,
          helpText: data.helpText || null,
          type: data.type,
          props: data.props || {},
          isRequired: data.isRequired,
          sortOrder: data.sortOrder,
          showWhen: data.showWhen || null,
          groupId: data.groupId || null,
          groupLabel: data.groupLabel || null,
        },
      })
      totalQuestions++
    }

    console.log(`   ✓ ${questions.length} questions created/updated`)
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('✅ Census seed complete!')
  console.log('='.repeat(50))
  console.log(`   Instrument: ${instrument.name} (v${instrument.version})`)
  console.log(`   Sections: ${totalSections}`)
  console.log(`   Questions: ${totalQuestions}`)
  
  // Count questions by type
  const questionsByType = await prisma.censusQuestion.groupBy({
    by: ['type'],
    _count: true,
  })
  
  console.log('\n📊 Questions by type:')
  questionsByType
    .sort((a, b) => b._count - a._count)
    .forEach(({ type, _count }) => {
      console.log(`   ${type.padEnd(15)} ${_count}`)
    })
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
