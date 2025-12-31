import { Suspense } from 'react'
import { AppShell } from '@/components/layout'

export const metadata = {
  title: 'Data Insights | Dream Census',
  description: 'Visual analytics and insights',
}

export default function DataInsightsPage() {
  return (
    <AppShell activeNav="data">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-medium mb-8" style={{ fontFamily: 'var(--font-family-display)' }}>
          Visual Insights
        </h1>

        <div className="text-center py-16">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
          <p className="text-[var(--foreground-muted)]">
            Interactive charts and visualizations will appear here
          </p>
        </div>
      </div>
    </AppShell>
  )
}

