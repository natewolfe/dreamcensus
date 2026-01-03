'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { BreathingGuideProps, BreathingPattern } from './types'

const DEFAULT_PATTERN: BreathingPattern = {
  inhale: 4,
  hold: 7,
  exhale: 8,
}

type Phase = 'inhale' | 'hold' | 'exhale'

export function BreathingGuide({
  globalStep,
  totalSteps,
  duration = 60,
  pattern = DEFAULT_PATTERN,
  onComplete,
  onSkip,
}: BreathingGuideProps) {
  const [currentBreath, setCurrentBreath] = useState(0)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [phaseProgress, setPhaseProgress] = useState(0)
  const totalCycleDuration = pattern.inhale + pattern.hold + pattern.exhale
  const totalBreaths = Math.floor(duration / totalCycleDuration)
  
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    let elapsed = 0
    
    intervalRef.current = setInterval(() => {
      elapsed += 0.1
      
      const cycleTime = elapsed % totalCycleDuration
      
      // Determine phase
      if (cycleTime < pattern.inhale) {
        setPhase('inhale')
        setPhaseProgress(cycleTime / pattern.inhale)
      } else if (cycleTime < pattern.inhale + pattern.hold) {
        setPhase('hold')
        setPhaseProgress((cycleTime - pattern.inhale) / pattern.hold)
      } else {
        setPhase('exhale')
        setPhaseProgress((cycleTime - pattern.inhale - pattern.hold) / pattern.exhale)
      }
      
      // Count breaths (each cycle)
      const breathCount = Math.floor(elapsed / totalCycleDuration)
      setCurrentBreath(breathCount)
      
      // Complete when duration reached
      if (elapsed >= duration) {
        clearInterval(intervalRef.current)
        setTimeout(onComplete, 500)
      }
    }, 100)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [duration, pattern, totalCycleDuration, onComplete])

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in'
      case 'hold':
        return 'Hold'
      case 'exhale':
        return 'Breathe out'
    }
  }

  const getScale = () => {
    if (phase === 'inhale') {
      return 1 + phaseProgress * 0.3
    } else if (phase === 'exhale') {
      return 1.3 - phaseProgress * 0.3
    }
    return 1.3
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Step counter */}
      <div className="text-center">
        <span className="text-sm text-muted">
          {globalStep + 1} of {totalSteps}
        </span>
      </div>

      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="text-right w-full max-w-md mb-6">
        <button
          onClick={onSkip}
          className="text-muted hover:text-foreground transition-colors text-sm"
        >
          Skip →
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <h2 className="text-xl font-light text-foreground">
          Take a moment
        </h2>

        {/* Breathing circle */}
        <motion.div
          animate={{
            scale: getScale(),
            opacity: phase === 'exhale' ? 0.7 : 1,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative w-48 h-48 rounded-full flex items-center justify-center bg-accent/20"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-foreground text-lg font-light"
            >
              {getPhaseLabel()}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Progress */}
        <div className="text-center">
          <div className="flex gap-1 justify-center mb-2">
            {Array.from({ length: Math.min(totalBreaths, 8) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < currentBreath ? 'bg-accent' : 'bg-subtle'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted">
            {currentBreath} of {totalBreaths} breaths
          </p>
        </div>
      </div>
      </div>
    </motion.div>
  )
}

