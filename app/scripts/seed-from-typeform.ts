/**
 * Seed script to transform Typeform JSON export into database rows.
 * 
 * Usage:
 *   npx tsx scripts/seed-from-typeform.ts
 * 
 * Reads: ../data/typeform-NpE4W7.json
 * Writes: ContentBlock and CensusStep records to the database
 * 
 * NOTE: Run seed-chapters.ts first to create chapters!
 */

import { PrismaClient } from '../src/generated/prisma'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { SCHEMA_VERSION } from '../src/lib/constants'

const prisma = new PrismaClient()

// Map Typeform section titles to our chapter slugs
const SECTION_TO_CHAPTER: Record<string, string> = {
  'Section 1. The Dreamer': 'dreamer',
  'Section 2. Sleeping': 'sleeping',
  'Section 3. Dreaming': 'dreaming',
}

// Cache for chapter IDs
const chapterIdCache: Record<string, string> = {}

// Path to the Typeform export
const TYPEFORM_PATH = path.resolve(__dirname, '../../data/typeform-NpE4W7.json')

// Type definitions for Typeform JSON structure
interface TypeformChoice {
  id: string
  ref: string
  label: string
  attachment?: {
    type: string
    href: string
  }
}

interface TypeformLabels {
  left?: string
  center?: string
  right?: string
}

interface TypeformField {
  id: string
  ref: string
  title: string
  type: string
  properties?: {
    description?: string
    choices?: TypeformChoice[]
    fields?: TypeformField[]
    labels?: TypeformLabels
    steps?: number
    randomize?: boolean
    allow_multiple_selection?: boolean
    allow_other_choice?: boolean
    button_text?: string
  }
  validations?: {
    required?: boolean
    min_value?: number
    max_value?: number
    max_length?: number
  }
  attachment?: {
    type: string
    href: string
  }
}

interface TypeformData {
  id: string
  title: string
  fields: TypeformField[]
  welcome_screens?: Array<{
    id: string
    ref: string
    title: string
    properties?: { description?: string }
  }>
  thankyou_screens?: Array<{
    id: string
    ref: string
    title: string
    properties?: { description?: string }
  }>
}

/**
 * Map Typeform field types to our internal kinds
 */
function mapTypeformType(typeformType: string): string {
  const typeMap: Record<string, string> = {
    statement: 'statement',
    legal: 'legal',
    short_text: 'short_text',
    long_text: 'long_text',
    email: 'email',
    date: 'date',
    number: 'number',
    multiple_choice: 'single_choice', // Will be overridden if allow_multiple_selection
    picture_choice: 'picture_choice',
    dropdown: 'dropdown',
    opinion_scale: 'opinion_scale',
    rating: 'rating',
    yes_no: 'yes_no',
    group: 'group',
  }
  return typeMap[typeformType] || typeformType
}

/**
 * Build props object from Typeform field
 */
function buildProps(field: TypeformField): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  const properties = field.properties || {}
  const validations = field.validations || {}

  // Choices
  if (properties.choices) {
    props.choices = properties.choices.map((c) => ({
      ref: c.ref,
      label: c.label,
      imageUrl: c.attachment?.href,
    }))
  }

  // Scale labels
  if (properties.labels) {
    props.labels = properties.labels
  }

  // Steps for scales/ratings
  if (properties.steps) {
    props.steps = properties.steps
  }

  // Multiple selection flag
  if (properties.allow_multiple_selection) {
    props.allowMultiple = true
  }

  // Allow "other" option
  if (properties.allow_other_choice) {
    props.allowOther = true
  }

  // Randomize choices
  if (properties.randomize) {
    props.randomize = true
  }

  // Validations
  if (validations.required) {
    props.required = true
  }
  if (validations.min_value !== undefined) {
    props.minValue = validations.min_value
  }
  if (validations.max_value !== undefined) {
    props.maxValue = validations.max_value
  }
  if (validations.max_length !== undefined) {
    props.maxLength = validations.max_length
  }

  // Attachment on field itself (e.g., statement images)
  if (field.attachment?.href) {
    props.imageUrl = field.attachment.href
  }

  return props
}

/**
 * Compute a hash of the field content for change detection
 */
function computeHash(field: TypeformField): string {
  const content = JSON.stringify({
    title: field.title,
    type: field.type,
    properties: field.properties,
    validations: field.validations,
  })
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16)
}

/**
 * Get chapter ID by slug (with caching)
 */
async function getChapterId(slug: string): Promise<string | null> {
  if (chapterIdCache[slug]) {
    return chapterIdCache[slug]
  }
  
  const chapter = await prisma.censusChapter.findUnique({
    where: { slug },
    select: { id: true },
  })
  
  if (chapter) {
    chapterIdCache[slug] = chapter.id
    return chapter.id
  }
  
  return null
}

