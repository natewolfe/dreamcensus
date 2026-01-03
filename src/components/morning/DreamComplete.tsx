'use client'

import { motion } from 'motion/react'
import { Button, Card } from '@/components/ui'
import { MicroInsight } from './MicroInsight'
import type { DreamCompleteProps } from './types'

export function DreamComplete({
  dream,
  insight,
  onContinue,
  onViewInsights,
}: DreamCompleteProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getVividnessLabel = (vividness?: number) => {
    if (vividness === undefined) return null
    if (vividness < 25) return 'faint'
    if (vividness < 50) return 'hazy'
    if (vividness < 75) return 'clear'
    return 'vivid'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8"
    >
      {/* Dream Mist Background Effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(149, 117, 205, 0.2), transparent 60%)',
          }}
        />
      </motion.div>

      {/* Success Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
        className="mb-4 text-4xl"
      >
        ✨
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="mb-8 text-2xl font-light text-foreground"
      >
        Dream Captured
      </motion.h1>

      {/* Dream Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="w-full max-w-sm mb-6"
      >
        <Card variant="elevated" padding="lg">
          {dream.title && (
            <h2 className="text-lg font-medium text-foreground mb-2">
              "{dream.title}"
            </h2>
          )}
          
          <p className="text-sm text-muted">
            {formatDate(dream.capturedAt)} · {formatTime(dream.capturedAt)}
          </p>

          {(dream.emotions.length > 0 || dream.vividness !== undefined) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {dream.emotions.map((emotion) => (
                <span
                  key={emotion}
                  className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent"
                >
                  {emotion}
                </span>
              ))}
              
              {dream.vividness !== undefined && (
                <span className="text-xs text-muted">
                  · {getVividnessLabel(dream.vividness)}
                </span>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Micro Insight */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="w-full max-w-sm mb-8"
        >
          <MicroInsight
            text={insight.text}
            type={insight.type}
            onTap={onViewInsights}
          />
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="flex gap-4"
      >
        <Button variant="primary" onClick={onContinue}>
          Continue to Today
        </Button>
        
        {insight && (
          <Button variant="secondary" onClick={onViewInsights}>
            See Insights
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}

