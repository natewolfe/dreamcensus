import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui'
import { PersonalWeather, CollectiveWeather } from '@/components/weather'
import { TimeRangeSelector } from '@/components/weather/TimeRangeSelector'
import { getPersonalWeather, getCollectiveWeather } from './actions'

type TimeRange = '7d' | '30d' | '90d'

interface WeatherPageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function WeatherPage({ searchParams }: WeatherPageProps) {
  const params = await searchParams
  const timeRange = (['7d', '30d', '90d'].includes(params.range ?? '')
    ? params.range
    : '30d') as TimeRange

  const [personalResult, collectiveResult] = await Promise.all([
    getPersonalWeather(timeRange),
    getCollectiveWeather(timeRange),
  ])

  const personalWeather = personalResult.success ? personalResult.data : null
  const collectiveWeather = collectiveResult.success ? collectiveResult.data : null

  return (
    <div id="main-content" className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Dream Weather"
        subtitle="Patterns in your dreams and the collective"
      />

      {/* Time Range Selector */}
      <TimeRangeSelector currentRange={timeRange} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Weather */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Your Patterns
          </h2>
          {personalWeather && personalWeather.dreamCount > 0 ? (
            <PersonalWeather data={personalWeather} />
          ) : (
            <Card padding="lg">
              <div className="text-center py-8 text-muted">
                <div className="mb-3 text-4xl">📊</div>
                <p className="text-sm">
                  Capture more dreams to see your patterns
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Collective Weather */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Collective Patterns
          </h2>
          <CollectiveWeather data={collectiveWeather} />
        </div>
      </div>
    </div>
  )
}
