/**
 * Migration script to create census chapters and assign existing steps to chapters
 * 
 * Chapter Structure (based on questionnaire analysis):
 * 1. The Threshold (4 questions) - Statement, consent, location, email
 * 2. Who You Are (7 questions) - Identity & personality
 * 3. How You Sleep (12 questions) - Sleep habits & environment
 * 4. Your Dream Life (11 questions) - Relationship with dreams
 * 5. Dream Phenomena (17 questions) - Experiences & elements
 * 6. Your Dream Stories (14 questions) - Themes, lucidity, memories
 */

import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

interface ChapterDef {
  slug: string
  name: string
  description: string
  orderIndex: number
  iconEmoji: string
  estimatedMinutes: number
  // orderHint range for steps in this chapter
  orderHintRange: [number, number]
}

const chapters: ChapterDef[] = [
  {
    slug: 'threshold',
    name: 'The Threshold',
    description: 'Welcome to The Dream Census. Let\'s begin with the basics.',
    orderIndex: 1,
    iconEmoji: '✦',
    estimatedMinutes: 1,
    orderHintRange: [0, 3], // First 4 questions (0-3)
  },
  {
    slug: 'who-you-are',
    name: 'Who You Are',
    description: 'Tell us a little bit about yourself.',
    orderIndex: 2,
    iconEmoji: '⊹',
    estimatedMinutes: 2,
    orderHintRange: [4, 10], // Group + 7 nested questions
  },
  {
    slug: 'how-you-sleep',
    name: 'How You Sleep',
    description: 'Tell us about your sleeping habits.',
    orderIndex: 3,
    iconEmoji: '☾',
    estimatedMinutes: 2,
    orderHintRange: [11, 22], // Group + 12 nested questions
  },
  {
    slug: 'your-dream-life',
    name: 'Your Dream Life',
    description: 'Tell us about your relationship with dreams.',
    orderIndex: 4,
    iconEmoji: '∞',
    estimatedMinutes: 2,
    orderHintRange: [23, 39], // First 11 questions from Dreaming group
  },
  {
    slug: 'dream-phenomena',
    name: 'Dream Phenomena',
    description: 'What do you experience in your dreams?',
    orderIndex: 5,
    iconEmoji: '◈',
    estimatedMinutes: 3,
    orderHintRange: [40, 56], // 12 opinion scales + 5 prominence questions
  },
  {
    slug: 'dream-stories',
    name: 'Your Dream Stories',
    description: 'Share your dream experiences with us.',
    orderIndex: 6,
    iconEmoji: '◉',
    estimatedMinutes: 3,
    orderHintRange: [57, 69], // Remaining questions from Dreaming + feedback
  },
]

async function main() {
  console.log('🌙 Starting chapter migration...\n')

  // Step 1: Create chapters
  console.log('📝 Creating census chapters...')
  for (const chapter of chapters) {
    const { orderHintRange, ...chapterData } = chapter
    
    const created = await prisma.censusChapter.upsert({
      where: { slug: chapterData.slug },
      update: chapterData,
      create: chapterData,
    })
    
    console.log(`  ✓ ${created.name} (${created.slug})`)
  }

  console.log()

  // Step 2: Assign steps to chapters based on orderHint ranges
  console.log('🔗 Assigning steps to chapters...')
  
  for (const chapter of chapters) {
    const chapterRecord = await prisma.censusChapter.findUnique({
      where: { slug: chapter.slug },
    })
    
    if (!chapterRecord) {
      console.error(`  ✗ Chapter ${chapter.slug} not found!`)
      continue
    }

    const [minOrder, maxOrder] = chapter.orderHintRange
    
    // Update steps in this range to belong to the chapter
    const result = await prisma.censusStep.updateMany({
      where: {
        orderHint: {
          gte: minOrder,
          lte: maxOrder,
        },
        chapterId: null, // Only update unassigned steps
      },
      data: {
        chapterId: chapterRecord.id,
      },
    })
    
    console.log(`  ✓ ${chapter.name}: ${result.count} steps assigned`)
  }

  console.log()

  // Step 3: Verify assignments
  console.log('✅ Verifying chapter assignments...')
  
  for (const chapter of chapters) {
    const count = await prisma.censusStep.count({
      where: {
        chapter: {
          slug: chapter.slug,
        },
      },
    })
    
    const expected = chapter.orderHintRange[1] - chapter.orderHintRange[0] + 1
    const status = count === expected ? '✓' : '⚠'
    console.log(`  ${status} ${chapter.name}: ${count} steps (expected ${expected})`)
  }

  // Check for unassigned steps
  const unassignedCount = await prisma.censusStep.count({
    where: { chapterId: null },
  })
  
  if (unassignedCount > 0) {
    console.log(`\n  ⚠ Warning: ${unassignedCount} steps remain unassigned`)
    
    // Show unassigned steps for debugging
    const unassigned = await prisma.censusStep.findMany({
      where: { chapterId: null },
      select: {
        id: true,
        orderHint: true,
        block: {
          select: {
            label: true,
            kind: true,
          },
        },
      },
      orderBy: { orderHint: 'asc' },
    })
    
    console.log('\n  Unassigned steps:')
    unassigned.forEach((step) => {
      console.log(`    - [${step.orderHint}] ${step.block.kind}: ${step.block.label.substring(0, 50)}...`)
    })
  } else {
    console.log(`\n✨ All steps successfully assigned to chapters!`)
  }

  console.log('\n🌙 Migration complete!\n')
}

main()
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

