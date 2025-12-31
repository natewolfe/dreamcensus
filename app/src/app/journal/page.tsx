import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell, PageHeader, ContentContainer } from '@/components/layout'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export const metadata = {
  title: 'Dream Journal | Dream Census',
  description: 'Your personal dream journal',
}

async function JournalContent() {
  const session = await getSession()
  
  // If no session, show empty state
  if (!session) {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-6xl mb-4">📔</div>
        <h3 className="text-xl font-medium mb-2">Welcome to Your Dream Journal</h3>
        <p className="text-[var(--foreground-muted)] mb-6">
          Start capturing your dreams to build your personal journal
        </p>
      </div>
    )
  }
  
  // Get recent dreams
  const dreams = await db.dreamEntry.findMany({
    where: { userId: session.userId },
    orderBy: { capturedAt: 'desc' },
    take: 10,
  })

  const totalDreams = await db.dreamEntry.count({
    where: { userId: session.userId },
  })

  return (
    <ContentContainer>

      {/* New Entry Section - Only show when there are dreams */}
      {dreams.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-br from-[var(--accent-muted)]/10 to-[var(--accent-muted)]/5 rounded-xl border border-[var(--accent)]/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium mb-1">Record a New Dream</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Capture your dreams while they're fresh in your mind
              </p>
            </div>
            <Link
              href="/journal/capture"
              className="flex items-center gap-2 px-6 pl-4 py-3 rounded-lg bg-[var(--accent-muted)]/70 text-white font-medium hover:bg-[var(--accent-muted)] transition-colors whitespace-nowrap"
            >
              <span>✨</span>
              <span>New Entry</span>
            </Link>
          </div>
        </div>
      )}

        {/* Stats */}
      {totalDreams > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-2xl font-bold text-[var(--accent)]">{totalDreams}</div>
            <div className="text-xs text-[var(--foreground-muted)]">Dreams</div>
          </div>
          <div className="p-4 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-2xl font-bold text-[var(--accent)]">-</div>
            <div className="text-xs text-[var(--foreground-muted)]">This Month</div>
          </div>
          <div className="p-4 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-2xl font-bold text-[var(--accent)]">-</div>
            <div className="text-xs text-[var(--foreground-muted)]">Avg Clarity</div>
          </div>
        </div>
      )}

      {/* Recent Dreams */}
      {dreams.length > 0 ? (
        <div>
          <h2 className="text-xl font-medium mb-4">Recent Dreams</h2>
          <div className="space-y-4">
            {dreams.map((dream) => (
              <Link
                key={dream.id}
                href={`/journal/${dream.id}`}
                className="block p-6 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-[var(--foreground-subtle)]">
                    {new Date(dream.capturedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  {dream.clarity && (
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < dream.clarity! ? 'text-[var(--accent)]' : 'text-[var(--foreground-subtle)]'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[var(--foreground-muted)] line-clamp-2">
                  {dream.textRaw}
                </p>
                {((dream.lucidity && dream.lucidity >= 4) || dream.isNightmare || dream.isRecurring) && (
                  <div className="flex gap-2 mt-3">
                    {dream.lucidity && dream.lucidity >= 4 && (
                      <span className="text-xs px-2 py-1 bg-[var(--accent-muted)] rounded">Lucid</span>
                    )}
                    {dream.isNightmare && (
                      <span className="text-xs px-2 py-1 bg-[var(--error)]/20 rounded">Nightmare</span>
                    )}
                    {dream.isRecurring && (
                      <span className="text-xs px-2 py-1 bg-[var(--secondary-muted)] rounded">Recurring</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh] text-center">
          <div>
            <div className="text-6xl mb-4">📔</div>
            <h3 className="text-xl font-medium mb-2">No Dreams Yet</h3>
            <p className="text-[var(--foreground-muted)] mb-6">
              Start capturing your dreams to build your journal.
            </p>
            <Link
              href="/journal/capture"
              className="inline-flex items-center gap-2 px-6 pl-4 py-3 rounded-lg bg-[var(--accent-muted)]/70 text-white font-medium hover:bg-[var(--accent-muted)] transition-colors"
            >
              <span>✨</span>
              <span>New Entry</span>
            </Link>
          </div>
        </div>
      )}
    </ContentContainer>
  )
}

function LoadingSkeleton() {
  return (
    <ContentContainer>
      <div className="animate-pulse">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--background-elevated)] rounded-xl" />
          ))}
        </div>
      </div>
    </ContentContainer>
  )
}

export default async function JournalPage() {
  return (
    <AppShell activeNav="journal">
      <PageHeader
        title="Journal"
        subtitle="Capture and explore your dreams"
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <JournalContent />
      </Suspense>
    </AppShell>
  )
}

