'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import type React from 'react'

interface DreamWeatherChartProps {
  points: Array<{
    timestamp: string
    avgValence: number
    avgIntensity: number
    dreamCount: number
    nightmareRate: number
  }>
  current: {
    condition: 'stormy' | 'cloudy' | 'calm' | 'pleasant' | 'radiant'
    valence: number
    intensity: number
    trend: 'rising' | 'falling' | 'stable'
  }
}

const WEATHER_CONFIG = {
  stormy: { 
    emoji: '⛈️', 
    label: 'Stormy', 
    color: '#ff5252', 
    description: 'High anxiety and negative emotions',
    bgGradient: 'from-red-500/20 to-red-900/5'
  },
  cloudy: { 
    emoji: '☁️', 
    label: 'Cloudy', 
    color: '#9fa8da', 
    description: 'Mixed emotions with slight tension',
    bgGradient: 'from-indigo-400/20 to-indigo-900/5'
  },
  calm: { 
    emoji: '🌙', 
    label: 'Calm', 
    color: '#b093ff', 
    description: 'Peaceful and balanced dream state',
    bgGradient: 'from-purple-400/20 to-purple-900/5'
  },
  pleasant: { 
    emoji: '✨', 
    label: 'Pleasant', 
    color: '#c4a2ff', 
    description: 'Positive emotions and comfort',
    bgGradient: 'from-purple-300/20 to-purple-800/5'
  },
  radiant: { 
    emoji: '🌟', 
    label: 'Radiant', 
    color: '#69f0ae', 
    description: 'Joyful and highly positive dreams',
    bgGradient: 'from-green-400/20 to-green-900/5'
  },
}

