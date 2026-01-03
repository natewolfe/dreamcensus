// Census Component Types

export type QuestionType = 
  | 'statement'      // Likert scale (existing)
  | 'choice'         // Single choice (existing)
  | 'multiChoice'    // Multi choice
  | 'binary'         // Yes/No (existing)
  | 'scale'          // Numeric scale (existing)
  | 'frequency'      // Standardized frequency scale (new)
  | 'text'           // Long text (existing)
  | 'shortText'      // Short text (new)
  | 'number'         // Numeric input (existing)
  | 'date'           // Date picker (new)
  | 'imageChoice'    // Picture choice (new)
  | 'dropdown'       // Searchable dropdown (new)
  | 'matrix'         // Matrix/grid (new)
  | 'vas'            // Visual analog scale (new)
  | 'ranking'        // Drag-to-rank (new)
  | 'tagPool'        // Tag selection with custom input (new)

export type SkipBehavior = 'optional' | 'skippable' | 'required'

export interface CensusQuestion {
  id: string
  sectionId: string
  type: QuestionType
  text: string
  description?: string
  required: boolean // Keep for backward compat
  skipBehavior?: SkipBehavior // New field
  order: number
  config?: QuestionConfig
}

// Helper to resolve effective skip behavior
export function getSkipBehavior(question: CensusQuestion): SkipBehavior {
  if (question.skipBehavior) return question.skipBehavior
  return question.required ? 'required' : 'optional'
}

export interface QuestionConfig {
  // For statement questions
  scaleType?: 'agreement' | 'frequency' | 'satisfaction'
  steps?: number
  
  // For choice questions
  options?: string[]
  allowMultiple?: boolean
  allowOther?: boolean
  minSelections?: number
  maxSelections?: number
  
  // For scale questions
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
  
  // For text questions
  placeholder?: string
  maxLength?: number
  minLength?: number
  
  // For number questions
  minValue?: number
  maxValue?: number
  unit?: string
  
  // For frequency questions
  anchorSet?: 'standard' | 'temporal' | 'agreement'
  frequencySteps?: 5 | 7
  allowNA?: boolean
  
  // For date questions
  minDate?: string
  maxDate?: string
  showAge?: boolean
  
  // For image choice questions
  imageOptions?: Array<{
    id: string
    label: string
    imageUrl: string
    alt: string
  }>
  columns?: 2 | 3 | 4
  
  // For dropdown questions
  searchable?: boolean
  
  // For matrix questions
  matrixRows?: Array<{
    id: string
    label: string
  }>
  matrixColumns?: Array<{
    value: number
    label: string
  }>
  
  // For VAS questions
  leftLabel?: string
  rightLabel?: string
  showValue?: boolean
  instruction?: string
  
  // For ranking questions
  rankingItems?: Array<{
    id: string
    label: string
  }>
  maxRank?: number
  
  // For binary questions
  variant?: 'yes_no' | 'agree_disagree' | 'true_false'
  
  // For tagPool questions
  tags?: string[]
  allowCustomTags?: boolean
  minTags?: number
  maxTags?: number
}

export interface CensusSection {
  id: string
  slug?: string
  instrumentId: string
  name: string
  description?: string
  icon?: string
  order: number
  questions: CensusQuestion[]
  estimatedMinutes?: number
}

export interface CensusProgress {
  sectionId: string
  totalQuestions: number
  answeredQuestions: number
  completedAt?: Date
}

export interface CensusAnswer {
  questionId: string
  value: unknown
  answeredAt: Date
}

// Component props

export interface StatementQuestionProps {
  question: CensusQuestion
  value: number | null
  onChange: (value: number) => void
}

export interface ChoiceQuestionProps {
  question: CensusQuestion
  value: string | string[] | null
  onChange: (value: string | string[]) => void
}

export interface ScaleQuestionProps {
  question: CensusQuestion
  value: number | null
  onChange: (value: number) => void
}

export interface TextQuestionProps {
  question: CensusQuestion
  value: string
  onChange: (value: string) => void
}

export interface NumberQuestionProps {
  question: CensusQuestion
  value: number | null
  onChange: (value: number) => void
}

export interface OpinionSliderProps {
  value: number | null
  onChange: (value: number) => void
  leftLabel: string
  rightLabel: string
  steps?: number
}

export interface SectionCardProps {
  section: CensusSection
  progress: CensusProgress
  isLocked?: boolean
  onClick?: () => void
}

export interface SectionRunnerProps {
  section: CensusSection
  initialAnswers: Map<string, unknown>
  onComplete?: (answers: Map<string, unknown>) => void
  onExit?: () => void
}

export interface QuestionRendererProps {
  question: CensusQuestion
  value: unknown
  onChange: (value: unknown) => void
}

