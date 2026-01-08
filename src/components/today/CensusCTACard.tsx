'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ChevronRight } from '@/components/ui'

interface CensusCTACardProps {
  progress: number // 0-100
  answeredQuestions: number
}

export function CensusCTACard({ 
  progress, 
  answeredQuestions 
}: CensusCTACardProps) {
  const isComplete = progress === 100
  const hasStarted = answeredQuestions > 0

  return (
    <Link href="/census" className="block">
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-lg bg-card-bg border border-border p-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-subtle/20"
      >
        <div className="flex items-center gap-2">
          {/* Icon */}
          <div className="text-2xl">🔮</div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <span className="block text-md md:text-lg font-medium text-foreground">
              {isComplete ? 'Census Complete' : hasStarted ? 'Continue Census' : 'Go Deeper'}
            </span>
            <span className="block text-xs md:text-sm text-muted truncate">
              {isComplete ? 'Up-to-date!' : hasStarted ? 'Keep going' : 'Take the census'}
            </span>
          </div>

          {/* Completion percentage */}
          {!isComplete && (
            <span className="text-lg font-bold text-accent tabular-nums">
              {progress}%
            </span>
          )}

          {/* Arrow or checkmark */}
          {isComplete ? (
            <span className="text-accent text-lg">✓</span>
          ) : (
            <ChevronRight className="w-4 h-4 text-muted" />
          )}
        </div>

        {/* Progress bar */}
        {!isComplete && (
          <div className="mt-2 h-1.5 rounded-full bg-subtle/30 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-accent"
            />
          </div>
        )}
      </motion.div>
    </Link>
  )
}
