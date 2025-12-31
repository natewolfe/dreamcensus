import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell, PageHeader } from '@/components/layout'
import { StreamClient } from './_components/StreamClient'
import { getStreamQuestions } from './actions'

export const metadata = {
  title: 'The Stream | Dream Census',
  description: 'Explore questions about dreams and consciousness',
}

async function StreamContent() {
  // Fetch initial questions on the server
  const initialQuestions = await getStreamQuestions(10)

  return <StreamClient initialQuestions={initialQuestions} />
}

export default function StreamPage() {
  return (
    <AppShell activeNav="stream">
      <PageHeader
        title="The Stream"
        subtitle="Explore questions about dreams and consciousness"
        hideOnMobile
      >
        <Link
          href="/stream/threads"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          View Threads
        </Link>
      </PageHeader>

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center px-4 py-8">
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

