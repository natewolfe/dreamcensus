/**
 * Script to check the actual orderHint values of steps in the database
 */

import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  const steps = await prisma.censusStep.findMany({
    include: {
      block: {
        select: {
          label: true,
          kind: true,
        },
      },
    },
    orderBy: { orderHint: 'asc' },
  })

  console.log(`\nFound ${steps.length} steps:\n`)
  
  steps.forEach((step, index) => {
    const label = step.block.label.substring(0, 80)
    console.log(`${index.toString().padStart(3)}. [orderHint: ${step.orderHint.toString().padStart(3)}] ${step.block.kind.padEnd(20)} ${label}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

