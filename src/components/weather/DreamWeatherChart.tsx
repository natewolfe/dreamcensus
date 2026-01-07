'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import type React from 'react'
import { Card } from '@/components/ui'
import type { DreamWeatherPoint, DreamWeatherCurrent, TimeRange, WeatherCondition } from '@/lib/weather/types'

interface DreamWeatherChartProps {
  points: DreamWeatherPoint[]
  current: DreamWeatherCurrent
  totalDreams: number
  timeRange: TimeRange
  variant?: 'full' | 'embedded'
}

const TIMERANGE_LABELS: Record<TimeRange, string> = {
  '1d': '1 day',
  '3d': '3 days',
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
}

interface WeatherConfig {
  emoji: string
  label: string
  cssVar: string
  description: string
  bgGradient: string
}

const WEATHER_CONFIG: Record<WeatherCondition, WeatherConfig> = {
  stormy: { 
    emoji: '⛈️', 
    label: 'Stormy', 
    cssVar: 'var(--weather-stormy)',
    description: 'High anxiety and negative emotions',
    bgGradient: 'from-red-500/20 to-red-900/5'
  },
  cloudy: { 
    emoji: '☁️', 
    label: 'Cloudy', 
    cssVar: 'var(--weather-cloudy)',
    description: 'Mixed emotions with slight tension',
    bgGradient: 'from-indigo-400/20 to-indigo-900/5'
  },
  calm: { 
    emoji: '🌙', 
    label: 'Calm', 
    cssVar: 'var(--weather-calm)',
    description: 'Peaceful and balanced dream state',
    bgGradient: 'from-purple-400/20 to-purple-900/5'
  },
  pleasant: { 
    emoji: '✨', 
    label: 'Pleasant', 
    cssVar: 'var(--weather-pleasant)',
    description: 'Positive emotions and comfort',
    bgGradient: 'from-purple-300/20 to-purple-800/5'
  },
  radiant: { 
    emoji: '🌟', 
    label: 'Radiant', 
    cssVar: 'var(--weather-radiant)',
    description: 'Joyful and highly positive dreams',
    bgGradient: 'from-green-400/20 to-green-900/5'
  },
}

