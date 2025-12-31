/**
 * Type definitions for the census wizard
 */

// Content block kinds matching the database schema
export type StepKind =
  | 'statement'
  | 'legal'
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'date'
  | 'number'
  | 'single_choice'
  | 'multi_choice'
  | 'picture_choice'
  | 'dropdown'
  | 'opinion_scale'
  | 'rating'
  | 'yes_no'
  | 'group'

// Choice option in a selection field
export interface Choice {
  ref: string
  label: string
  imageUrl?: string
}

// Scale labels for opinion_scale type
export interface ScaleLabels {
  left?: string
  center?: string
  right?: string
}

// Props stored in ContentBlock.props (parsed from JSON)
export interface StepProps {
  choices?: Choice[]
  labels?: ScaleLabels
  steps?: number
  allowMultiple?: boolean
  allowOther?: boolean
  randomize?: boolean
  required?: boolean
  minValue?: number
  maxValue?: number
  maxLength?: number
  imageUrl?: string
}

// A census step with its content block data
export interface CensusStepData {
  id: string
  blockId: string
  orderHint: number
  analyticsKey: string | null
  parentId: string | null
  
  // Flattened from ContentBlock
  kind: StepKind
  label: string
  help: string | null
  props: StepProps
  
  // For groups, their children
  children?: CensusStepData[]
}

// Answer value types
export type AnswerValue = 
  | string 
  | string[] 
  | number 
  | boolean 
  | null

// Current answers state (keyed by step ID or analytics key)
export interface AnswersState {
  [key: string]: AnswerValue
}

// Progress through the census
export interface CensusProgress {
  currentStepIndex: number
  totalSteps: number
  answeredSteps: number
  isComplete: boolean
}


