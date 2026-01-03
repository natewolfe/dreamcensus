/**
 * Comprehensive seed script to populate the Dream Census v2
 * Migrates from Typeform + adds research-aligned questions
 * 
 * Usage: npx tsx prisma/seed-questions.ts
 */

import { PrismaClient } from '@/generated/prisma'
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

const CATEGORY_QUESTION_MAP = {
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

  // Get all categories
  const categories = await prisma.censusCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  if (categories.length === 0) {
    console.log('\n⚠️  No categories found! Please run seed-categories.ts first.')
    console.log('   npx tsx prisma/seed-categories.ts')
    process.exit(1)
  }

  console.log(`✓ Found ${categories.length} categories\n`)

  let totalQuestions = 0
  let totalSections = 0

  // Process each category
  for (const category of categories) {
    const questions = CATEGORY_QUESTION_MAP[category.slug as keyof typeof CATEGORY_QUESTION_MAP]
    
    if (!questions) {
      console.log(`⚠️  No questions defined for ${category.slug}, skipping...`)
      continue
    }

    console.log(`📁 ${category.name} (${category.slug})`)

    // Create main section for this category
    const section = await prisma.censusSection.upsert({
      where: {
        instrumentId_slug: {
          instrumentId: instrument.id,
          slug: category.slug,
        },
      },
      create: {
        instrumentId: instrument.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
        estimatedTime: Math.ceil(questions.length * 30), // 30 seconds per question estimate
      },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
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
  console.log(`   Categories: ${categories.length}`)
  
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

