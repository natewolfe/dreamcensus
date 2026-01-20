import { ProfileClient } from './ProfileClient'
import { getProfileData, getProfileStats } from './actions'
import { getDreamerProfile, getProfileProgress } from './dream-profile-actions'
import { getStreak, getWeekDreams } from '../today/actions'
import { getWeatherChart, getPersonalWeather, getPersonalWeatherChart } from '../weather/actions'
import { getSession } from '@/lib/auth'
import { getCensusProgressSummary } from '@/lib/census/progress'
import { generateInsights } from '@/lib/insights'
import type { InsightItem } from '@/components/today'

export default async function ProfilePage() {
  const session = await getSession()

  const [profileResult, statsResult, dreamerProfileResult, progressResult, streakCount, weekDreams, chartResult, personalResult, personalChartResult, censusProgressSummary] = await Promise.all([
    getProfileData(),
    getProfileStats(),
    getDreamerProfile(),
    getProfileProgress(),
    getStreak(),
    getWeekDreams(),
    getWeatherChart('7d'),
    getPersonalWeather('7d'),
    getPersonalWeatherChart('7d'),
    session ? getCensusProgressSummary(session.userId) : Promise.resolve({ answered: 0, total: 0, percentage: 0 }),
  ])

  // Handle errors gracefully
  const profile = profileResult.success ? profileResult.data : null
  const stats = statsResult.success ? statsResult.data : null
  const dreamerProfile = dreamerProfileResult.success ? dreamerProfileResult.data : null
  const progress = progressResult.success ? progressResult.data : null
  const chartData = chartResult.success ? chartResult.data : null
  const personalWeather = personalResult.success ? personalResult.data : null
  const personalChartData = personalChartResult.success ? personalChartResult.data : null

  // Generate insights from available data
  const generatedInsights = generateInsights({
    personal: personalWeather,
    chart: chartData,
    censusProgress: censusProgressSummary.percentage,
    censusAnswered: censusProgressSummary.answered,
    censusTotal: censusProgressSummary.total,
    streakCount,
    weekDreams,
  })

  // Map to InsightItem format for component
  const insights: InsightItem[] = generatedInsights.map(i => ({
    label: i.label,
    message: i.message,
  }))

  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 md:px-6 md:pl-3 py-4 md:py-8 md:pb-16">
      <ProfileClient 
        initialProfile={profile} 
        initialStats={stats} 
        insights={insights}
        dreamerProfile={dreamerProfile}
        progress={progress}
        personalChartData={personalChartData}
      />
    </div>
  )
}