export function DreamWeatherChart({ points, current }: DreamWeatherChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const config = WEATHER_CONFIG[current.condition]
  
  // Normalize data
  const chartData = points.map((p, i) => {
    const currentDate = new Date(p.timestamp)
    const prevDate = i > 0 ? new Date(points[i - 1].timestamp) : null
    const isNewDay = prevDate && currentDate.getDate() !== prevDate.getDate()
    
    return {
      time: currentDate,
      timeLabel: currentDate.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        hour12: true
      }),
      shortTime: currentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        hour12: true 
      }),
      dateLabel: currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      valence: ((p.avgValence + 1) / 2) * 100, // -1 to 1 → 0 to 100
      intensity: p.avgIntensity * 100,
      dreamCount: p.dreamCount,
      nightmareRate: p.nightmareRate,
      rawValence: p.avgValence,
      isNewDay
    }
  })

  // Chart dimensions (absolute pixels for SVG viewBox)
  const chartWidth = 1000
  const chartHeight = 300
  const paddingTop = 20
  const paddingBottom = 45 // Reduced to bring labels closer
  const paddingLeft = 10
  const paddingRight = 10

  // Scales - ensure full width coverage
  const xScale = (index: number) => {
    if (chartData.length === 1) return chartWidth / 2
    return paddingLeft + (index / (chartData.length - 1)) * (chartWidth - paddingLeft - paddingRight)
  }
  
  const yScale = (value: number) => 
    paddingTop + ((100 - value) / 100) * (chartHeight - paddingTop - paddingBottom)

  // Generate SVG paths
  const linePath = chartData.map((d, i) => {
    const x = xScale(i)
    const y = yScale(d.valence)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  const areaPath = `${linePath} L ${xScale(chartData.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`

  // Intensity path (secondary visualization)
  const intensityPath = chartData.map((d, i) => {
    const x = xScale(i)
    const y = yScale(d.intensity)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  // Trend calculation
  const trendData = chartData.slice(-12) // Last 12 hours
  const avgRecent = trendData.reduce((sum, d) => sum + d.valence, 0) / trendData.length
  const trendIcon = current.trend === 'rising' ? '↗' : current.trend === 'falling' ? '↘' : '→'
  const trendColor = current.trend === 'rising' ? '#69f0ae' : current.trend === 'falling' ? '#ff5252' : config.color

  return (
    <div className="relative">
      {/* Header Section */}
      <div className="mb-2">
        <div className="flex items-start justify-between mb-3 p-3">
          <div className="flex items-center gap-6">
            <motion.div 
              className="text-6xl"
              animate={{ 
                scale: [1, 1.08, 1],
                rotate: [0, 3, -3, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
            >
              {config.emoji}
            </motion.div>
            <div>
              <h3 className="text-3xl font-semibold mb-1" style={{ fontFamily: 'var(--font-family-display)' }}>
                {config.label}
              </h3>
              <p className="text-sm text-[var(--foreground-muted)] max-w-md">
                {config.description}
              </p>
              <p className="text-xs text-[var(--foreground-subtle)] mt-1">
                Based on {points.reduce((sum, p) => sum + p.dreamCount, 0)} dreams over 72 hours
              </p>
            </div>
          </div>
          
          {/* Intensity Display */}
          <div className="text-right space-y-1">
            <div className="text-xs text-[var(--foreground-subtle)] uppercase tracking-wider">
              Intensity
            </div>
            <div className="text-3xl font-bold" style={{ color: config.color }}>
              {(current.intensity * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-[var(--foreground-muted)] flex items-center justify-end gap-1">
              <span 
                className="font-medium"
                style={{ color: trendColor }}
              >
                {trendIcon}
              </span>
              <span className="capitalize">{current.trend}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="px-3 py-2 bg-[var(--background-subtle)]/50 rounded-lg border border-[var(--border)]">
            <div className="text-xs text-[var(--foreground-subtle)] mb-1">Sentiment</div>
            <div className="text-lg font-semibold" style={{ color: config.color }}>
              {((current.valence + 1) / 2 * 100).toFixed(0)}%
            </div>
          </div>
          <div className="px-3 py-2 bg-[var(--background-subtle)]/50 rounded-lg border border-[var(--border)]">
            <div className="text-xs text-[var(--foreground-subtle)] mb-1">Dreams Tracked</div>
            <div className="text-lg font-semibold">{points.reduce((sum, p) => sum + p.dreamCount, 0)}</div>
          </div>
          <div className="px-3 py-2 bg-[var(--background-subtle)]/50 rounded-lg border border-[var(--border)]">
            <div className="text-xs text-[var(--foreground-subtle)] mb-1">Timespan</div>
            <div className="text-lg font-semibold">72h</div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div 
        className="relative rounded-xl border border-[var(--border)]"
        style={{ 
          background: `linear-gradient(to bottom, var(--background-subtle), var(--background-elevated))`,
        }}
      >
        {/* Chart Container */}
        <div className="relative px-6 pt-4 pb-2" style={{ height: `${chartHeight}px` }}>
          {/* Background Grid */}
          <svg 
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity="0.4" />
                <stop offset="50%" stopColor={config.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={config.color} stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={config.color} stopOpacity="0.6" />
                <stop offset="50%" stopColor={config.color} stopOpacity="1" />
                <stop offset="100%" stopColor={config.color} stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map(value => (
              <line
                key={value}
                x1={paddingLeft}
                y1={yScale(value)}
                x2={chartWidth - paddingRight}
                y2={yScale(value)}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.3"
              />
            ))}

            {/* X-axis baseline */}
            <line
              x1={paddingLeft}
              y1={yScale(0)}
              x2={chartWidth - paddingRight}
              y2={yScale(0)}
              stroke="var(--border)"
              strokeWidth="2"
              opacity="0.5"
            />

            {/* Area fill */}
            <motion.path
              d={areaPath}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            {/* Date change markers */}
            {chartData.map((d, i) => {
              if (!d.isNewDay) return null
              const x = xScale(i)
              
              return (
                <g key={`date-${i}`}>
                  {/* Vertical line at day change */}
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={yScale(0)}
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="5 7"
                    opacity="0.15"
                  />
                  {/* Date label */}
                  <text
                    x={x}
                    y={chartHeight - 28}
                    fill="var(--accent)"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                    opacity="0.8"
                  >
                    {d.dateLabel}
                  </text>
                </g>
              )
            })}

            {/* Intensity line (dotted, subtle) */}
            <motion.path
              d={intensityPath}
              stroke={config.color}
              strokeWidth="2"
              strokeDasharray="3 3"
              fill="none"
              opacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />

            {/* Main sentiment line */}
            <motion.path
              d={linePath}
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />

            {/* Hover areas - invisible rectangles for better interaction */}
            {chartData.map((d, i) => {
              const x = xScale(i)
              const nextX = i < chartData.length - 1 ? xScale(i + 1) : chartWidth - paddingRight
              const sliceWidth = i === 0 ? (nextX - x) : (nextX - x) / 2 + (x - xScale(i - 1)) / 2
              const sliceStart = i === 0 ? x : x - (x - xScale(i - 1)) / 2
              
              return (
                <rect
                  key={`hover-${i}`}
                  x={sliceStart}
                  y={paddingTop}
                  width={sliceWidth}
                  height={yScale(0) - paddingTop}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ pointerEvents: 'all' }}
                />
              )
            })}

            {/* Hover indicator line */}
            <AnimatePresence>
              {hoveredPoint !== null && (
                <motion.line
                  key="hover-line"
                  x1={xScale(hoveredPoint)}
                  y1={paddingTop}
                  x2={xScale(hoveredPoint)}
                  y2={yScale(0)}
                  stroke={config.color}
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </AnimatePresence>

            {/* Data points */}
            {chartData.map((d, i) => {
              const isHovered = hoveredPoint === i
              const showLabel = i % Math.ceil(chartData.length / 6) === 0 // Show fewer labels
              
              return (
                <g key={i} style={{ pointerEvents: 'none' }}>
                  {/* Point circle */}
                  <motion.circle
                    cx={xScale(i)}
                    cy={yScale(d.valence)}
                    r={isHovered ? 8 : d.dreamCount > 2 ? 5 : 4}
                    fill={d.nightmareRate > 0.5 ? '#ff5252' : config.color}
                    stroke="var(--background-elevated)"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.005, duration: 0.3 }}
                    style={{ 
                      filter: isHovered ? 'drop-shadow(0 0 10px rgba(176, 147, 255, 1))' : 'none',
                    }}
                  />
                  
                  {/* Time labels on x-axis */}
                  {showLabel && !d.isNewDay && (
                    <text
                      x={xScale(i)}
                      y={chartHeight - 28}
                      fill="var(--foreground-subtle)"
                      fontSize="10"
                      textAnchor="middle"
                      opacity="0.6"
                    >
                      {d.shortTime}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Tooltip - positioned above the chart */}
          <AnimatePresence>
            {hoveredPoint !== null && chartData[hoveredPoint] && (() => {
              const xPercent = (xScale(hoveredPoint) / chartWidth) * 100
              const isRightHalf = xPercent >= 50 // Switch at center
              
              let positionStyle: React.CSSProperties = {}
              
              if (isRightHalf) {
                // Position to the LEFT of the hover line
                positionStyle = {
                  right: `calc(${100 - xPercent}% + 10px)`
                }
              } else {
                // Position to the RIGHT of the hover line
                positionStyle = {
                  left: `calc(${xPercent}% + 10px)`
                }
              }
              
              // Debug logging
              if (typeof window !== 'undefined') {
                console.log(`[Tooltip] Position: ${xPercent.toFixed(1)}%, Side: ${isRightHalf ? 'left' : 'right'}`)
              }
              
              return (
                <motion.div
                  key={`tooltip-${hoveredPoint}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute pointer-events-none z-20"
                  style={{
                    ...positionStyle,
                    top: '10px',
                  }}
                >
                <div className="relative">
                  {/* Arrow indicator pointing to hover line */}
                  {isRightHalf ? (
                    // Arrow on the right side of tooltip pointing right to the hover line
                    <div 
                      className="absolute top-3 left-full w-0 h-0"
                      style={{
                        transform: 'translate(-1px, -50%)',
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderLeft: `8px solid ${config.color}`,
                        filter: `drop-shadow(2px 0 4px rgba(0,0,0,0.3))`
                      }}
                    />
                  ) : (
                    // Arrow on the left side of tooltip pointing left to the hover line
                    <div 
                      className="absolute top-3 right-full w-0 h-0"
                      style={{
                        transform: 'translate(1px, -50%)',
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderRight: `8px solid ${config.color}`,
                        filter: `drop-shadow(-2px 0 4px rgba(0,0,0,0.3))`
                      }}
                    />
                  )}
                  <div className="bg-[var(--background-elevated)] border-2 rounded-lg shadow-2xl p-3 min-w-[200px]"
                    style={{ 
                      borderColor: config.color,
                      boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px ${config.color}40`
                    }}
                  >
                    <div className="text-xs font-semibold mb-2 pb-2 border-b border-[var(--border)]" 
                    style={{ color: config.color }}
                  >
                    {chartData[hoveredPoint].timeLabel}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs text-[var(--foreground-muted)]">Sentiment</span>
                      <span className="text-lg font-bold" style={{ color: config.color }}>
                        {chartData[hoveredPoint].valence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs text-[var(--foreground-muted)]">Intensity</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {chartData[hoveredPoint].intensity.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs text-[var(--foreground-muted)]">Dreams</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {chartData[hoveredPoint].dreamCount}
                      </span>
                    </div>
                    {chartData[hoveredPoint].nightmareRate > 0 && (
                      <div className="flex justify-between items-center gap-4 pt-2 mt-2 border-t border-[var(--border)]">
                        <span className="text-xs text-red-400">⚠️ Nightmares</span>
                        <span className="text-sm font-bold text-red-400">
                          {(chartData[hoveredPoint].nightmareRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
            })()}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="px-6 pb-2 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 rounded" style={{ backgroundColor: config.color }} />
            <span className="text-[var(--foreground-subtle)]">Sentiment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: config.color, opacity: 0.5 }} />
            <span className="text-[var(--foreground-subtle)]">Intensity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[var(--foreground-subtle)]">Nightmare</span>
          </div>
        </div>
      </div>

      {/* Accessibility info */}
      <div className="sr-only" role="region" aria-label="Dream Weather Chart">
        The current dream weather is {config.label} with {((current.valence + 1) / 2 * 100).toFixed(0)}% 
        positive sentiment and {(current.intensity * 100).toFixed(0)}% emotional intensity. 
        The trend is {current.trend}. 
        {points.reduce((sum, p) => sum + p.dreamCount, 0)} dreams tracked over the past 72 hours.
      </div>
    </div>
  )
}

