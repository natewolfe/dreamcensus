/**
 * Migration script to create census chapters and assign existing steps to chapters
 * Based on actual database structure (flattened steps, no groups)
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
  stepRefs: string[] // externalIds to assign to this chapter
}

// Based on the questionnaire structure
const chapters: ChapterDef[] = [
  {
    slug: 'threshold',
    name: 'The Threshold',
    description: 'Welcome to The Dream Census. Let\'s begin with the basics.',
    orderIndex: 1,
    iconEmoji: '✦',
    estimatedMinutes: 1,
    stepRefs: [
      'ff765331186c655b', // Statement
      'd074377817fa06dc', // Legal consent
      '05193f97068fed7b', // Where are you?
      '5831a45ecf82f741', // Email
    ],
  },
  {
    slug: 'who-you-are',
    name: 'Who You Are',
    description: 'Tell us a little bit about yourself.',
    orderIndex: 2,
    iconEmoji: '⊹',
    estimatedMinutes: 2,
    stepRefs: [
      'dfa515f410e0587c', // Date of birth
      '6b806621894a3a3c', // Language
      '8f2ff3cce359b3c5', // Handedness
      '3d617ea1cda15a0b', // How do you identify
      'c64dc69ad8edccd0', // Day vs Night
      'b74fa2fab84b88a8', // Thinking vs Feeling
      'df2ecf314ae7afbf', // Action vs Observation
    ],
  },
  {
    slug: 'how-you-sleep',
    name: 'How You Sleep',
    description: 'Tell us about your sleeping habits.',
    orderIndex: 3,
    iconEmoji: '☾',
    estimatedMinutes: 2,
    stepRefs: [
      'f6fef3e9dded2029', // Hours of sleep
      '86c5928dccc7fa71', // Sleep position
      'b37693367555d180', // Difficulty falling asleep
      '780b9739ea552ca7', // Difficulty waking up
      'ac01665a63cf46d2', // Sleep disorders current
      'ab35e2834780a129', // Sleep disorders childhood
      'cf8214568d0aebb5', // Sleep with partner
      '60d26e8aafae58b9', // Better or worse with partner
      'c937d6ccd06593a9', // Before bed activities
      '77d47566df7d05e5', // Bed direction
      'e77f7cd43fba93e7', // Lights on/off
      '2c93d5df-938c-4ad0-8762-35c1a5e3094c', // Naps
    ],
  },
  {
    slug: 'your-dream-life',
    name: 'Your Dream Life',
    description: 'Tell us about your relationship with dreams.',
    orderIndex: 4,
    iconEmoji: '∞',
    estimatedMinutes: 2,
    stepRefs: [
      '6f4fc27b93758b9a', // How important
      '884930cf04d96e5c', // How often dream
      '4162cbdb50379e47', // Remember clearly
      '4673c1d92fb4277c', // Reflect
      'fedf2766a7673b4e', // Influence waking life
      '852580c16c30f3d2', // Earliest dream
      'b0719df65f3ca256', // Describe earliest
      'a6ac28e38b4eec02', // Most active period
      'f39328a859238f71', // Wake up time
      '0cd850938fa3f534', // Return to dream
      '2892521fbe478ced', // Describe dreams
    ],
  },
  {
    slug: 'dream-phenomena',
    name: 'Dream Phenomena',
    description: 'What do you experience in your dreams?',
    orderIndex: 5,
    iconEmoji: '◈',
    estimatedMinutes: 3,
    stepRefs: [
      // Senses (5)
      'b0bbca92de6a051c', // Vision
      'bc24d6a943f94013', // Hearing
      'b097a6cba6c70dc8', // Touch
      '9cab75e446f8c744', // Smell
      '1cec26c7fdcb8258', // Taste
      // Opinion scales (12)
      'efa9186dcc7e18e7', // Multiple dreams
      '10a8e04d01642c3f', // Re-live past events
      '9ac933c3ab3e4255', // Strange conversations
      'f3a90d47eee74e34', // Near-death
      '82176442b4c14c70', // Die
      '099b1bfc16b0461e', // False awakenings
      'af517ed853595f9b', // Solve problems
      '3288ac8de4e6077a', // Time distortion
      'fa105c7a4956a391', // Someone else
      '16f38398ea37fca0', // Events from day before
      'f32db0f8d412aca1', // Create original works
      'f41d31a3bee551bd', // Existentially challenging
      // Prominence (5)
      '2a91be3b48fba079', // Mood/atmosphere
      '65d5305d9cfc1b33', // Visual setting
      '9f848ec2d18a3569', // Relationships
      '5b18310287152fcb', // Fine details
      'ca92008bbf9a4aa2', // Objectives/goals
    ],
  },
  {
    slug: 'dream-stories',
    name: 'Your Dream Stories',
    description: 'Share your dream experiences with us.',
    orderIndex: 6,
    iconEmoji: '◉',
    estimatedMinutes: 3,
    stepRefs: [
      '2fc6dd2b10bc2757', // Themes 1
      '41ab86984d029ad9', // Themes 2
      'acdaa43244a6ba52', // Paranormal
      'fbbd846f65db8261', // Recurring current
      'd3e89b10d823160e', // Recurring childhood
      'b741a20a5f839025', // Describe recurring
      '74b42324786b5414', // Alert waking
      'e42f997d99139794', // Alert dreaming
      'a762fc0af7d3dd63', // Daydream
      '656d0b7a8a90efe4', // Lucid dream
      'a5a9ff38d102a843', // Lucid actions
      'a9e5b45df2ea82da', // Memorable dream
      '9e9f3eda62022bc0', // Peculiarities
      '8c2ac3e03468d7fa', // Rating (optional feedback)
      '2be6a1fe504970e5', // What would you add/remove/alter
    ],
  },
]

async function main() {
  console.log('🌙 Starting chapter migration (v2)...\n')

  // Step 1: Reset all chapter assignments (for clean re-run)
  console.log('🔄 Resetting chapter assignments...')
  await prisma.censusStep.updateMany({
    data: { chapterId: null },
  })
  console.log('  ✓ Reset complete\n')

  // Step 2: Create chapters
  console.log('📝 Creating census chapters...')
  for (const chapter of chapters) {
    const { stepRefs, ...chapterData } = chapter
    
    const created = await prisma.censusChapter.upsert({
      where: { slug: chapterData.slug },
      update: chapterData,
      create: chapterData,
    })
    
    console.log(`  ✓ ${created.name} (${created.slug})`)
  }

  console.log()

  // Step 3: Assign steps to chapters based on externalIds
  console.log('🔗 Assigning steps to chapters...')
  
  for (const chapter of chapters) {
    const chapterRecord = await prisma.censusChapter.findUnique({
      where: { slug: chapter.slug },
    })
    
    if (!chapterRecord) {
      console.error(`  ✗ Chapter ${chapter.slug} not found!`)
      continue
    }

    let assigned = 0
    let notFound = 0
    
    for (const externalId of chapter.stepRefs) {
      // Find steps by ContentBlock externalId
      const result = await prisma.censusStep.updateMany({
        where: {
          block: {
            externalId: externalId,
          },
        },
        data: {
          chapterId: chapterRecord.id,
        },
      })
      
      if (result.count > 0) {
        assigned += result.count
      } else {
        notFound++
        console.log(`    ⚠ Step not found: ${externalId}`)
      }
    }
    
    console.log(`  ✓ ${chapter.name}: ${assigned} steps assigned${notFound > 0 ? ` (${notFound} not found)` : ''}`)
  }

  console.log()

  // Step 4: Verify assignments
  console.log('✅ Verifying chapter assignments...')
  
  let totalAssigned = 0
  for (const chapter of chapters) {
    const count = await prisma.censusStep.count({
      where: {
        chapter: {
          slug: chapter.slug,
        },
        block: {
          kind: { not: 'group' }, // Don't count groups
        },
      },
    })
    
    totalAssigned += count
    const expected = chapter.stepRefs.length
    const status = count === expected ? '✓' : '⚠'
    console.log(`  ${status} ${chapter.name}: ${count} steps (expected ${expected})`)
  }

  // Check for unassigned answerable steps (exclude groups)
  const unassignedCount = await prisma.censusStep.count({
    where: { 
      chapterId: null,
      block: {
        kind: { not: 'group' },
      },
    },
  })
  
  if (unassignedCount > 0) {
    console.log(`\n  ⚠ Warning: ${unassignedCount} answerable steps remain unassigned`)
    
    // Show unassigned steps for debugging
    const unassigned = await prisma.censusStep.findMany({
      where: { 
        chapterId: null,
        block: {
          kind: { not: 'group' },
        },
      },
      select: {
        id: true,
        orderHint: true,
        block: {
          select: {
            externalId: true,
            label: true,
            kind: true,
          },
        },
      },
      orderBy: { orderHint: 'asc' },
    })
    
    console.log('\n  Unassigned steps:')
    unassigned.forEach((step) => {
      console.log(`    - [${step.orderHint}] ${step.block.externalId}: ${step.block.label.substring(0, 60)}...`)
    })
  } else {
    console.log(`\n✨ All answerable steps successfully assigned to chapters!`)
    console.log(`   Total: ${totalAssigned} steps across ${chapters.length} chapters`)
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

