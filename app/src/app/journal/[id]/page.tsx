import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { getDreamEntry } from '../actions'

export const metadata = {
  title: 'Dream Entry | Dream Census',
  description: 'View your dream',
}

async function DreamContent({ id }: { id: string }) {
  const dream = await getDreamEntry(id)

  if (!dream) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-4"
        >
          ← Back to Journal
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium" style={{ fontFamily: 'var(--font-family-display)' }}>
            {new Date(dream.capturedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h1>
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
      </div>

      {/* Tags */}
      {(dream.isLucid || dream.isNightmare || dream.isRecurring) && (
        <div className="flex gap-2 mb-6">
          {dream.isLucid && (
            <span className="px-3 py-1 bg-[var(--accent-muted)] text-sm rounded-full">
              Lucid
            </span>
          )}
          {dream.isNightmare && (
            <span className="px-3 py-1 bg-[var(--error)]/20 text-sm rounded-full">
              Nightmare
            </span>
          )}
          {dream.isRecurring && (
            <span className="px-3 py-1 bg-[var(--secondary-muted)] text-sm rounded-full">
              Recurring
            </span>
          )}
        </div>
      )}

      {/* Dream Content */}
      <div className="prose prose-invert max-w-none mb-8">
        <div className="p-6 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)]">
          <p className="text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
            {dream.textRaw}
          </p>
        </div>
      </div>

      {/* Metadata */}
      {(dream.lucidity || dream.emotional || dream.sleepDuration || dream.sleepQuality) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {dream.lucidity && (
            <div className="p-4 bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
              <div className="text-sm text-[var(--foreground-subtle)] mb-1">Lucidity</div>
              <div className="text-2xl font-medium">{dream.lucidity}/5</div>
            </div>
          )}
          {dream.emotional && (
            <div className="p-4 bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
              <div className="text-sm text-[var(--foreground-subtle)] mb-1">Emotional</div>
              <div className="text-2xl font-medium">{dream.emotional}/5</div>
            </div>
          )}
          {dream.sleepDuration && (
            <div className="p-4 bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
              <div className="text-sm text-[var(--foreground-subtle)] mb-1">Sleep</div>
              <div className="text-2xl font-medium">{dream.sleepDuration}h</div>
            </div>
          )}
          {dream.sleepQuality && (
            <div className="p-4 bg-[var(--background-elevated)] rounded-lg border border-[var(--border)]">
              <div className="text-sm text-[var(--foreground-subtle)] mb-1">Quality</div>
              <div className="text-2xl font-medium">{dream.sleepQuality}/5</div>
            </div>
          )}
        </div>
      )}

      {/* Symbols & Emotions */}
      {(dream.symbols.length > 0 || dream.emotions.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {dream.symbols.length > 0 && (
            <div className="p-6 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--foreground-subtle)] mb-3">Symbols</h3>
              <div className="flex flex-wrap gap-2">
                {dream.symbols.map((ds) => (
                  <span key={ds.id} className="px-3 py-1 bg-[var(--accent-muted)] text-sm rounded-full">
                    {ds.symbol.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {dream.emotions.length > 0 && (
            <div className="p-6 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--foreground-subtle)] mb-3">Emotions</h3>
              <div className="flex flex-wrap gap-2">
                {dream.emotions.map((de) => (
                  <span key={de.id} className="px-3 py-1 bg-[var(--secondary-muted)] text-sm rounded-full">
                    {de.emotion.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default async function DreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <AppShell activeNav="journal">
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <DreamContent id={id} />
      </Suspense>
    </AppShell>
  )
}

