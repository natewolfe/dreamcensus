import { PageHeader } from '@/components/layout'
import { RitualCard } from '@/components/ui'
import { DreamSchoolSection } from '@/components/school'
import { EmbeddedPromptStackClient } from './EmbeddedPromptStackClient'
import { EmbeddedWeatherChart } from '@/components/weather'
import { InsightsSection, type InsightItem } from '@/components/today'
import { StreakCard } from './StreakCard'
import { TodayAlarmWidget } from './TodayAlarmWidget'
import { getTimeGreeting } from '@/lib/utils'
import { getStreak, getWeekDreams } from './actions'
import { getStreamQuestionsFormatted } from '../prompts/actions'
import { getWeatherChart, getPersonalWeather } from '../weather/actions'
import { getCensusSections, getCensusProgress } from '../census/actions'
import { getNextSection } from '@/components/census/constants'
import { generateInsights } from '@/lib/insights'

export default async function TodayPage() {
  const greeting = getTimeGreeting()
  const today = new Date()

  // Fetch streak, week data, prompts, weather chart, personal weather, and census data
  const [streakCount, weekDreams, promptsResult, chartResult, personalResult, sectionsResult, progressResult] = await Promise.all([
    getStreak(),
    getWeekDreams(),
    getStreamQuestionsFormatted(5),
    getWeatherChart('7d'),
    getPersonalWeather('7d'),
    getCensusSections(),
    getCensusProgress(),
  ])

  const chartData = chartResult.success ? chartResult.data : null
  const personalWeather = personalResult.success ? personalResult.data : null

  // Calculate census progress
  let censusProgress = 0
  let censusAnswered = 0
  let censusTotal = 0
  let nextSectionName: string | undefined
  let nextSectionSlug: string | undefined
  
  if (sectionsResult.success && progressResult.success) {
    const sections = sectionsResult.data
    const progress = progressResult.data
    
    censusTotal = sections.reduce((sum, s) => sum + s.questions.length, 0)
    censusAnswered = Object.values(progress).reduce(
      (sum, p) => sum + p.answeredQuestions,
      0
    )
    censusProgress = censusTotal > 0
      ? Math.round((censusAnswered / censusTotal) * 100)
      : 0
    
    // Get next section for CTA subtitle and direct linking
    const nextSection = getNextSection(sections, progress)
    nextSectionName = nextSection?.name
    nextSectionSlug = nextSection?.slug ?? nextSection?.id
  }

  // Generate insights from available data
  const generatedInsights = generateInsights({
    personal: personalWeather,
    chart: chartData,
    censusProgress,
    censusAnswered,
    censusTotal,
    streakCount,
    weekDreams,
  })

  // Map to InsightItem format for component
  const insights: InsightItem[] = generatedInsights.map(i => ({
    label: i.label,
    message: i.message,
  }))

  // Generate last 7 days with today on the right
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - i)) // i=0 is 6 days ago, i=6 is today
    return {
      label: dayNames[date.getDay()] ?? '',
      isToday: i === 6,
    }
  })

  return (
    <div id="main-content" className="container mx-auto mb-16 max-w-4xl px-4 md:px-6 md:pl-3 py-4 md:py-6">
      {/* Week Summary — constellation-style tracker */}
      <section className="mb-10" aria-label="Weekly dream tracking">
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Day nodes with connecting track */}
          <div className="relative flex flex-1 items-start justify-between px-1 sm:px-3">
            {/* Track line — positioned to align with nodes */}
            <div 
              className="pointer-events-none absolute inset-x-6 sm:inset-x-8 h-[2px] bg-gradient-to-r from-muted/10 via-muted/50 to-constellation-edge/90"
              style={{ top: 'calc(1rem + 14px + 10px)' }} // label height + margin + half node
            />
            
            {last7Days.map((day, i) => {
              const { label, isToday } = day
              const dreamCount = weekDreams[i] ?? 0
              
              return (
                <div 
                  key={i} 
                  className="flex flex-col items-center min-w-[2rem] sm:min-w-[2.5rem]"
                >
                  {/* Day label */}
                  <span 
                    className={`mb-3.5 text-[11px] font-semibold tracking-wide select-none transition-colors duration-200 ${
                      isToday 
                        ? 'text-foreground' 
                        : 'text-muted/60'
                    }`}
                  >
                    <span className="sm:hidden">{label.charAt(0)}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                  
                  {/* Node container — fixed size for track alignment */}
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    {/* Today's ambient glow */}
                    {isToday && (
                      <div 
                        className="absolute h-8 w-8 animate-pulse rounded-full"
                        style={{ 
                          background: 'radial-gradient(circle, var(--constellation-pulse) 0%, transparent 70%)',
                          animationDuration: '3s'
                        }}
                      />
                    )}
                    
                    {/* Outer ring for today */}
                    {isToday && (
                      <div className="absolute h-6 w-6 rounded-full border border-muted/20" />
                    )}
                    
                    {/* Core node — state based on dream count */}
                    {dreamCount === 0 ? (
                      // Hollow circle — no dream
                      <div
                        className={`relative z-10 h-3 w-3 bg-card-bg rounded-full border-[2px] transition-all duration-300 ${
                          isToday
                            ? 'border-constellation-node'
                            : 'border-muted/50'
                        }`}
                      />
                    ) : dreamCount === 1 ? (
                      // Checkmark — one dream
                      <div
                        className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300 ${
                          isToday
                            ? 'bg-constellation-node shadow-[0_0_10px_var(--muted)]'
                            : 'bg-muted'
                        }`}
                      >
                        <svg 
                          className="h-3 w-3 text-background" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={3.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      // Number badge — multiple dreams
                      <div
                        className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
                          isToday
                            ? 'bg-constellation-node shadow-[0_0_10px_var(--muted)]'
                            : 'bg-muted'
                        }`}
                      >
                        <span className="text-[11px] font-black text-card-bg leading-none">
                          {dreamCount > 9 ? '9+' : dreamCount}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* "Today" indicator */}
                  {isToday && (
                    <span className="mt-3 text-[9px] font-semibold tracking-[0.15em] uppercase text-muted/90">
                      Today
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Streak counter — right side */}
          <div className="flex items-center gap-2">
            <StreakCard streakCount={streakCount} />
          </div>
        </div>
      </section>

      {/* Page Header and Alarm Widget */}
      <div className="flex flex-row items-end justify-between mb-6">
        <PageHeader title="Hello, Dreamer..." />
        <TodayAlarmWidget />
      </div>

      <div className="space-y-10">
        {/* Ritual Cards - Side by Side */}
        <section className="flex flex-row gap-3" aria-label="Daily rituals">
          <RitualCard
            href="/today/morning"
            variant="waking"
            title="Wakeup"
            subtitle="Capture your dream"
            actionLabel="Record"
            icon={<span>☀️</span>}
          />
          <RitualCard
            href="/today/night"
            variant="bedtime"
            title="Bedtime"
            subtitle="Prepare for bed"
            actionLabel="Begin"
            icon={<span>🌙</span>}
          />
        </section>

        <section aria-label="Daily prompts" className="flex flex-col-reverse md:flex-row gap-5">
          {/* Insights + Census CTA */}
          <div className="w-full md:w-4/9 mb-4 md:mb-0">
            {/* Section header */}
            <div className="flex items-center justify-start mb-4 hidden md:block">
              <span className="text-sm text-muted/50 opacity-0 pointer-events-none">Insights</span>
            </div>
            <InsightsSection
              insights={insights}
              censusProgress={censusProgress}
              censusAnswered={censusAnswered}
              nextSectionName={nextSectionName}
              nextSectionSlug={nextSectionSlug}
            />
          </div>

          {/* Embedded Prompt Stack */}
          <div className="w-full md:max-w-5/9">
            {promptsResult.success && promptsResult.data.length > 0 && (
              <EmbeddedPromptStackClient initialQuestions={promptsResult.data} />
            )}
          </div>
        </section>

        {/* Embedded Weather Chart */}
        {chartData && chartData.points.length >= 6 && (
          <EmbeddedWeatherChart chartData={chartData} />
        )}

        {/* Dream School Section */}
        <DreamSchoolSection />
      </div>
    </div>
  )
}