/**
 * Process a single Typeform field into ContentBlock and CensusStep
 */
async function processField(
  field: TypeformField,
  orderHint: number,
  chapterSlug: string,
  parentStepId: string | null = null
): Promise<void> {
  // Determine the kind
  let kind = mapTypeformType(field.type)
  
  // Override single_choice to multi_choice if multiple selection allowed
  if (kind === 'single_choice' && field.properties?.allow_multiple_selection) {
    kind = 'multi_choice'
  }

  // Build props - store as object for native JSON
  const props = buildProps(field)
  const sourceHash = computeHash(field)

  // Get chapter ID
  const chapterId = await getChapterId(chapterSlug)

  // Upsert ContentBlock
  const block = await prisma.contentBlock.upsert({
    where: { externalId: field.ref },
    update: {
      kind,
      label: field.title,
      help: field.properties?.description || null,
      props: props, // Native JSON, not stringified
      sourceHash,
      updatedAt: new Date(),
    },
    create: {
      externalId: field.ref,
      kind,
      label: field.title,
      help: field.properties?.description || null,
      props: props, // Native JSON, not stringified
      version: SCHEMA_VERSION,
      sourceHash,
      locale: 'en',
    },
  })

  // Create CensusStep with chapter link
  const step = await prisma.censusStep.upsert({
    where: {
      blockId_version: {
        blockId: block.id,
        version: SCHEMA_VERSION,
      },
    },
    update: {
      orderHint,
      parentId: parentStepId,
      analyticsKey: field.ref,
      chapterId, // Link to chapter
    },
    create: {
      blockId: block.id,
      orderHint,
      parentId: parentStepId,
      analyticsKey: field.ref,
      version: SCHEMA_VERSION,
      chapterId, // Link to chapter
    },
  })

  // Process nested fields for groups (inherit chapter from parent)
  if (field.type === 'group' && field.properties?.fields) {
    for (let i = 0; i < field.properties.fields.length; i++) {
      await processField(field.properties.fields[i], i, chapterSlug, step.id)
    }
  }
}

/**
 * Main seeding function
 */
async function seed(): Promise<void> {
  console.log('🌱 Starting seed from Typeform export...')
  console.log(`   Source: ${TYPEFORM_PATH}`)

  // Read the Typeform JSON
  if (!fs.existsSync(TYPEFORM_PATH)) {
    throw new Error(`Typeform export not found at ${TYPEFORM_PATH}`)
  }

  const raw = fs.readFileSync(TYPEFORM_PATH, 'utf-8')
  const data: TypeformData = JSON.parse(raw)

  console.log(`   Form: ${data.title} (${data.id})`)
  console.log(`   Fields: ${data.fields.length} top-level`)

  // Check if chapters exist
  const chapterCount = await prisma.censusChapter.count()
  if (chapterCount === 0) {
    console.log('\n⚠️  No chapters found! Run seed-chapters.ts first.')
    console.log('   npx tsx scripts/seed-chapters.ts')
    process.exit(1)
  }

  console.log(`   Chapters: ${chapterCount} found`)

  // Process each top-level field
  // Fields before any "Section X" go to 'intro' chapter
  // Section groups map to their respective chapters
  let currentChapter = 'intro'
  let globalOrderHint = 0

  for (let i = 0; i < data.fields.length; i++) {
    const field = data.fields[i]
    
    // Check if this is a section header (group with "Section X." in title)
    if (field.type === 'group' && SECTION_TO_CHAPTER[field.title]) {
      currentChapter = SECTION_TO_CHAPTER[field.title]
      console.log(`\n📁 Chapter: ${currentChapter}`)
      
      // Process nested fields within the section
      if (field.properties?.fields) {
        for (let j = 0; j < field.properties.fields.length; j++) {
          const nestedField = field.properties.fields[j]
          console.log(`   [${globalOrderHint + 1}] ${nestedField.type}: ${nestedField.title.slice(0, 40)}...`)
          await processField(nestedField, globalOrderHint++, currentChapter, null)
        }
      }
    } else {
      // Regular field - assign to current chapter
      console.log(`   [${globalOrderHint + 1}] ${field.type}: ${field.title.slice(0, 40)}...`)
      await processField(field, globalOrderHint++, currentChapter)
    }
  }

  // Log summary
  const blockCount = await prisma.contentBlock.count()
  const stepCount = await prisma.censusStep.count()
  const linkedSteps = await prisma.censusStep.count({ where: { chapterId: { not: null } } })

  console.log('\n✅ Seed complete!')
  console.log(`   ContentBlocks: ${blockCount}`)
  console.log(`   CensusSteps: ${stepCount}`)
  console.log(`   Steps linked to chapters: ${linkedSteps}`)
}

// Run the seed
seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

