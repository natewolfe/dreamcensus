import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui'

export default function InsightsPage() {
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
              <div className="text-3xl font-bold text-accent">0</div>
              <div className="text-sm text-muted">Dreams captured</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">0</div>
              <div className="text-sm text-muted">Day streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">0%</div>
              <div className="text-sm text-muted">Census complete</div>
            </div>
          </div>
        </Card>

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

