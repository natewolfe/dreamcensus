import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui'
import { WeatherChartSkeleton } from '@/components/ui'

export default function WeatherLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Dream Weather"
        subtitle="Patterns in your dreams and the collective"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Your Patterns
          </h2>
          <Card padding="lg">
            <WeatherChartSkeleton />
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Collective Patterns
          </h2>
          <Card padding="lg">
            <WeatherChartSkeleton />
          </Card>
        </div>
      </div>
    </div>
  )
}

