/**
 * Seed prompts for the prompt stream
 * Usage: npx tsx prisma/seed-prompts.ts
 */

import { config } from 'dotenv'
import { PrismaClient } from '@/generated/prisma'

// Load environment variables from .env.local
config({ path: '.env.local' })

const prisma = new PrismaClient()

const SAMPLE_PROMPTS = [
  {
    text: 'Have you ever had a dream within a dream?',
    type: 'exploration',
    responseType: 'choice',
  },
  {
    text: 'Do you often remember your dreams in vivid detail?',
    type: 'reflection',
    responseType: 'scale',
  },
  {
    text: 'Have you experienced sleep paralysis?',
    type: 'research',
    responseType: 'choice',
  },
  {
    text: 'Do recurring symbols appear in your dreams?',
    type: 'exploration',
    responseType: 'scale',
  },
  {
    text: 'Can you control your actions in lucid dreams?',
    type: 'exploration',
    responseType: 'choice',
  },
  {
    text: 'Do you keep a dream journal?',
    type: 'reflection',
    responseType: 'choice',
  },
  {
    text: 'Have you ever had a prophetic dream?',
    type: 'exploration',
    responseType: 'choice',
  },
  {
    text: 'Do your dreams often reflect your daily life?',
    type: 'reflection',
    responseType: 'scale',
  },
  {
    text: 'Have you experienced flying in a dream?',
    type: 'exploration',
    responseType: 'choice',
  },
  {
    text: 'Do you practice reality checks during the day?',
    type: 'research',
    responseType: 'choice',
  },
]

async function main() {
  console.log('🌱 Seeding prompts...\n')

  for (const promptData of SAMPLE_PROMPTS) {
    const prompt = await prisma.prompt.create({
      data: {
        ...promptData,
        isActive: true,
      },
    })
    console.log(`✓ Created prompt: ${prompt.text.substring(0, 50)}...`)
  }

  console.log('\n✅ Prompts seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

