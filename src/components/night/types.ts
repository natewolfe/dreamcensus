// Night Mode Types

import type { FlowDirection } from '@/lib/flow/types'

export type NightStep =
  | 'welcome'
  | 'day_reflect'
  | 'breathing'
  | 'intention'
  | 'tomorrow'
  | 'complete'

export type NightEvent =
  | { type: 'START' }
  | { type: 'SKIP_REFLECTION' }
  | { type: 'SUBMIT_REFLECTION'; mood: string; notes?: string }
  | { type: 'BREATHING_COMPLETE' }
  | { type: 'SKIP_BREATHING' }
  | { type: 'SET_INTENTION'; intention: string }
  | { type: 'SKIP_INTENTION' }
  | { type: 'SET_REMINDER'; time: string; enabled: boolean }
  | { type: 'SKIP_REMINDER' }
  | { type: 'COMPLETE' }

export type MoodType = 'rough' | 'okay' | 'good' | 'great' | 'amazing'

export interface DayReflectionData {
  mood: MoodType
  dayNotes?: string
}

export interface BreathingPattern {
  inhale: number
  hold: number
  exhale: number
}

export interface NightCheckInData {
  mood?: MoodType
  dayNotes?: string
  intention?: string
  plannedWakeTime?: string
  reminderEnabled?: boolean
  date: string
}

export interface NightModeProps {
  initialStep?: NightStep
  onComplete: () => void
  onCancel: () => void
}

export interface NightWelcomeProps {
  onBegin: () => void
  onNotTonight: () => void
}

export interface DayReflectionProps {
  direction?: FlowDirection
  onComplete: (data: DayReflectionData) => void
  onSkip: () => void
  onBack: () => void
}

export interface BreathingGuideProps {
  duration?: 30 | 60 | 90 | 120
  pattern?: BreathingPattern
  onComplete: () => void
  onSkip: () => void
  onBack: () => void
}

export interface DreamIntentionProps {
  direction?: FlowDirection
  suggestions?: string[]
  previousIntentions?: string[]
  onComplete: (intention: string) => void
  onSkip: () => void
  onBack: () => void
}

export interface TomorrowSetupProps {
  direction?: FlowDirection
  defaultWakeTime?: string
  onComplete: (data: { wakeTime: string; enableReminder: boolean; armAlarm: boolean }) => void
  onSkip: () => void
  onBack: () => void
}

export interface NightCompleteProps {
  intention?: string
  onClose: () => void
}

