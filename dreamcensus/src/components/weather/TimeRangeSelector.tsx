'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { TimeRange } from '@/lib/weather/types'

interface TimeRangeSelectorProps {
  currentRange: TimeRange
}

const TIMERANGE_LABELS: Record<TimeRange, { short: string; long: string }> = {
  '1d': { short: '1d', long: '1 day' },
  '3d': { short: '3d', long: '3 days' },
  '7d': { short: '7d', long: '7 days' },
  '30d': { short: '30d', long: '30 days' },
  '90d': { short: '90d', long: '90 days' },
}

export function TimeRangeSelector({ currentRange }: TimeRangeSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleRangeChange = (range: TimeRange) => {
    router.push(`${pathname}?range=${range}`)
  }

  return (
    <div className="flex items-center gap-1 md:gap-1.5">
      <svg className="hidden h-6 w-6 md:h-7 md:w-7 text-muted opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {(['1d', '3d', '7d', '30d', '90d'] as const).map((range) => (
        <button
          key={range}
          onClick={() => handleRangeChange(range)}
          className={`rounded-sm px-3 md:px-4 py-2 md:py-3 text-sm md:text-md font-medium transition-all ${
            currentRange === range
              ? 'bg-muted/20 border border-muted text-foreground'
              : 'bg-card-bg/30 border border-border/70 text-muted hover:text-foreground hover:bg-subtle/15 cursor-pointer'
          }`}
        >
          <span>{TIMERANGE_LABELS[range].short}</span>
          <span className="hidden">{TIMERANGE_LABELS[range].long}</span>
        </button>
      ))}
    </div>
  )
}
