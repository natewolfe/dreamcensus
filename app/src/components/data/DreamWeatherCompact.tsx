'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Card } from '@/components/ui'

interface DreamWeatherCompactProps {
  stats: {
    totalDreams: number
    averageClarity: number
    lucidRate: number
    nightmareRate: number
    topSymbols: Array<{ symbol: string; count: number }>
    emotionalIntensity: number // 0-1 scale
  }
}

export function DreamWeatherCompact({ stats }: DreamWeatherCompactProps) {
  // Determine weather based on emotional intensity
  const getWeatherEmoji = (intensity: number) => {
    if (intensity < 0.3) return '☀️'
    if (intensity < 0.5) return '⛅'
    if (intensity < 0.7) return '🌧️'
    return '⛈️'
  }

  const getWeatherLabel = (intensity: number) => {
    if (intensity < 0.3) return 'Calm'
    if (intensity < 0.5) return 'Mild'
    if (intensity < 0.7) return 'Active'
    return 'Stormy'
  }

  const weatherEmoji = getWeatherEmoji(stats.emotionalIntensity)
  const weatherLabel = getWeatherLabel(stats.emotionalIntensity)

  return (
    <Link href="/explore">
      <Card 
        className="hover:border-[var(--accent)] transition-all cursor-pointer overflow-hidden mb-6"
        variant="elevated"
      >
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Dream Weather
              </h3>
              <div className="text-5xl">{weatherEmoji}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[var(--accent)]">
                {weatherLabel}
              </div>
              <div className="text-xs text-[var(--foreground-subtle)]">
                Today
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-[var(--border)]">
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {stats.totalDreams.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Dreams</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {stats.averageClarity.toFixed(1)}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Avg Clarity</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {(stats.lucidRate * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Lucid</div>
            </div>
          </div>

          {/* Trending Symbols */}
          {stats.topSymbols.length > 0 && (
            <div>
              <div className="text-xs text-[var(--foreground-muted)] mb-2">
                Trending symbols:
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.topSymbols.slice(0, 3).map((symbol, idx) => (
                  <motion.div
                    key={symbol.symbol}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="px-2 py-1 bg-[var(--background-subtle)] rounded-full text-xs"
                  >
                    {symbol.symbol}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Explore link hint */}
          <div className="text-xs text-[var(--accent)] mt-4 flex items-center gap-1">
            Explore collective data →
          </div>
        </div>
      </Card>
    </Link>
  )
}

