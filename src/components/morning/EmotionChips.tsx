'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { CORE_EMOTIONS, EXPANDED_EMOTIONS } from './types'

interface EmotionChipsProps {
  selected: string[]
  onChange: (selected: string[]) => void
  showExpanded?: boolean
  max?: number
}

export function EmotionChips({
  selected,
  onChange,
  showExpanded: initialShowExpanded = false,
  max = 5,
}: EmotionChipsProps) {
  const [showExpanded, setShowExpanded] = useState(initialShowExpanded)

  const handleToggle = (emotion: string) => {
    if (selected.includes(emotion)) {
      onChange(selected.filter(e => e !== emotion))
    } else if (selected.length < max) {
      onChange([...selected, emotion])
    }
  }

  const displayedEmotions = showExpanded
    ? [...CORE_EMOTIONS, ...EXPANDED_EMOTIONS]
    : CORE_EMOTIONS

  return (
    <div className="space-y-3">
      <motion.div 
        layout
        className="flex flex-wrap justify-center gap-2"
      >
        <AnimatePresence mode="popLayout">
          {displayedEmotions.map((emotion) => (
            <motion.button
              key={emotion}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggle(emotion)}
              disabled={!selected.includes(emotion) && selected.length >= max}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                'border',
                selected.includes(emotion)
                  ? 'bg-accent border-accent text-white'
                  : 'bg-card-bg border-border text-muted hover:border-accent hover:text-foreground',
                !selected.includes(emotion) && selected.length >= max && 'opacity-50 cursor-not-allowed'
              )}
              aria-pressed={selected.includes(emotion)}
            >
              {selected.includes(emotion) && (
                <span className="mr-1">✓</span>
              )}
              {emotion}
            </motion.button>
          ))}
        </AnimatePresence>
        
        {!showExpanded && (
          <motion.button
            layout
            onClick={() => setShowExpanded(true)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium',
              'bg-transparent border border-dashed border-subtle text-subtle',
              'hover:border-muted hover:text-muted transition-colors'
            )}
          >
            +more
          </motion.button>
        )}
      </motion.div>

    </div>
  )
}

