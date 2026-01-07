import { Button, Card } from '@/components/ui'
import {
  DreamWeatherChart,
  CollectiveEmotions,
  CommunityPulse,
  TrendingSymbols,
  TimeRangeSelector,
  DismissibleLearnCard,
} from '@/components/weather'
import { LearnCard } from '@/components/school'
import type { DreamSchoolTopic } from '@/components/school'
import { getCollectiveWeather, getWeatherChart } from './actions'
import type { TimeRange } from '@/lib/weather/types'

// Learn topics for contextual education on this page
const COLLECTIVE_UNCONSCIOUS_TOPIC: DreamSchoolTopic = {
  id: 'collective-unconscious',
  title: 'The Collective Unconscious',
  subtitle: 'Shared patterns across all dreamers',
  icon: '🌐',
  color: 'from-indigo-500/20 to-violet-600/10',
  href: '/learn/collective-unconscious',
}

const OUR_MISSION_TOPIC: DreamSchoolTopic = {
  id: 'our-mission',
  title: 'Our Mission',
  subtitle: 'Why we study dreams together',
  icon: '🔭',
  color: 'from-teal-500/20 to-cyan-600/10',
  href: '/learn/our-mission',
}

interface WeatherPageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function WeatherPage({ searchParams }: WeatherPageProps) {
  const params = await searchParams
  const timeRange = (['1d', '3d', '7d', '30d', '90d'].includes(params.range ?? '')
    ? params.range
    : '7d') as TimeRange

  const [collectiveResult, chartResult] = await Promise.all([
    getCollectiveWeather(timeRange),
    getWeatherChart(timeRange),
  ])

  const collective = collectiveResult.success ? collectiveResult.data : null
  const chartData = chartResult.success ? chartResult.data : null

  return (
    <div id="main-content" className="container mx-auto max-w-6xl px-4 md:px-6 py-8 pb-16">

      <div className="flex items-end justify-between mb-8 md:mb-6">

        {/* Data Source Selector */}
        <div className="flex items-center flex gap-2">
          <div>
            <Button variant="secondary" className="py-3 md:py-5 px-3 md:px-4 text-lg md:text-xl rounded-sm border border-border/0 hover:bg-subtle">
              <span>Collective</span>
            </Button>
          </div>
          <div>
            <Button variant="secondary" className="py-3 md:py-5 px-3 md:px-4 text-lg md:text-xl rounded-sm bg-card-bg/30 border border-border/70 text-muted hover:text-foreground hover:bg-subtle/15">
              <span>Personal</span>
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <TimeRangeSelector currentRange={timeRange} />

      </div>

      {/* Hero: Dream Weather Chart */}
      {/* Require 6+ points for longer ranges, but allow 1+ for 1d view */}
      {chartData && chartData.points.length >= (timeRange === '1d' ? 1 : 6) && (
        <section className="mb-8">
          <DreamWeatherChart
            points={chartData.points}
            current={chartData.current}
            totalDreams={chartData.totalDreams}
            timeRange={timeRange}
          />
        </section>
      )}

      {collective ? (
        <>
          {/* Key Metrics with Contextual Learn Card */}
          <div className="grid grid-cols-[minmax(140px,28%)_1fr] gap-6 mb-8">
            {/* Learn Card: Collective Unconscious - contextual label */}
            <LearnCard topic={COLLECTIVE_UNCONSCIOUS_TOPIC} size="lg" variant="plain" align="left" iconPosition="none" actionLabel="Learn more" hideSubtitleOnMobile/>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Dreams', value: collective.dreamCount.toLocaleString() },
                { label: 'Recurring Rate', value: Math.round(collective.recurringRate), suffix: '%' },
                { label: 'Lucid Rate', value: Math.round(collective.lucidPercentage), suffix: '%' },
                { label: 'Nightmare Rate', value: Math.round(collective.nightmareRate), suffix: '%' },
              ].map((metric) => (
                <Card key={metric.label} padding="md" variant="outlined">
                  <div className="flex flex-col h-full items-center justify-center gap-1 pb-1 text-center">
                    <div className="text-2xl font-medium text-foreground">
                      {metric.value}{metric.suffix}
                    </div>
                    <div className="text-xs text-muted mt-1">{metric.label}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Two Column: Emotions + Community Pulse */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <CollectiveEmotions
                data={collective.emotions}
                period={timeRange}
                sampleSize={collective.sampleSize}
              />
            </div>
            <div className="space-y-4">
              <CommunityPulse
                dreamerCount={collective.dreamerCount}
                dreamsToday={collective.dreamsToday}
                trendingEmotion={collective.trendingEmotion}
                weatherTrend={chartData?.current.trend ?? 'stable'}
                timeRange={timeRange}
              />
              {/* Learn Card: Our Mission - below pulse */}
              <DismissibleLearnCard 
                topic={OUR_MISSION_TOPIC} 
                size="sm" 
                variant="card"
                iconPosition="left"
                dismissalKey="weather-our-mission"
              />
            </div>
          </div>

          {/* Trending Symbols */}
          <TrendingSymbols symbols={collective.topSymbols} />
        </>
      ) : (
            <Card padding="lg">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-medium mb-2">Not Enough Data Yet</h3>
            <p className="text-muted">
              Collective dream weather will appear once we have sufficient data from our community.
                </p>
              </div>
            </Card>
          )}
    </div>
  )
}
