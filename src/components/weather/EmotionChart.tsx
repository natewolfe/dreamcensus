'use client'

import { motion } from 'motion/react'
import type { EmotionDistribution } from '@/lib/weather/types'

interface EmotionChartProps {
  data: EmotionDistribution[]
  period?: string
  showLegend?: boolean
  onMethodClick?: () => void
}

export function EmotionChart({
  data,
  period = '30 days',
  onMethodClick,
}: EmotionChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">
            Your Emotions
          </h3>
          <p className="text-sm text-muted">
            {period}
          </p>
        </div>
        {onMethodClick && (
          <button
            onClick={onMethodClick}
            className="text-sm text-accent hover:underline"
            aria-label="How is this calculated?"
          >
            ⓘ Method
          </button>
        )}
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <p className="text-sm">Not enough data yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((item, index) => (
            <motion.div
              key={item.emotion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-20 text-sm text-foreground capitalize">
                {item.emotion}
              </div>
              
              <div className="flex-1 h-6 rounded-full bg-subtle/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              
              <div className="w-12 text-right text-sm text-muted">
                {Math.round(item.percentage)}%
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

