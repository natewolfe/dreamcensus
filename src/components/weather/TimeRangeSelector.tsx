'use client'

import { useRouter, usePathname } from 'next/navigation'

type TimeRange = '7d' | '30d' | '90d'

interface TimeRangeSelectorProps {
  currentRange: TimeRange
}

export function TimeRangeSelector({ currentRange }: TimeRangeSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleRangeChange = (range: TimeRange) => {
    router.push(`${pathname}?range=${range}`)
  }

  return (
    <div className="flex gap-2 mb-6">
      {(['7d', '30d', '90d'] as const).map((range) => (
        <button
          key={range}
          onClick={() => handleRangeChange(range)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            currentRange === range
              ? 'bg-accent text-white'
              : 'bg-card-bg border border-border text-muted hover:text-foreground'
          }`}
        >
          {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
        </button>
      ))}
    </div>
  )
}

