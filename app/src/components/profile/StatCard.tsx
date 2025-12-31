import { ComparisonBadge } from './ComparisonBadge'

interface StatCardProps {
  icon: string
  value: string | number
  label: string
  sublabel?: string
  comparisonValue?: number  // User's percentile (0-100)
  comparisonLabel?: string  // e.g., "vs average"
}

export function StatCard({
  icon,
  value,
  label,
  sublabel,
  comparisonValue,
  comparisonLabel,
}: StatCardProps) {
  return (
    <div className="p-6 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)]">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-3xl font-bold text-[var(--accent)]">
          {value}
        </div>
        {comparisonValue !== undefined && (
          <ComparisonBadge 
            percentile={comparisonValue}
            label={comparisonLabel}
          />
        )}
      </div>
      <div className="text-sm text-[var(--foreground-muted)]">{label}</div>
      {sublabel && (
        <div className="text-xs text-[var(--foreground-subtle)] mt-2">
          {sublabel}
        </div>
      )}
    </div>
  )
}

