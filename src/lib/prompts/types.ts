// Prompt System Types

export type PromptResponseType = 'text' | 'scale' | 'choice' | 'multi_choice'

export interface PromptData {
  id: string
  question: string
  description?: string
  responseType: PromptResponseType
  config?: PromptConfig
  tags: string[]
  targetingRules?: TargetingRule[]
  frequency?: PromptFrequency
}

export interface PromptConfig {
  // For scale questions
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
  
  // For choice questions
  options?: string[]
  allowOther?: boolean
  
  // For text questions
  placeholder?: string
  maxLength?: number
  minLength?: number
}

export interface TargetingRule {
  type: 'has_dreams' | 'emotion_frequency' | 'lucidity' | 'streak' | 'tags'
  condition: 'greater_than' | 'less_than' | 'equals' | 'contains'
  value: string | number
}

export interface PromptFrequency {
  minDaysBetween?: number  // Don't show again for N days
  maxTimesTotal?: number   // Only show N times ever
}

export interface UserPromptState {
  userId: string
  promptId: string
  shownCount: number
  lastShownAt?: Date
  lastRespondedAt?: Date
  skippedCount: number
}

