/**
 * Seed script for Census chapters
 * Creates the chapter structure for the census questionnaire
 * 
 * Usage:
 *   npx tsx scripts/seed-chapters.ts
 */

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

interface ChapterSeed {
  slug: string
  name: string
  orderIndex: number
  estimatedMinutes: number
  iconEmoji: string
  description: string
}

// Census chapters based on the Typeform structure
// Maps to the Typeform sections + intro
const chapters: ChapterSeed[] = [
  {
    slug: 'intro',
    name: 'The Threshold',
    orderIndex: 1,
    estimatedMinutes: 2,
    iconEmoji: '🚪',
    description: 'Begin your dream journey. Consent and basic information.',
  },
  {
    slug: 'dreamer',
    name: 'The Dreamer',
    orderIndex: 2,
    estimatedMinutes: 3,
    iconEmoji: '👤',
    description: 'Tell us a little bit about yourself.',
  },
  {
    slug: 'sleeping',
    name: 'Sleeping',
    orderIndex: 3,
    estimatedMinutes: 4,
    iconEmoji: '🛏️',
    description: 'Tell us about your sleeping habits.',
  },
  {
    slug: 'dreaming',
    name: 'Dreaming',
    orderIndex: 4,
    estimatedMinutes: 5,
    iconEmoji: '🌙',
    description: 'Tell us about your dreams.',
  },
]

async function main() {
  console.log('🌱 Seeding census chapters...\n')

  let created = 0
  let updated = 0

  for (const chapter of chapters) {
    try {
      const existing = await prisma.censusChapter.findUnique({
        where: { slug: chapter.slug },
      })

      if (existing) {
        await prisma.censusChapter.update({
          where: { slug: chapter.slug },
          data: chapter,
        })
        updated++
        console.log(`   📝 Updated: ${chapter.name}`)
      } else {
        await prisma.censusChapter.create({
          data: chapter,
        })
        created++
        console.log(`   ✅ Created: ${chapter.name}`)
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${chapter.name}`, error)
    }
  }

  console.log(`\n✅ Chapter seeding complete!`)
  console.log(`   Created: ${created}`)
  console.log(`   Updated: ${updated}`)
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

