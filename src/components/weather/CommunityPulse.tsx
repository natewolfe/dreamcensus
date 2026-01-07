import { Card } from '@/components/ui'
import type { WeatherTrend } from '@/lib/weather/types'

interface CommunityPulseProps {
  dreamerCount: number
  dreamsToday: number
  trendingEmotion: string
  weatherTrend: WeatherTrend
  timeRange: string
}

export function CommunityPulse({
  dreamerCount,
  dreamsToday,
  trendingEmotion,
  weatherTrend,
  timeRange,
}: CommunityPulseProps) {
  const trendIcon = weatherTrend === 'rising' ? '↗' : weatherTrend === 'falling' ? '↘' : '→'
  const trendColor =
    weatherTrend === 'rising'
      ? 'text-[var(--weather-radiant)]'
      : weatherTrend === 'falling'
        ? 'text-[var(--weather-stormy)]'
        : 'text-accent'

  return (
    <Card padding="lg">
      <div>
        <div className="flex flex-col gap-1 pb-0">
          <h3 className="text-lg font-medium text-foreground mb-1">Collective Pulse</h3>
          <p className="text-xs text-muted">
            Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
          </p>
        </div>

        {/* Active Dreamers */}
        <div className="flex items-center gap-3 py-3 pt-0 border-b border-border">
          <div className="w-12 flex items-center justify-center text-3xl">👥</div>
          <div className="flex-1">
            <div className="text-2xl font-medium text-foreground">{dreamerCount}</div>
            <div className="text-xs text-muted">Active Dreamers</div>
          </div>
        </div>

        {/* Dreams Today */}
        <div className="flex items-center gap-3 py-3 border-b border-border">
          <div className="w-12 flex items-center justify-center text-3xl">💭</div>
          <div className="flex-1">
            <div className="text-2xl font-medium text-foreground">{dreamsToday}</div>
            <div className="text-xs text-muted">Dreams Today</div>
          </div>
        </div>

        {/* Trending Emotion */}
        <div className="flex items-center gap-3 py-3 border-b border-border">
          <div className="w-12 flex items-center justify-center text-3xl">🔥</div>
          <div className="flex-1">
            <div className={`text-lg font-medium text-foreground capitalize`}>
              {trendingEmotion}
            </div>
            <div className="text-xs text-muted">Trending Emotion</div>
          </div>
        </div>

        {/* Weather Trend */}
        <div className="flex items-center gap-3 py-3 pb-0">
          <div className="w-12 flex items-center justify-center text-3xl">📈</div>
          <div className="flex-1">
            <div className={`text-lg font-medium text-foreground`}>
              {weatherTrend.charAt(0).toUpperCase() + weatherTrend.slice(1)} {trendIcon}
            </div>
            <div className="text-xs text-muted">Weather Trend</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

