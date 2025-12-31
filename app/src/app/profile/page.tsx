import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell, PageHeader, ContentContainer } from '@/components/layout'
import { getSession } from '@/lib/auth'
import { getChaptersWithProgress, areAllChaptersComplete } from '@/lib/chapters'
import { getStreamStats } from '@/lib/stream'

export const metadata = {
  title: 'Dream Profile | Dream Census',
  description: 'Your personal dream profile and insights',
}

async function ProfileContent() {
  const session = await getSession()
  
  // Redirect to auth if no session on profile page
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center py-16">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-medium mb-2">Profile Unavailable</h2>
        <p className="text-[var(--foreground-muted)] mb-6">
          Please interact with the app first to create your profile
        </p>
        <Link href="/" className="btn btn-primary">
          Go to Stream
        </Link>
      </div>
    )
  }
  
  const [chapters, allComplete, streamStats] = await Promise.all([
    getChaptersWithProgress(session.userId),
    areAllChaptersComplete(session.userId),
    getStreamStats(session.userId),
  ])

  const completedChapters = chapters.filter((c) => c.isComplete).length
  const totalQuestions = chapters.reduce((sum, c) => sum + c.stepCount, 0)
  const answeredQuestions = chapters.reduce((sum, c) => sum + c.answeredCount, 0)
  const censusProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

  return (
    <ContentContainer>
        {/* Hero Stats */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>Your Dream Journey</h2>
          <p className="text-lg text-[var(--foreground-muted)]">
            Exploring the mysteries of your inner world
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Census Progress */}
          <div className="p-6 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-3xl font-bold text-[var(--accent)] mb-1">
              {censusProgress}%
            </div>
            <div className="text-sm text-[var(--foreground-muted)] mb-4">
              Census Up-to-Date
            </div>
            <div className="text-xs text-[var(--foreground-subtle)] mt-2">
              {completedChapters} of {chapters.length} chapters
            </div>
          </div>

          {/* Stream Stats */}
          <div className="p-6 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-3xl mb-2">🌊</div>
            <div className="text-3xl font-bold text-[var(--accent)] mb-1">
              {streamStats.total}<span className="text-[var(--foreground-muted)]/30 font-normal"> / {totalQuestions}</span>
            </div>
            <div className="text-sm text-[var(--foreground-muted)] mb-4">
              Stream Questions
            </div>
            <div className="text-xs text-[var(--foreground-subtle)] mt-2">
              <div className="flex items-center gap-4 text-xs">
                <span>🟢 {streamStats.yesCount} yes</span>
                <span>🟣 {streamStats.noCount} no</span>
              </div>
            </div>
          </div>

          {/* Reflection Rate */}
          <div className="p-6 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-3xl mb-2">💭</div>
            <div className="text-3xl font-bold text-[var(--accent)] mb-1">
              {streamStats.expandRate.toFixed(0)}%
            </div>
            <div className="text-sm text-[var(--foreground-muted)] mb-4">
              Reflection Rate
            </div>
            <div className="text-xs text-[var(--foreground-subtle)] mt-2">
              {streamStats.withTextCount} expanded responses
            </div>
          </div>
        </div>

        {/* Census Chapters Progress */}
        <div className="mb-3 p-8 pb-12 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)]">
          <h3 className="text-2xl font-bold mb-6">Census Chapters</h3>
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="flex items-center gap-4">
                <div className={`text-3xl ${chapter.isComplete ? 'opacity-100' : 'opacity-30'}`}>
                  {chapter.iconEmoji || '✦'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[var(--foreground-muted)]">{chapter.name}</span>
                    <span className="text-sm text-[var(--foreground-subtle)]">
                      {chapter.answeredCount} / {chapter.stepCount}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] transition-all"
                      style={{
                        width: `${chapter.stepCount > 0 ? (chapter.answeredCount / chapter.stepCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
                {chapter.isComplete ? (
                  <span className="text-green-500 text-xl">✓</span>
                ) : (
                  <Link
                    href={`/census/${chapter.slug}`}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Continue →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Insights (Coming Soon) */}
        <div className="p-8 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)] text-center">
          <div className="text-5xl mb-4">🔮</div>
          <h3 className="text-2xl font-bold mb-3">Dream Insights</h3>
          <p className="text-[var(--foreground-muted)] mb-6 max-w-[600px] mx-auto">
            {allComplete
              ? 'Deep analysis of your dream patterns and tendencies will appear here soon. Your complete census data will reveal fascinating insights about your dream life.'
              : 'Complete all census chapters to unlock personalized insights about your dream patterns, preferences, and unique relationship with the dream world.'}
          </p>
          {!allComplete && (
            <Link href="/census" className="btn btn-primary inline-block">
              Complete Census →
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="mt-12 flex gap-4 justify-center">
          <Link href="/census" className="btn btn-secondary">
            Census
          </Link>
          <Link href="/" className="btn btn-secondary">
            Stream
          </Link>
        </div>
    </ContentContainer>
  )
}

function LoadingSkeleton() {
  return (
    <ContentContainer>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-[var(--background-elevated)] rounded-xl" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-[var(--background-elevated)] rounded-xl" />
            ))}
          </div>
        </div>
    </ContentContainer>
  )
}

export default function ProfilePage() {
  return (
    <AppShell>
      <PageHeader
        title="Profile"
        subtitle="Your dream journey and insights"
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <ProfileContent />
      </Suspense>
    </AppShell>
  )
}

