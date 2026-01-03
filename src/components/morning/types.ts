// Morning Mode Types
// State machine and data types for dream capture flow

export type MorningStep =
  | 'start'      // Method selection
  | 'quick-facts' // Quick metadata (recall level, flags)
  | 'voice'      // Voice recording
  | 'text'       // Text input
  | 'structure'  // Emotions, vividness, lucidity
  | 'tags'       // Quick tagging
  | 'close'      // Title + waking life link
  | 'complete'   // Success + dream card

export type MorningEvent =
  | { type: 'SELECT_VOICE' }
  | { type: 'SELECT_TEXT' }
  | { type: 'SELECT_EMOTION_ONLY' }
  | { type: 'QUICK_FACTS_COMPLETE'; data: QuickFactsData }
  | { type: 'CAPTURE_COMPLETE'; transcript: string }
  | { type: 'STRUCTURE_COMPLETE'; data: MicroStructureData }
  | { type: 'TAGS_COMPLETE'; tags: string[] }
  | { type: 'CLOSE_COMPLETE'; title?: string; wakingLife?: string }
  | { type: 'SKIP' }
  | { type: 'BACK' }
  | { type: 'SAVE_AND_EXIT' }

export type RecallLevel = 'nothing' | 'fragments' | 'scene' | 'full'

export interface QuickFactsData {
  recallLevel: RecallLevel
  emotions: string[]
  isLucid: boolean
  isNightmare: boolean
  isRecurring: boolean
}

export interface MicroStructureData {
  emotions: string[]
  vividness: number      // 0-100
  lucidity: 'no' | 'maybe' | 'yes' | null
}

export interface MorningDraft {
  id: string
  step: MorningStep
  
  // Quick facts
  recallLevel?: RecallLevel
  quickEmotions?: string[]
  isLucid?: boolean
  isNightmare?: boolean
  isRecurring?: boolean
  
  // Captured content
  narrative?: string
  audioUrl?: string
  captureMethod?: 'voice' | 'text' | 'emotion-only'
  
  // Structure
  emotions: string[]
  vividness: number
  lucidity: 'no' | 'maybe' | 'yes' | null
  
  // Tags
  tags: string[]
  
  // Close ritual
  title?: string
  wakingLifeLink?: string
  
  // Timestamps
  startedAt: Date
  lastUpdatedAt: Date
}

export interface MorningModeProps {
  initialStep?: MorningStep
  onComplete: (dreamId: string) => void
  onCancel: () => void
}

export interface MorningStartProps {
  globalStep: number
  totalSteps: number
  onVoice: () => void
  onText: () => void
  onEmotionOnly: () => void
  onSkip: () => void
}

export interface QuickFactsProps {
  globalStep: number
  totalSteps: number
  direction?: 'forward' | 'back'
  initialData?: Partial<QuickFactsData>
  onComplete: (data: QuickFactsData) => void
  onSkip: () => void
  onBack: () => void
}

export interface VoiceCaptureProps {
  globalStep: number
  totalSteps: number
  onComplete: (transcript: string, audioBlob?: Blob) => void
  onCancel: () => void
  onSkip?: () => void
  maxDuration?: number  // seconds, default 300
}

export type VoiceCaptureState =
  | 'idle'
  | 'permission'
  | 'ready'
  | 'recording'
  | 'processing'
  | 'complete'
  | 'error'

export interface TextCaptureProps {
  globalStep: number
  totalSteps: number
  initialValue?: string
  onComplete: (text: string) => void
  onCancel: () => void
  onSkip?: () => void
}

export interface MicroStructureProps {
  globalStep: number
  totalSteps: number
  direction?: 'forward' | 'back'
  initialData?: Partial<MicroStructureData>
  onComplete: (data: MicroStructureData) => void
  onSaveAndExit: (data: MicroStructureData) => void
  onBack: () => void
}

export interface FastTagsProps {
  globalStep: number
  totalSteps: number
  direction?: 'forward' | 'back'
  suggestions: string[]      // AI-suggested from narrative
  userLexicon: string[]     // User's custom tags
  selectedTags: string[]
  onComplete: (tags: string[]) => void
  onSkip: () => void
  onBack: () => void
}

export interface CloseRitualProps {
  globalStep: number
  totalSteps: number
  direction?: 'forward' | 'back'
  suggestedTitle?: string    // AI-generated suggestion
  onComplete: (data: { title?: string; wakingLife?: string }) => void
  onSkip: () => void
  onBack: () => void
}

export interface DreamCompleteProps {
  dream: {
    id: string
    title?: string
    capturedAt: Date
    emotions: string[]
    vividness?: number
  }
  insight?: {
    text: string
    type: 'pattern' | 'frequency' | 'tip'
  }
  onContinue: () => void
  onViewInsights: () => void
}

// Emotion constants
export const CORE_EMOTIONS = [
  'anxious', 'awe', 'tender', 'shame', 'joy', 
  'fear', 'calm', 'confused'
] as const

export const EXPANDED_EMOTIONS = [
  'anger', 'sadness', 'surprise', 'disgust', 'love',
  'longing', 'curiosity', 'peace', 'dread', 'wonder',
  'grief', 'relief'
] as const

export type CoreEmotion = typeof CORE_EMOTIONS[number]
export type ExpandedEmotion = typeof EXPANDED_EMOTIONS[number]
export type Emotion = CoreEmotion | ExpandedEmotion

