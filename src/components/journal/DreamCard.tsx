'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Card } from '@/components/ui'
import {
  cn,
  formatDreamDate,
  formatTime,
  getVividnessLabel,
  getVividnessDots,
  getDreamDisplayTitle,
} from '@/lib/utils'
import type { DreamCardProps } from './types'

export function DreamCard({ dream, variant = 'compact', href, onClick }: DreamCardProps) {
  const isLink = !!href && !onClick

  if (variant === 'compact') {
    const content = (
      <Card variant="interactive" padding="md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-row items-start justify-start gap-2 flex-1 min-w-0">
            
            <h3 className="text-base font-medium text-foreground mb-2 truncate">
              {dream.title ? `"${dream.title}"` : getDreamDisplayTitle(dream.title, dream.dreamNumber)}
            </h3>

            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted">
                {formatDreamDate(dream.capturedAt)}
              </span>
              <span className="text-xs text-subtle">
                {formatTime(dream.capturedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center justify-start gap-3 min-w-0">

            {dream.emotions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {dream.emotions.slice(0, 3).map((emotion) => (
                  <span
                    key={emotion}
                    className="rounded-full bg-accent/20 px-2 py-1 text-[11px] text-accent"
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
            )}
            
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
        </div>
      </Card>
    )

    if (isLink) {
      return (
        <Link href={href} className="block w-full">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {content}
          </motion.div>
        </Link>
      )
    }

    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full text-left"
      >
        {content}
      </motion.button>
    )
  }

  // Expanded variant
  const content = (
    <Card variant="interactive" padding="lg">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-foreground mb-1">
              {dream.title ? `"${dream.title}"` : getDreamDisplayTitle(dream.title, dream.dreamNumber)}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">
                {formatDreamDate(dream.capturedAt)}
              </span>
              <span className="text-subtle">·</span>
              <span className="text-subtle">
                {formatTime(dream.capturedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Preview text would go here if we had decrypted content */}
        
        {dream.emotions.length > 0 && (
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
        )}

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
  )

  if (isLink) {
    return (
      <Link href={href} className="block w-full">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {content}
        </motion.div>
      </Link>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left"
    >
      {content}
    </motion.button>
  )
}

