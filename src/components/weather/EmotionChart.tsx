'use client'

import { motion } from 'motion/react'
import type { EmotionDistribution } from '@/lib/weather/types'

interface EmotionChartProps {
  data: EmotionDistribution[]
  period?: string
  showLegend?: boolean
  onMethodClick?: () => void
  title?: string        // Configurable title (default: "Your Emotions")
  subtitle?: string     // Optional subtitle for attribution
}

export function EmotionChart({
  data,
  period = '30 days',
  onMethodClick,
  title = 'Your Emotions',
  subtitle,
}: EmotionChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-4 mb-1">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted">
            {subtitle || period}
          </p>
        </div>
        {onMethodClick && (
          <button
            onClick={onMethodClick}
            className="text-sm text-accent font-medium opacity-50 hover:opacity-100 transition-opacity"
            aria-label="How is this calculated?"
          >
            ⓘ
          </button>
        )}
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <p className="text-sm">Not enough data yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <motion.div
              key={item.emotion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-25 text-sm text-foreground capitalize text-right">
                {item.emotion}
              </div>
              
              <div className="flex-1 h-5 rounded-full bg-subtle/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              
              <div className="w-8 text-left text-sm text-muted font-medium">
                {Math.round(item.percentage)}%
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

