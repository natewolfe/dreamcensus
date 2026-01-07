'use client'

import { useState } from 'react'
import { Card } from '@/components/ui'
import { EmotionChart } from './EmotionChart'
import { MethodCard } from './MethodCard'
import type { EmotionDistribution } from '@/lib/weather/types'

interface CollectiveEmotionsProps {
  data: EmotionDistribution[]
  period: string
  sampleSize: number
}

export function CollectiveEmotions({ data, period, sampleSize }: CollectiveEmotionsProps) {
  const [showMethodCard, setShowMethodCard] = useState(false)

  const periodLabel =
    period === '7d' ? '7 days' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : period

  return (
    <>
      <Card padding="lg">
        <EmotionChart
          data={data}
          period={periodLabel}
          title="Our Emotions"
          subtitle={`From ${sampleSize.toLocaleString()} dreamers in last ${periodLabel}`}
          onMethodClick={() => setShowMethodCard(true)}
        />
      </Card>

      <MethodCard
        isOpen={showMethodCard}
        onClose={() => setShowMethodCard(false)}
        title="How 'Our Emotions' is calculated"
        description="Aggregated emotion distribution from dreams shared to the Research Commons."
        calculation="We count each emotion tag across all shared dreams and calculate the percentage of the total."
        dataSources={[
          'Dreams from users who granted Research Commons consent',
          'Emotion tags selected during dream capture',
        ]}
        privacySafeguards={[
          'Aggregated with differential privacy',
          `Minimum ${sampleSize} dreamers required`,
          'Individual dreams are never identifiable',
        ]}
        limitations={[
          'Only includes dreams explicitly shared to commons',
          'Emotion selection varies by user awareness',
        ]}
        version="1.0"
      />
    </>
  )
}

