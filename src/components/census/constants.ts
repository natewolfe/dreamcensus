// Census Constants

// =============================================================================
// SECTION KINDS - Visual groupings for the constellation and list views
// =============================================================================

export const SECTION_KINDS = [
  {
    slug: 'self',
    name: 'Self',
    description: 'About you as a person',
    icon: '🪞',
    color: '#b093ff',
    categorySlugs: ['begin', 'personality', 'interiority'],
  },
  {
    slug: 'sleep',
    name: 'Sleep',
    description: 'Your sleep patterns and habits',
    icon: '😴',
    color: '#7986cb',
    categorySlugs: ['sleep'],
  },
  {
    slug: 'dreams',
    name: 'Dreams',
    description: 'The dreaming experience',
    icon: '🌙',
    color: '#9575cd',
    categorySlugs: ['recall', 'content', 'lucidity'],
  },
  {
    slug: 'cognition',
    name: 'Cognition',
    description: 'Mental faculties in dreams',
    icon: '🧠',
    color: '#ba68c8',
    categorySlugs: ['imagination', 'memory', 'spacetime'],
  },
  {
    slug: 'feelings',
    name: 'Feelings',
    description: 'Your emotional landscape',
    icon: '💜',
    color: '#ab47bc',
    categorySlugs: ['emotion', 'hope', 'fear'],
  },
  {
    slug: 'experience',
    name: 'Experience',
    description: 'What happens in dreams',
    icon: '✨',
    color: '#ce93d8',
    categorySlugs: ['embodiment', 'relationships', 'symbolism'],
  },
] as const

export type SectionKind = typeof SECTION_KINDS[number]

// =============================================================================
// SECTION PREREQUISITES - Dependency graph for unlocking sections
// A section is unlocked when ALL its prerequisites are complete
// =============================================================================

export const SECTION_PREREQUISITES: Record<string, string[]> = {
  // Entry point - no prerequisites
  'begin': [],
  
  // Basics unlocks these three branches
  'personality': ['begin'],
  'sleep': ['begin'],
  'recall': ['begin'],
  
  // Personality unlocks deeper self-exploration
  'interiority': ['personality'],
  'imagination': ['personality'],
  'emotion': ['personality'],
  
  // Complex dependencies requiring multiple prerequisites
  'symbolism': ['imagination', 'interiority'],
  'memory': ['interiority'],
  'lucidity': ['interiority', 'recall'],
  'content': ['recall'],
  'spacetime': ['memory'],
  'hope': ['emotion'],
  'fear': ['emotion'],
  
  // Experience sections
  'embodiment': ['content'],
  'relationships': ['emotion'],
}

// =============================================================================
// SECTION ORDER - Traversal order for finding "Next" section
// This determines priority when multiple sections are available
// =============================================================================

export const SECTION_ORDER: string[] = [
  'begin',
  'personality', 'sleep', 'recall',
  'interiority', 'imagination', 'emotion',
  'content', 'memory',
  'lucidity', 'symbolism', 'spacetime',
  'hope', 'fear',
  'embodiment', 'relationships',
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a section is unlocked based on completed prerequisites
 */
export function isSectionUnlocked(
  sectionSlug: string,
  completedSlugs: Set<string>
): boolean {
  const prerequisites = SECTION_PREREQUISITES[sectionSlug]
  // If no prerequisites defined, assume unlocked (fallback for unknown sections)
  if (!prerequisites || prerequisites.length === 0) return true
  return prerequisites.every(prereq => completedSlugs.has(prereq))
}

/**
 * Get the set of completed section slugs from progress data
 */
export function getCompletedSlugs(
  sections: Array<{ slug?: string; id: string }>,
  progress: Record<string, { completedAt?: Date | undefined }>
): Set<string> {
  return new Set(
    sections
      .filter(s => s.slug && progress[s.id]?.completedAt)
      .map(s => s.slug!)
  )
}

/**
 * Find the next recommended section to complete
 * Returns the first unlocked-but-incomplete section in SECTION_ORDER
 */
export function getNextSection<T extends { slug?: string; id: string }>(
  sections: T[],
  progress: Record<string, { completedAt?: Date | undefined }>
): T | undefined {
  const completedSlugs = getCompletedSlugs(sections, progress)
  
  for (const slug of SECTION_ORDER) {
    const section = sections.find(s => s.slug === slug)
    if (!section) continue
    if (completedSlugs.has(slug)) continue
    if (isSectionUnlocked(slug, completedSlugs)) {
      return section
    }
  }
  
  // Fallback: find any unlocked incomplete section not in SECTION_ORDER
  return sections.find(s => {
    if (!s.slug) return false
    if (completedSlugs.has(s.slug)) return false
    return isSectionUnlocked(s.slug, completedSlugs)
  })
}
