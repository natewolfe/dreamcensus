'use client'

import { Card } from '@/components/ui'

interface ProfileStatsProps {
  totalDreams: number
  journalStreak: number
  lucidPercentage: number
  censusProgress: number
}

export function ProfileStats({
  totalDreams,
  journalStreak,
  lucidPercentage,
  censusProgress,
}: ProfileStatsProps) {
  const stats = [
    { label: 'Dreams Captured', value: totalDreams.toLocaleString() },
    { label: 'Longest Streak', value: journalStreak, suffix: ' days' },
    { label: 'Lucid Rate', value: lucidPercentage, suffix: '%' },
    { label: 'Census Completion', value: censusProgress, suffix: '%' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => (
        <Card key={stat.label} padding="md" variant="outlined">
          <div className="flex flex-col h-full items-center justify-center gap-1 pb-1 text-center">
            <div className="text-xl md:text-2xl font-medium text-foreground">
              {stat.value}{stat.suffix}
            </div>
            <div className="text-[10px] md:text-xs text-muted mt-1">{stat.label}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
