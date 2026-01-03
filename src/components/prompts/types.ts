// Prompt Component Types

export type PromptResponseType = 'text' | 'scale' | 'choice' | 'multi_choice'

export interface Prompt {
  id: string
  question: string
  description?: string
  responseType: PromptResponseType
  config?: PromptConfig
  tags?: string[]
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

export interface PromptResponse {
  promptId: string
  value: unknown
  respondedAt: Date
  skipped: boolean
}

export interface PromptCardProps {
  prompt: Prompt
  onRespond: (value: unknown) => void
  onSkip: () => void
  onLater?: () => void
}

export interface TextResponseProps {
  placeholder?: string
  maxLength?: number
  minLength?: number
  value: string
  onChange: (value: string) => void
}

export interface ScaleResponseProps {
  min: number
  max: number
  minLabel?: string
  maxLabel?: string
  value: number | null
  onChange: (value: number) => void
}

export interface ChoiceResponseProps {
  options: string[]
  allowOther?: boolean
  value: string | null
  onChange: (value: string) => void
}

export interface MultiChoiceResponseProps {
  options: string[]
  allowOther?: boolean
  max?: number
  value: string[]
  onChange: (value: string[]) => void
}

