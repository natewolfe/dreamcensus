interface ComparisonBadgeProps {
  percentile: number  // 0-100
  label?: string
}

export function ComparisonBadge({ percentile, label = 'vs avg' }: ComparisonBadgeProps) {
  const isAboveAverage = percentile > 50
  const difference = Math.abs(percentile - 50)

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
      ${isAboveAverage
        ? 'bg-[var(--success)]/10 text-[var(--success)]'
        : 'bg-[var(--foreground-subtle)]/10 text-[var(--foreground-subtle)]'
      }
    `}>
      {isAboveAverage ? '↑' : '↓'} {label}
    </span>
  )
}

