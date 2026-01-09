import type { PromptData, UserPromptState } from './types'

// Mock prompt pool - in production this would come from database
const PROMPT_POOL: PromptData[] = [
  {
    id: 'recurring-symbols',
    question: "What's a recurring symbol in your dreams?",
    description: 'Symbols that appear frequently often have personal meaning',
    responseType: 'text',
    config: {
      placeholder: 'Water, keys, a specific place...',
      maxLength: 200,
    },
    tags: ['symbols', 'patterns'],
  },
  {
    id: 'dream-emotions',
    question: 'How often do you experience strong emotions in your dreams?',
    responseType: 'scale',
    config: {
      min: 1,
      max: 5,
      minLabel: 'Rarely',
      maxLabel: 'Very often',
    },
    tags: ['emotions', 'reflection'],
  },
  {
    id: 'dream-recall-quality',
    question: 'How would you describe your dream recall this week?',
    responseType: 'choice',
    config: {
      options: [
        'Better than usual',
        'About the same',
        'Worse than usual',
        'No dreams remembered',
      ],
    },
    tags: ['recall', 'reflection'],
  },
  {
    id: 'lucid-interest',
    question: 'Are you interested in exploring lucid dreaming?',
    responseType: 'choice',
    config: {
      options: [
        'Very interested',
        'Somewhat interested',
        'Not interested',
        'Already practice it',
      ],
    },
    tags: ['lucidity', 'learning'],
  },
  {
    id: 'dream-themes',
    question: 'What themes have appeared in your dreams recently?',
    responseType: 'text',
    config: {
      placeholder: 'Travel, relationships, work...',
      maxLength: 300,
    },
    tags: ['themes', 'reflection'],
  },
]

/**
 * Select today's prompt for a user
 */
export function selectDailyPrompt(
  userHistory: UserPromptState[],
  userDreamCount: number = 0
): PromptData | null {
  // Filter out prompts shown recently
  const availablePrompts = PROMPT_POOL.filter((prompt) => {
    const history = userHistory.find((h) => h.promptId === prompt.id)
    
    // If never shown, it's available
    if (!history || !history.lastShownAt) return true
    
    // Check frequency rules
    if (prompt.frequency?.maxTimesTotal) {
      if (history.shownCount >= prompt.frequency.maxTimesTotal) {
        return false
      }
    }
    
    if (prompt.frequency?.minDaysBetween) {
      const daysSince = Math.floor(
        (Date.now() - new Date(history.lastShownAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSince < prompt.frequency.minDaysBetween) {
        return false
      }
    }
    
    return true
  })
  
  if (availablePrompts.length === 0) {
    return null
  }
  
  // Apply targeting rules (basic implementation)
  const targetedPrompts = availablePrompts.filter((prompt) => {
    if (!prompt.targetingRules || prompt.targetingRules.length === 0) {
      return true
    }
    
    // For simplicity, just check has_dreams rule
    const hasDreamsRule = prompt.targetingRules.find((r) => r.type === 'has_dreams')
    if (hasDreamsRule) {
      const meetsCondition =
        hasDreamsRule.condition === 'greater_than'
          ? userDreamCount > (hasDreamsRule.value as number)
          : userDreamCount >= (hasDreamsRule.value as number)
      
      if (!meetsCondition) return false
    }
    
    return true
  })
  
  if (targetedPrompts.length === 0) {
    return null
  }
  
  // Weight by least shown
  const weighted = targetedPrompts.map((prompt) => {
    const history = userHistory.find((h) => h.promptId === prompt.id)
    const shownCount = history?.shownCount ?? 0
    const skippedCount = history?.skippedCount ?? 0
    
    // Prefer prompts that have been shown less and skipped less
    const weight = 1 / (1 + shownCount + skippedCount * 2)
    
    return { prompt, weight }
  })
  
  // Weighted random selection
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const { prompt, weight } of weighted) {
    random -= weight
    if (random <= 0) {
      return prompt
    }
  }
  
  // Fallback to first
  return weighted[0]?.prompt ?? null
}

/**
 * Check if user has responded to today's prompt
 */
export function hasRespondedToday(userHistory: UserPromptState[]): boolean {
  const today = new Date().toISOString().split('T')[0]
  
  return userHistory.some((history) => {
    if (!history.lastRespondedAt) return false
    
    const respondedDate = new Date(history.lastRespondedAt).toISOString().split('T')[0]
    return respondedDate === today
  })
}

/**
 * Get all available prompts (for browsing)
 */
export function getAllPrompts(): PromptData[] {
  return PROMPT_POOL
}

/**
 * Get prompt by ID
 */
export function getPromptById(id: string): PromptData | undefined {
  return PROMPT_POOL.find((p) => p.id === id)
}

