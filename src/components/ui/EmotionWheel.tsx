'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface EmotionSelection {
  primary: string
  secondary?: string
  intensity: number
}

interface EmotionWheelProps {
  value: EmotionSelection | null
  onChange: (selection: EmotionSelection) => void
  mode?: 'coarse' | 'fine'
}

const COARSE_EMOTIONS = [
  { value: 'joy', label: 'Joy', color: '#ffb74d' },
  { value: 'fear', label: 'Fear', color: '#ef5350' },
  { value: 'sadness', label: 'Sadness', color: '#42a5f5' },
  { value: 'anger', label: 'Anger', color: '#e53935' },
  { value: 'surprise', label: 'Surprise', color: '#ab47bc' },
  { value: 'curiosity', label: 'Curiosity', color: '#66bb6a' },
]

const FINE_EMOTIONS: Record<string, string[]> = {
  joy: ['elation', 'contentment', 'pride'],
  fear: ['anxiety', 'dread', 'worry'],
  sadness: ['grief', 'melancholy', 'longing'],
  anger: ['rage', 'frustration', 'annoyance'],
  surprise: ['shock', 'amazement', 'confusion'],
  curiosity: ['wonder', 'interest', 'fascination'],
}

export function EmotionWheel({
  value,
  onChange,
  mode: initialMode = 'coarse',
}: EmotionWheelProps) {
  const [mode, setMode] = useState<'coarse' | 'fine'>(initialMode)
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(
    value?.primary ?? null
  )
  const [intensity, setIntensity] = useState(value?.intensity ?? 50)

  const handlePrimarySelect = (primary: string) => {
    setSelectedPrimary(primary)
    setMode('fine')
    onChange({
      primary,
      intensity,
    })
  }

  const handleSecondarySelect = (secondary: string) => {
    if (!selectedPrimary) return
    
    onChange({
      primary: selectedPrimary,
      secondary,
      intensity,
    })
  }

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity)
    if (selectedPrimary) {
      onChange({
        primary: selectedPrimary,
        secondary: value?.secondary,
        intensity: newIntensity,
      })
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {mode === 'coarse' ? (
          <motion.div
            key="coarse"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {COARSE_EMOTIONS.map((emotion) => (
              <motion.button
                key={emotion.value}
                onClick={() => handlePrimarySelect(emotion.value)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-20 h-20 rounded-full',
                  'flex items-center justify-center',
                  'font-medium text-foreground text-sm',
                  'transition-all',
                  'border-2 border-white/20',
                  selectedPrimary === emotion.value && 'ring-4 ring-accent/30 scale-110'
                )}
                style={{ backgroundColor: emotion.color }}
              >
                {emotion.label}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="fine"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMode('coarse')}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                ← Change emotion
              </button>
              <span className="text-sm text-muted capitalize">
                {selectedPrimary}
              </span>
            </div>

            {selectedPrimary && FINE_EMOTIONS[selectedPrimary] && (
              <div className="flex flex-wrap justify-center gap-2">
                {FINE_EMOTIONS[selectedPrimary].map((secondary) => (
                  <motion.button
                    key={secondary}
                    onClick={() => handleSecondarySelect(secondary)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-all',
                      'border-2',
                      value?.secondary === secondary
                        ? 'bg-muted border-muted text-foreground'
                        : 'border-border bg-card-bg text-foreground hover:border-accent/50'
                    )}
                  >
                    {secondary}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Intensity slider */}
            <div className="pt-4">
              <label className="block text-sm text-muted mb-2 text-center">
                Intensity: {intensity}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

