import { db } from './db'
import type { CensusStepData, StepProps, StepKind } from './types'
import { SCHEMA_VERSION } from './constants'

/**
 * Fetch all census steps in order, with their content blocks.
 * Returns a flat list of steps for linear progression.
 */
export async function getCensusSteps(): Promise<CensusStepData[]> {
  const steps = await db.censusStep.findMany({
    where: { version: SCHEMA_VERSION },
    include: {
      block: true,
      children: {
        include: { block: true },
        orderBy: { orderHint: 'asc' },
      },
    },
    orderBy: { orderHint: 'asc' },
  })

  // Transform to our data shape
  return steps.map((step) => ({
    id: step.id,
    blockId: step.blockId,
    orderHint: step.orderHint,
    analyticsKey: step.analyticsKey,
    parentId: step.parentId,
    kind: step.block.kind as StepKind,
    label: step.block.label,
    help: step.block.help,
    props: step.block.props as StepProps,
    children: step.children?.map((child) => ({
      id: child.id,
      blockId: child.blockId,
      orderHint: child.orderHint,
      analyticsKey: child.analyticsKey,
      parentId: child.parentId,
      kind: child.block.kind as StepKind,
      label: child.block.label,
      help: child.block.help,
      props: child.block.props as StepProps,
    })),
  }))
}

/**
 * Get a flattened list of all answerable steps (excludes groups, includes their children)
 */
export async function getFlattenedSteps(): Promise<CensusStepData[]> {
  const steps = await getCensusSteps()
  const flattened: CensusStepData[] = []

  for (const step of steps) {
    if (step.kind === 'group' && step.children) {
      // Add children instead of the group itself
      flattened.push(...step.children)
    } else {
      flattened.push(step)
    }
  }

  return flattened
}

/**
 * Get a single step by ID
 */
export async function getStepById(stepId: string): Promise<CensusStepData | null> {
  const step = await db.censusStep.findUnique({
    where: { id: stepId },
    include: { block: true },
  })

  if (!step) return null

  return {
    id: step.id,
    blockId: step.blockId,
    orderHint: step.orderHint,
    analyticsKey: step.analyticsKey,
    parentId: step.parentId,
    kind: step.block.kind as StepKind,
    label: step.block.label,
    help: step.block.help,
    props: step.block.props as StepProps,
  }
}

/**
 * Get the total count of answerable steps
 */
export async function getTotalStepCount(): Promise<number> {
  // Count steps that are not groups (groups are containers, not questions)
  const count = await db.censusStep.count({
    where: {
      version: SCHEMA_VERSION,
      block: {
        kind: { not: 'group' },
      },
    },
  })
  return count
}

