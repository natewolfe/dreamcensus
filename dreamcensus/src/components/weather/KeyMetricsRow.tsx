import { Card } from '@/components/ui'

export interface KeyMetric {
  label: string
  value: string | number
  suffix?: string  // e.g., "%"
}

interface KeyMetricsRowProps {
  metrics: KeyMetric[]
}

export function KeyMetricsRow({ metrics }: KeyMetricsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric) => (
        <Card key={metric.label} padding="md">
          <div className="text-center">
            <div className="text-4xl font-regular text-foreground">
              {metric.value}{metric.suffix}
            </div>
            <div className="text-sm text-muted mt-1">{metric.label}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}

