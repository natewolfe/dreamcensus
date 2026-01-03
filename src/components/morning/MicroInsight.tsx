'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface MicroInsightProps {
  text: string
  type: 'pattern' | 'frequency' | 'tip'
  onTap?: () => void
}

const ICONS: Record<string, string> = {
  pattern: '💡',
  frequency: '📊',
  tip: '✨',
}

export function MicroInsight({ text, type, onTap }: MicroInsightProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      className={cn(
        'w-full rounded-xl p-4 text-left',
        'bg-gradient-to-br from-accent/10 to-accent/5',
        'border border-accent/20',
        'transition-all duration-200',
        onTap && 'cursor-pointer hover:border-accent/40'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{ICONS[type]}</span>
        <p className="text-sm text-foreground leading-relaxed">
          {text}
          {onTap && (
            <span className="ml-1 text-accent">
              Tap to see the pattern.
            </span>
          )}
        </p>
      </div>
    </motion.button>
  )
}

