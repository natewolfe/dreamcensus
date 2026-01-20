'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { DreamWeatherChart } from './DreamWeatherChart'
import { DataSourceToggle } from './DataSourceToggle'
import type { DreamWeatherChartData } from '@/lib/weather/types'

type DataSource = 'collective' | 'personal'

interface EmbeddedWeatherChartProps {
  /** Collective chart data (always provided) */
  collectiveChartData: DreamWeatherChartData
  /** Personal chart data (optional, enables toggle) */
  personalChartData?: DreamWeatherChartData | null
  /** 'full' shows toggle buttons, 'compact' shows simple header, 'inline' shows nothing */
  variant?: 'full' | 'compact' | 'inline'
  /** Initial data source (when both datasets available) */
  initialSource?: DataSource
}

export function EmbeddedWeatherChart({ 
  collectiveChartData,
  personalChartData,
  variant = 'full',
  initialSource = 'collective',
}: EmbeddedWeatherChartProps) {
  const [source, setSource] = useState<DataSource>(initialSource)
  
  // Determine which chart to show
  const chartData = source === 'personal' && personalChartData
    ? personalChartData
    : collectiveChartData
  
  // Determine link destination
  const href = source === 'personal' ? '/weather?source=personal' : '/weather'
  
  // Which sources are available
  const hasPersonal = !!personalChartData
  const disabled: DataSource[] = hasPersonal ? [] : ['personal']

  return (
    <section aria-label="Dream weather">
      {/* Header row (not shown for inline variant) */}
      {variant !== 'inline' && (
        <div className="flex items-center justify-between mb-2">
          {variant === 'full' ? (
            // Full variant: toggle buttons
            <DataSourceToggle
              value={source}
              onChange={setSource}
              disabled={disabled}
              size="md"
            />
          ) : (
            // Compact variant: simple title
            <h3 className="text-base font-semibold text-foreground">
              {source === 'personal' ? 'Your Dream Weather' : 'Collective Dream Weather'}
            </h3>
          )}

          {/* See more link */}
          <Link
            href={href}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            See more →
          </Link>
        </div>
      )}

      {/* Chart */}
      <Link href={href} className="block">
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
