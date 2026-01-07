'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui'
import { EmotionChart } from './EmotionChart'
import { SymbolCloud } from './SymbolCloud'
import { MethodCard } from './MethodCard'
import type { PersonalWeatherData } from '@/lib/weather/types'

interface PersonalWeatherProps {
  data: PersonalWeatherData
}

export function PersonalWeather({ data }: PersonalWeatherProps) {
  const router = useRouter()
  const [showMethodCard, setShowMethodCard] = useState(false)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {data.dreamCount}
            </div>
            <div className="text-xs text-muted mt-1">
              Dreams
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {data.captureStreak}
            </div>
            <div className="text-xs text-muted mt-1">
              Day Streak
            </div>
          </div>
        </Card>

        {data.avgVividness !== undefined && (
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(data.avgVividness)}
              </div>
              <div className="text-xs text-muted mt-1">
                Avg Vividness
              </div>
            </div>
          </Card>
        )}

        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {Math.round(data.lucidPercentage)}%
            </div>
            <div className="text-xs text-muted mt-1">
              Lucid
            </div>
          </div>
        </Card>
      </div>

      {/* Emotion Distribution */}
      <Card padding="lg">
        <EmotionChart
          data={data.emotions.slice(0, 8)}
          period={`Last ${data.timeRange === '7d' ? '7 days' : data.timeRange === '30d' ? '30 days' : '90 days'}`}
          onMethodClick={() => setShowMethodCard(true)}
        />
      </Card>

      {/* Symbol Cloud */}
      {data.symbols.length > 0 && (
        <Card padding="lg">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Recurring Symbols
            </h3>
            <SymbolCloud
              data={data.symbols.slice(0, 20)}
              onSymbolClick={(symbol) => {
                // Navigate to journal filtered by symbol
                router.push(`/journal?tag=${encodeURIComponent(symbol)}`)
              }}
            />
          </div>
        </Card>
      )}

      {/* Method Card Modal */}
      <MethodCard
        isOpen={showMethodCard}
        onClose={() => setShowMethodCard(false)}
        title="How 'Your Emotions' is calculated"
        description="This chart shows the distribution of emotions in your dreams over the selected time period."
        calculation="We count each emotion tag associated with your dreams and calculate the percentage of the total."
        dataSources={[
          'Your manually-selected emotions during capture',
          'AI-extracted emotions (if Insights tier enabled)',
        ]}
        privacySafeguards={[
          'This data never leaves your account',
          'Not shared unless you enable Research Commons tier',
        ]}
        limitations={[
          'AI extraction may miss nuanced emotions',
          'Your manual selections are always prioritized',
        ]}
        version="1.0"
      />
    </div>
  )
}

