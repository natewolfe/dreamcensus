/**
 * Seed script for Stream questions
 * Creates an initial pool of questions for the endless exploration stream
 */

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

interface StreamQuestionSeed {
  text: string
  category: string
  tags: string[]
  tier: number
}

const streamQuestions: StreamQuestionSeed[] = [
  // Dreams & Sleep (Tier 1 - Census-like)
  {
    text: 'Do you often remember your dreams?',
    category: 'dreams',
    tags: ['memory', 'recall'],
    tier: 1,
  },
  {
    text: 'Have you ever had a recurring dream?',
    category: 'dreams',
    tags: ['recurring', 'patterns'],
    tier: 1,
  },
  {
    text: 'Do you dream in color?',
    category: 'dreams',
    tags: ['visuals', 'senses'],
    tier: 1,
  },
  {
    text: 'Have you experienced sleep paralysis?',
    category: 'sleep',
    tags: ['phenomena', 'sleep disorders'],
    tier: 1,
  },
  {
    text: 'Do you sleep better in complete darkness?',
    category: 'sleep',
    tags: ['environment', 'preferences'],
    tier: 1,
  },

  // Imagination & Creativity (Tier 2)
  {
    text: 'Do you often daydream during conversations?',
    category: 'imagination',
    tags: ['daydreaming', 'attention'],
    tier: 2,
  },
  {
    text: 'Can you visualize scenes from books you read?',
    category: 'imagination',
    tags: ['visualization', 'reading'],
    tier: 2,
  },
  {
    text: 'Do you create fictional worlds or characters in your mind?',
    category: 'imagination',
    tags: ['creativity', 'fiction'],
    tier: 2,
  },
  {
    text: 'Have you ever had an imaginary friend?',
    category: 'imagination',
    tags: ['childhood', 'relationships'],
    tier: 2,
  },
  {
    text: 'Do you think in images rather than words?',
    category: 'perception',
    tags: ['thinking', 'cognition'],
    tier: 2,
  },

  // Dream Content & Themes (Tier 2)
  {
    text: 'Do you dream about flying?',
    category: 'dreams',
    tags: ['flying', 'themes', 'freedom'],
    tier: 2,
  },
  {
    text: 'Have you dreamed of falling?',
    category: 'dreams',
    tags: ['falling', 'themes', 'anxiety'],
    tier: 2,
  },
  {
    text: 'Do your dreams ever predict the future?',
    category: 'dreams',
    tags: ['precognition', 'paranormal'],
    tier: 2,
  },
  {
    text: 'Have you met deceased loved ones in your dreams?',
    category: 'dreams',
    tags: ['visitation', 'grief', 'paranormal'],
    tier: 2,
  },
  {
    text: 'Do you dream about being chased?',
    category: 'dreams',
    tags: ['chase', 'themes', 'stress'],
    tier: 2,
  },

  // Perception & Reality (Tier 2)
  {
    text: 'Do you sometimes question if you\'re dreaming while awake?',
    category: 'perception',
    tags: ['reality', 'consciousness'],
    tier: 2,
  },
  {
    text: 'Have you experienced déjà vu frequently?',
    category: 'perception',
    tags: ['memory', 'phenomena'],
    tier: 2,
  },
  {
    text: 'Do you see patterns or faces in random objects?',
    category: 'perception',
    tags: ['pareidolia', 'pattern recognition'],
    tier: 2,
  },
  {
    text: 'Can you remember what you did exactly one week ago?',
    category: 'perception',
    tags: ['memory', 'time'],
    tier: 2,
  },
  {
    text: 'Do you lose track of time easily?',
    category: 'perception',
    tags: ['time', 'attention'],
    tier: 2,
  },

  // Inner Life & Reflection (Tier 2)
  {
    text: 'Do you have an internal monologue?',
    category: 'interiority',
    tags: ['thinking', 'self-awareness'],
    tier: 2,
  },
  {
    text: 'Do you often reflect on your dreams\' meanings?',
    category: 'interiority',
    tags: ['reflection', 'interpretation'],
    tier: 2,
  },
  {
    text: 'Do you keep a dream journal?',
    category: 'interiority',
    tags: ['journaling', 'documentation'],
    tier: 2,
  },
  {
    text: 'Have you ever felt like you were living someone else\'s life?',
    category: 'interiority',
    tags: ['identity', 'dissociation'],
    tier: 2,
  },
  {
    text: 'Do you prefer solitude or company?',
    category: 'interiority',
    tags: ['personality', 'social'],
    tier: 2,
  },

  // Lucidity & Control (Tier 2)
  {
    text: 'Have you ever controlled your dreams?',
    category: 'lucidity',
    tags: ['lucid dreaming', 'control'],
    tier: 2,
  },
  {
    text: 'Can you wake yourself up from nightmares?',
    category: 'lucidity',
    tags: ['control', 'nightmares'],
    tier: 2,
  },
  {
    text: 'Do you practice reality checks during the day?',
    category: 'lucidity',
    tags: ['technique', 'practice'],
    tier: 2,
  },
  {
    text: 'Have you tried to induce lucid dreams?',
    category: 'lucidity',
    tags: ['techniques', 'intention'],
    tier: 2,
  },

  // Emotions & Mood (Tier 2)
  {
    text: 'Do your dreams reflect your emotional state?',
    category: 'dreams',
    tags: ['emotions', 'psychology'],
    tier: 2,
  },
  {
    text: 'Have you woken up crying from a dream?',
    category: 'dreams',
    tags: ['emotions', 'intensity'],
    tier: 2,
  },
  {
    text: 'Do your dreams feel more vivid when you\'re stressed?',
    category: 'dreams',
    tags: ['stress', 'vividness'],
    tier: 2,
  },
  {
    text: 'Have you had dreams that felt healing or therapeutic?',
    category: 'dreams',
    tags: ['healing', 'therapy'],
    tier: 2,
  },

  // Mystery & Wonder (Tier 2)
  {
    text: 'Do you believe dreams have hidden meanings?',
    category: 'interiority',
    tags: ['beliefs', 'meaning'],
    tier: 2,
  },
  {
    text: 'Have you experienced astral projection?',
    category: 'dreams',
    tags: ['paranormal', 'OBE'],
    tier: 2,
  },
  {
    text: 'Do you think dreams connect us to other dimensions?',
    category: 'interiority',
    tags: ['beliefs', 'metaphysics'],
    tier: 2,
  },
  {
    text: 'Have you shared a dream with someone else?',
    category: 'dreams',
    tags: ['shared dreams', 'connection'],
    tier: 2,
  },

  // Sensory & Physical (Tier 2)
  {
    text: 'Can you feel pain in your dreams?',
    category: 'dreams',
    tags: ['senses', 'touch'],
    tier: 2,
  },
  {
    text: 'Do you smell or taste things in dreams?',
    category: 'dreams',
    tags: ['senses', 'smell', 'taste'],
    tier: 2,
  },
  {
    text: 'Have you experienced sleep talking or walking?',
    category: 'sleep',
    tags: ['parasomnias', 'behaviors'],
    tier: 2,
  },
  {
    text: 'Do you move physically during intense dreams?',
    category: 'sleep',
    tags: ['physical', 'REM'],
    tier: 2,
  },

  // Time & Memory (Tier 2)
  {
    text: 'Do your childhood dreams still feel vivid?',
    category: 'dreams',
    tags: ['memory', 'childhood'],
    tier: 2,
  },
  {
    text: 'Can you remember dreams from years ago?',
    category: 'dreams',
    tags: ['memory', 'long-term'],
    tier: 2,
  },
  {
    text: 'Do you experience time differently in dreams?',
    category: 'dreams',
    tags: ['time', 'perception'],
    tier: 2,
  },
  {
    text: 'Have you lived entire lifetimes in a single dream?',
    category: 'dreams',
    tags: ['time', 'narrative'],
    tier: 2,
  },

  // Deep Questions (Tier 2)
  {
    text: 'Do you think dreams are messages from your unconscious?',
    category: 'interiority',
    tags: ['psychology', 'beliefs'],
    tier: 2,
  },
  {
    text: 'Would you want to never dream again?',
    category: 'interiority',
    tags: ['values', 'preference'],
    tier: 2,
  },
  {
    text: 'Do you prefer dreaming to being awake?',
    category: 'interiority',
    tags: ['preference', 'escapism'],
    tier: 2,
  },
  {
    text: 'Have your dreams ever solved a real problem for you?',
    category: 'dreams',
    tags: ['problem-solving', 'creativity'],
    tier: 2,
  },
]

async function main() {
  console.log('🌊 Seeding stream questions...\n')

  let created = 0
  let skipped = 0

  for (const question of streamQuestions) {
    try {
      // Check if question already exists (by text)
      const existing = await prisma.streamQuestion.findFirst({
        where: { text: question.text },
      })

      if (existing) {
        skipped++
        continue
      }

      // Create the question
      await prisma.streamQuestion.create({
        data: {
          text: question.text,
          category: question.category,
          tags: question.tags, // Native JSON array, not stringified
          tier: question.tier,
          approved: true,
        },
      })

      created++
    } catch (error) {
      console.error(`Failed to create question: "${question.text}"`, error)
    }
  }

  console.log(`✅ Created ${created} new questions`)
  console.log(`⏭️  Skipped ${skipped} existing questions`)
  console.log(`\n🌊 Stream seeding complete!\n`)
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

