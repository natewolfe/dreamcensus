'use client'

import { motion } from 'motion/react'

interface DreamWeatherChartProps {
  points: Array<{
    timestamp: string
    avgValence: number
    avgIntensity: number
    dreamCount: number
  }>
  current: {
    condition: 'stormy' | 'cloudy' | 'calm' | 'pleasant' | 'radiant'
    valence: number
    intensity: number
    trend: 'rising' | 'falling' | 'stable'
  }
}

const WEATHER_CONFIG = {
  stormy: { emoji: '⛈️', label: 'Stormy', color: '#ff5252', lightColor: '#ff8a80' },
  cloudy: { emoji: '☁️', label: 'Cloudy', color: '#9fa8da', lightColor: '#c5cae9' },
  calm: { emoji: '🌙', label: 'Calm', color: '#b093ff', lightColor: '#d4c4f9' },
  pleasant: { emoji: '✨', label: 'Pleasant', color: '#c4a2ff', lightColor: '#e1bee7' },
  radiant: { emoji: '🌟', label: 'Radiant', color: '#69f0ae', lightColor: '#b2ff59' },
}

export function SimpleDreamWeatherChart({ points, current }: DreamWeatherChartProps) {
  const config = WEATHER_CONFIG[current.condition]
  const trendIcon = current.trend === 'rising' ? '↗' : current.trend === 'falling' ? '↘' : '→'
  
  // Normalize valence to 0-100 for display
  const chartData = points.map(p => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: p.timestamp,
    valence: ((p.avgValence + 1) / 2) * 100, // -1 to 1 → 0 to 100
    intensity: p.avgIntensity * 100,
    dreamCount: p.dreamCount
  }))

  // Sample every nth point for display (max 24 points to avoid crowding)
  const sampleRate = Math.ceil(chartData.length / 24)
  const sampledData = chartData.filter((_, i) => i % sampleRate === 0)

  // Create SVG path for the area chart
  const width = 800
  const height = 200
  const padding = 40

  const xScale = (index: number) => padding + (index / (sampledData.length - 1)) * (width - 2 * padding)
  const yScale = (value: number) => height - padding - (value / 100) * (height - 2 * padding)

  const pathData = sampledData.map((d, i) => {
    const x = xScale(i)
    const y = yScale(d.valence)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  const areaPath = `${pathData} L ${xScale(sampledData.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`

  return (
    <div className="relative">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded z-10">
          {chartData.length} points • {current.condition}
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div 
            className="text-5xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {config.emoji}
          </motion.div>
          <div>
            <h3 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-family-display)' }}>
              {config.label}
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Collective dream sentiment {trendIcon}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-[var(--foreground-subtle)]">Intensity</div>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="w-2 h-6 rounded-full transition-all"
                style={{
                  backgroundColor: i <= Math.round(current.intensity * 5)
                    ? config.color
                    : 'var(--background-elevated)'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom SVG Chart */}
      <div className="h-64 bg-[var(--background-subtle)] rounded-xl p-4 border border-[var(--border)] overflow-hidden">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          <g opacity="0.2">
            {[0, 25, 50, 75, 100].map(value => (
              <line
                key={value}
                x1={padding}
                y1={yScale(value)}
                x2={width - padding}
                y2={yScale(value)}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* Area fill with gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Area */}
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          
          {/* Line */}
          <motion.path
            d={pathData}
            stroke={config.color}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Data points */}
          {sampledData.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScale(d.valence)}
                r="3"
                fill={config.color}
                className="hover:r-5 transition-all cursor-pointer"
              >
                <title>{`${d.time}: ${d.valence.toFixed(1)}% sentiment (${d.dreamCount} dreams)`}</title>
              </circle>
            </g>
          ))}

          {/* Y-axis label */}
          <text
            x={padding - 30}
            y={height / 2}
            transform={`rotate(-90 ${padding - 30} ${height / 2})`}
            fill="var(--foreground-subtle)"
            fontSize="12"
            textAnchor="middle"
          >
            Sentiment
          </text>

          {/* X-axis labels (first, middle, last) */}
          {[0, Math.floor(sampledData.length / 2), sampledData.length - 1].map(i => {
            if (i >= sampledData.length) return null
            return (
              <text
                key={i}
                x={xScale(i)}
                y={height - padding + 20}
                fill="var(--foreground-subtle)"
                fontSize="12"
                textAnchor="middle"
              >
                {sampledData[i].time}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-3 bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
          <div className="text-lg font-medium" style={{ color: config.color }}>
            {points.reduce((sum, p) => sum + p.dreamCount, 0)}
          </div>
          <div className="text-xs text-[var(--foreground-subtle)]">Dreams tracked</div>
        </div>
        <div className="p-3 bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
          <div className="text-lg font-medium">
            {((current.valence + 1) / 2 * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-[var(--foreground-subtle)]">Positivity index</div>
        </div>
        <div className="p-3 bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
          <div className="text-lg font-medium">
            {(current.intensity * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-[var(--foreground-subtle)]">Avg intensity</div>
        </div>
      </div>
    </div>
  )
}

