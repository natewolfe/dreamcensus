'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { DreamWeatherChart } from './DreamWeatherChart'
import { cn } from '@/lib/utils'
import type { DreamWeatherChartData } from '@/lib/weather/types'

interface EmbeddedWeatherChartProps {
  chartData: DreamWeatherChartData
}

export function EmbeddedWeatherChart({ chartData }: EmbeddedWeatherChartProps) {
  const [source, setSource] = useState<'collective' | 'personal'>('collective')

  return (
    <section aria-label="Dream weather">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        {/* Toggle buttons - left */}
        <div className="flex gap-2">
          <button
            onClick={() => setSource('collective')}
            className={cn(
              'rounded-md px-3 py-1.5 text-md font-medium transition-colors',
              source === 'collective'
                ? 'bg-accent/20 border border-border/45 text-foreground'
                : 'bg-card-bg/30 text-muted border border-border/70 hover:text-foreground hover:bg-subtle/50'
            )}
          >
            Collective
          </button>
          <button
            disabled
            className={cn(
              'rounded-md px-3 py-1.5 text-md transition-colors cursor-not-allowed',
              'bg-card-bg/30 text-muted/50 border border-border/70'
            )}
          >
            Personal
          </button>
        </div>

        {/* See more link - right */}
        <Link
          href="/weather"
          className="text-sm text-accent hover:text-accent/80 transition-colors"
        >
          See more →
        </Link>
      </div>

      {/* Chart */}
      <Link href="/weather" className="block">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ backfaceVisibility: 'hidden', willChange: 'transform' }}
          className="rounded-lg border border-border overflow-hidden bg-card-bg cursor-pointer transition-all duration-300 hover:shadow-xl"
        >
          <DreamWeatherChart
            variant="embedded"
            points={chartData.points}
            current={chartData.current}
            totalDreams={chartData.totalDreams}
            timeRange={chartData.timeRange}
          />
        </motion.div>
      </Link>
    </section>
  )
}
