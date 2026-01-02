import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell, PageHeader } from '@/components/layout'
import { Card, SpinnerFullScreen } from '@/components/ui'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `${decodeURIComponent(params.slug)} | Dream Census`,
    description: `Explore dreams containing ${decodeURIComponent(params.slug)}`,
  }
}

async function TagExplorationContent({ tagName }: { tagName: string }) {
  const session = await getSession()
  
  // Find tag
  const tag = await db.tag.findFirst({
    where: {
      OR: [
        { name: tagName },
        { normalizedName: tagName.toLowerCase() },
      ],
    },
    include: {
      occurrences: {
        include: {
          dreamEntry: {
            select: {
              id: true,
              textRaw: true,
              capturedAt: true,
              userId: true,
              isPublicAnon: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      },
    },
  })

  if (!tag) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🏷️</div>
          <h2 className="text-2xl font-medium mb-4">Tag Not Found</h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            We couldn't find any dreams with this tag.
          </p>
          <Link href="/explore" className="text-[var(--accent)] hover:underline">
            Explore all tags →
          </Link>
        </div>
      </div>
    )
  }

  // Separate personal and collective occurrences
  const personalOccurrences = session
    ? tag.occurrences.filter(o => o.dreamEntry.userId === session.userId)
    : []
  const collectiveOccurrences = tag.occurrences.filter(
    o => o.dreamEntry.isPublicAnon && (!session || o.dreamEntry.userId !== session.userId)
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Tag Header */}
      <Card className="mb-8">
        <div className="text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-4">
            {tag.type}
          </div>
          <h1 className="text-3xl font-medium mb-4">{tag.name}</h1>
          {tag.category && (
            <p className="text-[var(--foreground-muted)] mb-4 capitalize">{tag.category}</p>
          )}
          <div className="text-sm text-[var(--foreground-subtle)]">
            {tag.totalOccurrences} total occurrences across all dreams
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
        <button className="px-4 py-2 font-medium text-[var(--accent)] border-b-2 border-[var(--accent)]">
          Collective
        </button>
        {session && (
          <button className="px-4 py-2 font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            Your Dreams ({personalOccurrences.length})
          </button>
        )}
      </div>

      {/* Collective View */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium mb-4">Dreams from the Collective</h3>
        {collectiveOccurrences.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-[var(--foreground-muted)]">
              No public dreams found with this tag
            </div>
          </Card>
        ) : (
          collectiveOccurrences.map((occurrence) => (
            <Card key={occurrence.id} variant="flat" className="hover:border-[var(--accent)] transition-colors">
              <div className="text-sm text-[var(--foreground-muted)] mb-2">
                {new Date(occurrence.dreamEntry.capturedAt).toLocaleDateString()}
              </div>
              <p className="line-clamp-3 text-[var(--foreground)]">
                {occurrence.dreamEntry.textRaw}
              </p>
            </Card>
          ))
        )}
      </div>

      {/* Personal View (if logged in) */}
      {session && personalOccurrences.length > 0 && (
        <div className="mt-12 space-y-4">
          <h3 className="text-xl font-medium mb-4">Your Dreams</h3>
          {personalOccurrences.map((occurrence) => (
            <Link 
              key={occurrence.id} 
              href={`/journal/${occurrence.dreamEntry.id}`}
            >
              <Card variant="flat" className="hover:border-[var(--accent)] transition-colors cursor-pointer">
                <div className="text-sm text-[var(--foreground-muted)] mb-2">
                  {new Date(occurrence.dreamEntry.capturedAt).toLocaleDateString()}
                </div>
                <p className="line-clamp-3 text-[var(--foreground)]">
                  {occurrence.dreamEntry.textRaw}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TagExplorationPage({ params }: { params: { slug: string } }) {
  const tagName = decodeURIComponent(params.slug)
  
  return (
    <AppShell activeNav="explore">
      <PageHeader title="Tag Exploration" subtitle={`Dreams containing "${tagName}"`} />
      <Suspense fallback={<SpinnerFullScreen />}>
        <TagExplorationContent tagName={tagName} />
      </Suspense>
    </AppShell>
  )
}