export function DreamWeatherChart({ points, current, totalDreams, timeRange, variant = 'full' }: DreamWeatherChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const config = WEATHER_CONFIG[current.condition]
  const timespanLabel = TIMERANGE_LABELS[timeRange]
  
  // Determine if we're using daily buckets (vs hourly/4-hour)
  const isDailyBuckets = timeRange === '30d' || timeRange === '90d'
  
  // Normalize data
  const chartData = points.map((p, i) => {
    const currentDate = new Date(p.timestamp)
    const prevPoint = i > 0 ? points[i - 1] : null
    const prevDate = prevPoint ? new Date(prevPoint.timestamp) : null
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
      lucidRate: p.lucidRate,
      recurringRate: p.recurringRate,
      rawValence: p.avgValence,
      isNewDay
    }
  })

  // Chart dimensions (absolute pixels for SVG viewBox)
  const chartWidth = 1000
  const chartHeight = variant === 'embedded' ? 180 : 300
  // Extra top padding when time markers are shown
  const hasTimeMarkers = ['3d', '7d', '30d', '90d'].includes(timeRange)
  const paddingTop = hasTimeMarkers && variant !== 'embedded' ? 32 : 20
  const paddingBottom = 45
  const paddingLeft = 10
  const paddingRight = 10

  // Scales
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
  const trendIcon = current.trend === 'rising' ? '↗' : current.trend === 'falling' ? '↘' : '→'

  // Calculate max dream count for bar chart scaling
  const maxDreamCount = Math.max(...chartData.map(d => d.dreamCount))

  // Calculate time reference markers (vertical dividing lines)
  // These show boundaries like "1 day ago", "30 days ago", "90 days ago"
  const getTimeMarkers = () => {
    if (chartData.length < 2) return []
    
    const now = Date.now()
    const markers: { label: string; position: number | null }[] = []
    
    // Define which markers to show based on time range
    const markerConfigs: { days: number; label: string; showFor: TimeRange[] }[] = [
      { days: 1, label: '1d', showFor: ['3d', '7d', '30d', '90d'] },
      { days: 30, label: '30d', showFor: ['90d'] },
    ]
    
    for (const config of markerConfigs) {
      if (!config.showFor.includes(timeRange)) continue
      
      const targetTime = now - config.days * 24 * 60 * 60 * 1000
      
      // Find the data point index closest to this time
      let closestIdx = -1
      let closestDiff = Infinity
      
      for (let i = 0; i < chartData.length; i++) {
        const dataPoint = chartData[i]
        if (!dataPoint) continue
        const pointTime = dataPoint.time.getTime()
        const diff = Math.abs(pointTime - targetTime)
        if (diff < closestDiff) {
          closestDiff = diff
          closestIdx = i
        }
      }
      
      // Only show marker if it's within reasonable range of actual data
      const point = chartData[closestIdx]
      if (closestIdx >= 0 && closestIdx < chartData.length - 1 && point) {
        // Interpolate position between data points for smooth placement
        const pointTime = point.time.getTime()
        
        // Calculate exact x position using interpolation
        let xPos: number
        if (pointTime === targetTime) {
          xPos = xScale(closestIdx)
        } else if (pointTime < targetTime && closestIdx < chartData.length - 1) {
          const nextPoint = chartData[closestIdx + 1]
          if (nextPoint) {
            const nextTime = nextPoint.time.getTime()
            const ratio = (targetTime - pointTime) / (nextTime - pointTime)
            xPos = xScale(closestIdx) + ratio * (xScale(closestIdx + 1) - xScale(closestIdx))
          } else {
            xPos = xScale(closestIdx)
          }
        } else if (pointTime > targetTime && closestIdx > 0) {
          const prevPoint = chartData[closestIdx - 1]
          if (prevPoint) {
            const prevTime = prevPoint.time.getTime()
            const ratio = (targetTime - prevTime) / (pointTime - prevTime)
            xPos = xScale(closestIdx - 1) + ratio * (xScale(closestIdx) - xScale(closestIdx - 1))
          } else {
            xPos = xScale(closestIdx)
          }
        } else {
          xPos = xScale(closestIdx)
        }
        
        markers.push({ label: config.label, position: xPos })
      }
    }
    
    return markers
  }
  
  const timeMarkers = getTimeMarkers()

  // Determine node color based on statistically significant dream types
  const getNodeColor = (point: typeof chartData[0]) => {
    // Priority-based color system for statistical significance
    if (point.nightmareRate > 0.3) return 'var(--weather-stormy)'      // Red - nightmares
    if (point.lucidRate > 0.25) return 'var(--weather-radiant)'        // Green - lucid
    if (point.recurringRate > 0.2) return 'var(--accent)'              // Purple - recurring
    return config.cssVar                                                 // Default weather color
  }

  const WrapperComponent = variant === 'embedded' ? 'div' : Card
  const wrapperProps = variant === 'embedded' 
    ? { className: "relative" } 
    : { padding: "lg" as const, className: "p-3 pt-3 md:pt-4" }

  return (
    <WrapperComponent {...wrapperProps}>
      <div className="relative">

        {/* Header Section */}
        {variant !== 'embedded' && (
        <div className="mb-4">
          <div className="flex items-stretch justify-between gap-4">
            {/* Left: Emoji and Label */}
            <div className="flex items-center justify-start gap-2 md:gap-4">
              <motion.div 
                className="text-4xl md:text-5xl"
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
              <div className="flex flex-col gap-1">
                <div className="flex items-start md:items-center justify-start flex-col md:flex-row gap-0 md:gap-2">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {config.label}
                  </h3>
                  <div className="text-xs text-muted flex items-start md:items-center justify-center gap-1 mt-1">
                    <span className="capitalize">{current.trend}</span>
                    <span className="font-medium">
                      {trendIcon}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted/60 max-w-md mb-0 pb-0 hidden md:block">
                  {config.description}
                </span>
              </div>
            </div>
            
            {/* Right: Stats Row */}
            <div className="flex items-stretch w-[55%] gap-0 md:gap-2">
              {/* Intensity */}
              <div className="flex flex-col flex-1 justify-end text-center px-3 py-2 border-l md:border md:rounded-lg border-border/50">
                <div className="text-xs text-muted tracking-wider mb-1">
                  Avg. Intensity
                </div>
                <div className="text-xl md:text-2xl font-semibold text-foreground">
                  {(current.intensity * 100).toFixed(0)}%
                </div>
              </div>

              {/* Sentiment */}
              <div className="flex flex-col flex-1 justify-end text-center px-3 py-2 border-l md:border md:rounded-lg border-border/50">
                <div className="text-xs text-muted mb-1">
                  Avg. Sentiment
                </div>
                <div className="text-xl md:text-2xl font-semibold text-foreground">
                  {((current.valence + 1) / 2 * 100).toFixed(0)}%
                </div>
              </div>

              {/* Dreams Tracked */}
              <div className="flex flex-col flex-1 justify-end text-center px-3 py-2 border-l md:border md:rounded-lg border-border/50">
                <div className="text-xs text-muted mb-1">Tracked</div>
                <div className="text-xl md:text-2xl font-semibold text-foreground">{totalDreams}</div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Main Chart */}
        <div 
          className={variant === 'embedded' ? 'relative' : 'relative rounded-lg'}
          style={{ 
            background: 'linear-gradient(to bottom, var(--subtle/30), var(--card-bg))',
          }}
        >
          {/* Chart Container */}
          <div className="relative px-6 pt-4 pb-2" style={{ aspectRatio: `${chartWidth} / ${chartHeight}` }}>
            <svg 
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config.cssVar} stopOpacity="0.4" />
                  <stop offset="50%" stopColor={config.cssVar} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={config.cssVar} stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={config.cssVar} stopOpacity="0.6" />
                  <stop offset="50%" stopColor={config.cssVar} stopOpacity="1" />
                  <stop offset="100%" stopColor={config.cssVar} stopOpacity="0.6" />
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
                  opacity="0"
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

              {/* Background bar chart (dream volume) */}
              {chartData.map((d, i) => {
                const x = xScale(i)
                const barWidth = (chartWidth - paddingLeft - paddingRight) / chartData.length * 0.7
                const barHeight = (d.dreamCount / maxDreamCount) * (chartHeight - paddingTop - paddingBottom)
                const barY = yScale(0) - barHeight
                
                return (
                  <rect
                    key={`bar-${i}`}
                    x={x - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={config.cssVar}
                    opacity="0.05"
                    rx="2"
                  />
                )
              })}
              {/* Area fill */}
              <motion.path
                d={areaPath}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              />

              {/* Time range markers (30d, 90d dividers) */}
              {timeMarkers.map((marker) => {
                if (marker.position === null) return null
                
                return (
                  <g key={`marker-${marker.label}`}>
                    <line
                      x1={marker.position}
                      y1={paddingTop}
                      x2={marker.position}
                      y2={yScale(0)}
                      stroke="var(--muted)"
                      strokeWidth="1.5"
                      strokeDasharray="8 4"
                      opacity="0.4"
                    />
                    <text
                      x={marker.position}
                      y={paddingTop - 6}
                      fill="var(--muted)"
                      fontSize="9"
                      fontWeight="500"
                      textAnchor="middle"
                      opacity="0.7"
                    >
                      {marker.label}
                    </text>
                  </g>
                )
              })}

              {/* Date change markers (only show for hourly/4-hour buckets) */}
              {!isDailyBuckets && chartData.map((d, i) => {
                if (!d.isNewDay) return null
                const x = xScale(i)
                
                return (
                  <g key={`date-${i}`}>
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
                stroke={config.cssVar}
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

              {/* Hover areas */}
              {variant !== 'embedded' && chartData.map((_, i) => {
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
                    stroke={config.cssVar}
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
                const showLabel = i % Math.ceil(chartData.length / 6) === 0
                const nodeColor = getNodeColor(d)
                
                return (
                  <g key={i} style={{ pointerEvents: 'none' }}>
                    <circle
                      cx={xScale(i)}
                      cy={yScale(d.valence)}
                      r={isHovered ? 8 : d.dreamCount > 5 ? 7 : d.dreamCount > 2 ? 5 : 3}
                      fill={nodeColor}
                      stroke={`var(--card-bg)`}
                      strokeWidth={isHovered ? 3 : 2}
                      strokeOpacity={1}
                      style={{ 
                        filter: isHovered ? `drop-shadow(0 0 10px ${nodeColor})` : 'none',
                      }}
                    />
                    
                    {/* Adaptive labels: show dates for daily buckets, times for hourly buckets */}
                    {showLabel && (
                      <text
                        x={xScale(i)}
                        y={chartHeight - 28}
                        fill={isDailyBuckets ? "var(--accent)" : "var(--subtle)"}
                        fontSize="10"
                        fontWeight={isDailyBuckets ? "600" : "400"}
                        textAnchor="middle"
                        opacity={isDailyBuckets ? "0.8" : "0.6"}
                      >
                        {isDailyBuckets ? d.dateLabel : (!d.isNewDay && d.shortTime)}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Tooltip */}
            {variant !== 'embedded' && (
            <AnimatePresence>
              {hoveredPoint !== null && chartData[hoveredPoint] && (() => {
                const xPercent = (xScale(hoveredPoint) / chartWidth) * 100
                const isRightHalf = xPercent >= 50
                
                let positionStyle: React.CSSProperties = {}
                
                if (isRightHalf) {
                  positionStyle = {
                    right: `calc(${100 - xPercent}% + 10px)`
                  }
                } else {
                  positionStyle = {
                    left: `calc(${xPercent}% + 10px)`
                  }
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
                      top: '20px',
                    }}
                  >
                    <div className="relative">
                      {isRightHalf ? (
                        <div 
                          className="absolute top-4 left-full w-0 h-0"
                          style={{
                            transform: 'translate(-1px, -50%)',
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent',
                            borderLeft: `8px solid ${config.cssVar}`,
                            filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.3))'
                          }}
                        />
                      ) : (
                        <div 
                          className="absolute top-4 right-full w-0 h-0"
                          style={{
                            transform: 'translate(1px, -50%)',
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent',
                            borderRight: `8px solid ${config.cssVar}`,
                            filter: 'drop-shadow(-2px 0 4px rgba(0,0,0,0.3))'
                          }}
                        />
                      )}
                      <div 
                        className="bg-card-bg border-2 rounded-lg shadow-2xl p-3 min-w-[200px]"
                        style={{ 
                          borderColor: config.cssVar,
                          boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px ${config.cssVar}40`
                        }}
                      >
                        <div 
                          className="text-xs font-semibold mb-2 pb-2 border-b border-border" 
                          style={{ color: config.cssVar }}
                        >
                          {chartData[hoveredPoint].timeLabel}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-xs text-muted">Sentiment</span>
                            <span className="text-lg font-bold" style={{ color: config.cssVar }}>
                              {chartData[hoveredPoint].valence.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-xs text-muted">Intensity</span>
                            <span className="text-sm font-semibold text-foreground">
                              {chartData[hoveredPoint].intensity.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-xs text-muted">Dreams</span>
                            <span className="text-sm font-semibold text-foreground">
                              {chartData[hoveredPoint].dreamCount}
                            </span>
                          </div>
                          {(chartData[hoveredPoint].nightmareRate > 0 || 
                            chartData[hoveredPoint].lucidRate > 0 || 
                            chartData[hoveredPoint].recurringRate > 0) && (
                            <div className="pt-2 mt-2 border-t border-border space-y-1">
                              {chartData[hoveredPoint].nightmareRate > 0 && (
                                <div className="flex justify-between items-center gap-4">
                                  <span className="text-xs" style={{ color: 'var(--weather-stormy)' }}>⚠️ Nightmares</span>
                                  <span className="text-sm font-bold" style={{ color: 'var(--weather-stormy)' }}>
                                    {(chartData[hoveredPoint].nightmareRate * 100).toFixed(0)}%
                                  </span>
                                </div>
                              )}
                              {chartData[hoveredPoint].lucidRate > 0 && (
                                <div className="flex justify-between items-center gap-4">
                                  <span className="text-xs" style={{ color: 'var(--weather-radiant)' }}>✨ Lucid</span>
                                  <span className="text-sm font-bold" style={{ color: 'var(--weather-radiant)' }}>
                                    {(chartData[hoveredPoint].lucidRate * 100).toFixed(0)}%
                                  </span>
                                </div>
                              )}
                              {chartData[hoveredPoint].recurringRate > 0 && (
                                <div className="flex justify-between items-center gap-4">
                                  <span className="text-xs" style={{ color: 'var(--accent)' }}>🔄 Recurring</span>
                                  <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                                    {(chartData[hoveredPoint].recurringRate * 100).toFixed(0)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>
            )}
          </div>

          {/* Legend */}
          <div className={variant === 'embedded' ? 'px-6 pt-3 pb-2 flex flex-wrap items-center justify-center gap-4 text-xs border-t border-border/50' : 'px-6 pb-2 flex flex-wrap items-center justify-center gap-4 text-xs'}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 rounded" style={{ backgroundColor: config.cssVar }} />
              <span className="text-subtle">Sentiment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: config.cssVar, opacity: 0.5 }} />
              <span className="text-subtle">Intensity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--weather-stormy)' }} />
              <span className="text-subtle">Nightmare</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--weather-radiant)' }} />
              <span className="text-subtle">Lucid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="text-subtle">Recurring</span>
            </div>
          </div>
        </div>

        {/* Accessibility info */}
        <div className="sr-only" role="region" aria-label="Dream Weather Chart">
          The current dream weather is {config.label} with {((current.valence + 1) / 2 * 100).toFixed(0)}% 
          positive sentiment and {(current.intensity * 100).toFixed(0)}% emotional intensity. 
          The trend is {current.trend}. 
          {totalDreams} dreams tracked over the past {timespanLabel}.
        </div>
      </div>
    </WrapperComponent>
  )
}

