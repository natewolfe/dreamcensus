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
          <Card padding="lg">
            <WeatherChartSkeleton />
          </Card>
        </div>

        <div>
          <Card padding="lg">
            <WeatherChartSkeleton />
          </Card>
        </div>
      </div>
    </div>
  )
}

