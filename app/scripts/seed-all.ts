/**
 * Master seed script - runs all seeders in the correct order
 * 
 * Usage:
 *   cd app
 *   npx tsx scripts/seed-all.ts
 */

import { execSync } from 'child_process'
import * as path from 'path'

const scriptsDir = __dirname

function runScript(name: string) {
  const scriptPath = path.join(scriptsDir, name)
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Running: ${name}`)
  console.log('='.repeat(60))
  
  try {
    execSync(`npx tsx "${scriptPath}"`, { 
      stdio: 'inherit',
      cwd: path.join(scriptsDir, '..'),
    })
  } catch (error) {
    console.error(`❌ Failed to run ${name}`)
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Dream Census Database Seeding')
  console.log('================================\n')

  // 1. Seed chapters first (required by census steps)
  runScript('seed-chapters.ts')

  // 2. Seed census content from Typeform
  runScript('seed-from-typeform.ts')

  // 3. Seed stream questions
  runScript('seed-stream-questions.ts')

  // 4. Seed dream data (for testing Data Observatory)
  runScript('seed-dream-data.ts')

  console.log('\n' + '='.repeat(60))
  console.log('✅ All seeding complete!')
  console.log('='.repeat(60))
  console.log('\nYou can now start the app with: npm run dev')
}

main().catch(console.error)

