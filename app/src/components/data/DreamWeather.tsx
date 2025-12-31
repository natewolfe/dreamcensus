import { getAggregateStats } from '@/lib/data/aggregates'
import { DreamWeatherChart } from './DreamWeatherChart'

export async function DreamWeather() {
  const stats = await getAggregateStats()
  
  if (!stats?.dreamWeather || stats.dreamWeather.points.length === 0) {
    return (
      <div className="p-12 bg-[var(--background-elevated)] border border-[var(--border)] border-dashed rounded-xl text-center">
        <div className="text-4xl mb-3">🌙</div>
        <h3 className="text-xl font-medium mb-2">Dream Weather</h3>
        <p className="text-[var(--foreground-muted)]">
          Collective sentiment tracking will appear as dreams are captured
        </p>
      </div>
    )
  }
  
  return (
    <div className="p-3 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)]">
      <DreamWeatherChart 
        points={stats.dreamWeather.points}
        current={stats.dreamWeather.current}
      />
    </div>
  )
}

