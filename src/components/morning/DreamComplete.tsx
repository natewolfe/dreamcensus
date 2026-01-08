'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button, Card } from '@/components/ui'
import { MicroInsight } from './MicroInsight'
import { useEnhancedAnimations } from '@/hooks/use-enhanced-animations'
import {
  formatDreamDateWithYear,
  formatTime,
  getVividnessLabel,
  getDreamDisplayTitle,
} from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DreamCompleteProps } from './types'

export function DreamComplete({
  dream,
  insight,
  onContinue,
  onViewInsights,
  onCaptureAnother,
}: DreamCompleteProps) {
  const showEffects = useEnhancedAnimations()
  const [showShimmer, setShowShimmer] = useState(false)

  useEffect(() => {
    if (showEffects) {
      // Trigger shimmer after the card animates in
      const timer = setTimeout(() => {
        setShowShimmer(true)
        setTimeout(() => setShowShimmer(false), 500)
      }, 600)
      
      return () => clearTimeout(timer)
    }
  }, [showEffects])

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
        className="text-2xl font-light text-foreground"
      >
        Dream Captured
      </motion.h1>

      {/* Dream Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="w-full max-w-sm mt-6 mb-6"
      >
        <Card 
          variant="elevated" 
          padding="md"
          className={cn(
            showEffects && 'save-shimmer',
            showShimmer && 'shimmer-active'
          )}
        >
          <div className="divide-y divide-border">
            {/* Title */}
            <div className="pb-3 text-center">
              <h2 className="text-base font-medium text-foreground">
                {dream.title ? `"${dream.title}"` : getDreamDisplayTitle(dream.title, dream.dreamNumber)}
              </h2>
            </div>
            
            {/* Date & Time */}
            <div className="py-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Date</span>
                <span className="text-foreground">{formatDreamDateWithYear(dream.capturedAt)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-muted">Time</span>
                <span className="text-foreground">{formatTime(dream.capturedAt)}</span>
              </div>
            </div>

            {/* Emotions */}
            {dream.emotions.length > 0 && (
              <div className="py-3">
                <div className="flex justify-between items-start text-sm">
                  <span className="text-muted">Emotions</span>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[65%]">
                    {dream.emotions.map((emotion) => (
                      <span
                        key={emotion}
                        className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent capitalize"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vividness */}
            {dream.vividness !== undefined && (
              <div className="pt-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Vividness</span>
                  <span className="text-foreground capitalize">{getVividnessLabel(dream.vividness)}</span>
                </div>
              </div>
            )}
          </div>
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
        className="flex flex-col items-center gap-3 w-full max-w-sm"
      >
        <div className="flex gap-3 w-full">
          <Button variant="special" onClick={onContinue} className="flex-1">
            Done
          </Button>
          
          {insight && (
            <Button variant="secondary" onClick={onViewInsights}>
              See Insights
            </Button>
          )}
        </div>
        
        {/* Capture Another */}
        {onCaptureAnother && (
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={onCaptureAnother} className="flex-1">
              Record another
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

