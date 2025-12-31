import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { StreamClient } from './stream/_components/StreamClient'
import { getStreamQuestions } from './stream/actions'

export const metadata = {
  title: 'The Dream Census',
  description: 'Explore your relationship with dreams, sleep, and the inner life',
}

async function StreamContent() {
  const initialQuestions = await getStreamQuestions(10)
  return <StreamClient initialQuestions={initialQuestions} />
}

export default function HomePage() {
  return (
    <AppShell activeNav="stream">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-[var(--foreground-muted)]">Loading your stream...</p>
            </div>
          </div>
        }
      >
        <StreamContent />
      </Suspense>
    </AppShell>
  )
}
