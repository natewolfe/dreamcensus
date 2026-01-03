'use client'

import { motion } from 'motion/react'
import { Card, Button } from '@/components/ui'
import type { PatternCardProps } from './types'

export function PatternCard({
  title,
  description,
  confidence,
  relatedDreams,
  onViewDreams,
}: PatternCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card padding="lg">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                {title}
              </h3>
              {confidence !== undefined && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>Confidence:</span>
                  <div className="flex-1 h-1.5 w-20 rounded-full bg-subtle/30 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(confidence * 100)}%</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-foreground leading-relaxed">
            {description}
          </p>

          {relatedDreams !== undefined && relatedDreams > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted">
                Based on {relatedDreams} dream{relatedDreams !== 1 ? 's' : ''}
              </span>
              {onViewDreams && (
                <Button variant="ghost" size="sm" onClick={onViewDreams}>
                  View Dreams →
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

