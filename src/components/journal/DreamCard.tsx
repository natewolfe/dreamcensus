'use client'

import { motion } from 'motion/react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { DreamCardProps } from './types'

export function DreamCard({ dream, variant = 'compact', onClick }: DreamCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  const getVividnessDots = (vividness?: number) => {
    if (vividness === undefined) return 0
    return Math.ceil(vividness / 20) // 0-5 dots
  }

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full text-left"
      >
        <Card variant="interactive" padding="md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm text-muted">
                  {formatDate(dream.capturedAt)}
                </span>
                <span className="text-xs text-subtle">
                  {formatTime(dream.capturedAt)}
                </span>
              </div>
              
              {dream.title && (
                <h3 className="text-base font-medium text-foreground mb-2 truncate">
                  "{dream.title}"
                </h3>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {dream.emotions.slice(0, 3).map((emotion) => (
                  <span
                    key={emotion}
                    className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent"
                  >
                    {emotion}
                  </span>
                ))}
                {dream.emotions.length > 3 && (
                  <span className="text-xs text-muted">
                    +{dream.emotions.length - 3}
                  </span>
                )}
              </div>
            </div>

            {dream.vividness !== undefined && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      i < getVividnessDots(dream.vividness)
                        ? 'bg-accent'
                        : 'bg-subtle'
                    )}
                  />
                ))}
                <span className="ml-1 text-xs text-muted">
                  {getVividnessLabel(dream.vividness)}
                </span>
              </div>
            )}
          </div>
        </Card>
      </motion.button>
    )
  }

  // Expanded variant
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left"
    >
      <Card variant="interactive" padding="lg">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {dream.title && (
                <h3 className="text-lg font-medium text-foreground mb-1">
                  "{dream.title}"
                </h3>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">
                  {formatDate(dream.capturedAt)}
                </span>
                <span className="text-subtle">·</span>
                <span className="text-subtle">
                  {formatTime(dream.capturedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Preview text would go here if we had decrypted content */}
          
          <div className="flex flex-wrap items-center gap-2">
            {dream.emotions.map((emotion) => (
              <span
                key={emotion}
                className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent"
              >
                {emotion}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted">
            {dream.vividness !== undefined && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      i < getVividnessDots(dream.vividness)
                        ? 'bg-accent'
                        : 'bg-subtle'
                    )}
                  />
                ))}
                <span className="ml-1">
                  {getVividnessLabel(dream.vividness)}
                </span>
              </div>
            )}
            
            {dream.lucidity && dream.lucidity !== 'no' && (
              <>
                <span>·</span>
                <span>lucid: {dream.lucidity}</span>
              </>
            )}

            {dream.tags.length > 0 && (
              <>
                <span>·</span>
                <span>{dream.tags.length} tag{dream.tags.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.button>
  )
}

