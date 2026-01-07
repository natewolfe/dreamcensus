import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui'
import { ConstellationView } from '@/components/insights/ConstellationView'
import { getInsightsStats, getDreamEntities } from './actions'

export default async function InsightsPage() {
  const statsResult = await getInsightsStats()
  const entitiesResult = await getDreamEntities()

  const stats = statsResult.success ? statsResult.data : {
    dreamCount: 0,
    streak: 0,
    censusProgress: 0,
  }

  const entities = entitiesResult.success ? entitiesResult.data : []

  return (
    <div id="main-content" className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Insights"
        subtitle="Personal patterns, trends, and settings"
      />

      <div className="space-y-6">
        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-4">Your Journey</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{stats.dreamCount}</div>
              <div className="text-sm text-muted">Dreams captured</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{stats.streak}</div>
              <div className="text-sm text-muted">Day streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{stats.censusProgress}%</div>
              <div className="text-sm text-muted">Census complete</div>
            </div>
          </div>
        </Card>

        {entities.length > 0 && (
          <Card padding="lg">
            <h2 className="text-lg font-semibold mb-4">Dream Constellation</h2>
            <p className="text-sm text-muted mb-4">
              Recurring emotions and themes in your dreams
            </p>
            <ConstellationView entities={entities} />
          </Card>
        )}

        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-2">Settings</h2>
          <p className="text-sm text-muted">
            Manage your account, privacy preferences, and data exports
          </p>
          <button className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-subtle transition-colors">
            Open Settings →
          </button>
        </Card>
      </div>
    </div>
  )
}

