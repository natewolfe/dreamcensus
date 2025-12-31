import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Insights | Dream Census',
  description: 'Your dream insights',
}

async function InsightsContent() {
  const session = await getSession()
  
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center py-16">
        <div className="text-6xl mb-6">🔮</div>
        <h2 className="text-2xl font-medium mb-3">Insights Unavailable</h2>
        <p className="text-[var(--foreground-muted)] mb-6">
          Capture some dreams first to unlock insights
        </p>
        <Link href="/journal/capture" className="btn btn-primary">
          Capture a Dream
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-medium mb-8" style={{ fontFamily: 'var(--font-family-display)' }}>
        Your Dream Insights
      </h1>

      <div className="text-center py-16">
        <div className="text-6xl mb-6">🔮</div>
        <h2 className="text-2xl font-medium mb-3">Coming Soon</h2>
        <p className="text-[var(--foreground-muted)] max-w-lg mx-auto">
          Personalized insights about your dream patterns, symbols, and emotions will appear here.
          Keep capturing dreams to unlock deeper analysis.
        </p>
      </div>
    </div>
  )
}

export default function ProfileInsightsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <InsightsContent />
      </Suspense>
    </AppShell>
  )
}

