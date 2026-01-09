'use client'

import { Card } from '@/components/ui'
import { EmotionChart } from './EmotionChart'
import type { CollectiveWeatherData } from '@/lib/weather/types'

interface CollectiveWeatherProps {
  data: CollectiveWeatherData | null
}

export function CollectiveWeather({ data }: CollectiveWeatherProps) {
  if (!data) {
    return (
      <Card padding="lg">
        <div className="text-center py-8">
          <div className="mb-3 text-4xl">🌍</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Collective Weather
          </h3>
          <p className="text-sm text-muted">
            Not enough data yet. Dreams from 50+ dreamers create the collective weather.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          Collective Weather
        </h3>
        <p className="text-sm text-muted">
          Patterns from {data.sampleSize.toLocaleString()} dreamers
        </p>
      </div>

      {/* Emotion Distribution */}
      <Card padding="lg">
        <EmotionChart
          data={data.emotions.slice(0, 8)}
          period={`Last ${data.timeRange === '7d' ? '7 days' : data.timeRange === '30d' ? '30 days' : '90 days'}`}
          showLegend={false}
        />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md">
          <div className="text-center">
            <div className="text-xl font-bold text-accent">
              {Math.round(data.avgVividness)}
            </div>
            <div className="text-xs text-muted mt-1">
              Avg Vividness
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="text-center">
            <div className="text-xl font-bold text-accent">
              {Math.round(data.lucidPercentage)}%
            </div>
            <div className="text-xs text-muted mt-1">
              Lucid Dreams
            </div>
          </div>
        </Card>
      </div>

      {/* Privacy note */}
      <div className="text-xs text-muted text-center">
        <p>
          Aggregated with differential privacy · Minimum {data.sampleSize} dreamers
        </p>
        <p className="mt-1">
          Last updated: {data.updatedAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

