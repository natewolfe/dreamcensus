import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell, PageHeader } from '@/components/layout'
import { Card, SpinnerFullScreen } from '@/components/ui'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: 'Entity | Dream Census',
    description: 'Explore this entity across your dreams',
  }
}

async function EntityExplorationContent({ entityId }: { entityId: string }) {
  const session = await getSession()
  
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">👤</div>
          <h2 className="text-2xl font-medium mb-4">Sign in Required</h2>
          <p className="text-[var(--foreground-muted)]">
            Entities are personal. Sign in to view your entities.
          </p>
        </div>
      </div>
    )
  }

  // Find entity and ensure it belongs to the user
  const entity = await db.entity.findFirst({
    where: {
      id: entityId,
      userId: session.userId,
    },
    include: {
      occurrences: {
        include: {
          dreamEntry: {
            select: {
              id: true,
              textRaw: true,
              capturedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!entity) {
    notFound()
  }

  // Get co-occurring entities
  const dreamEntryIds = entity.occurrences.map(o => o.dreamEntryId)
  const coOccurringEntities = await db.entity.findMany({
    where: {
      userId: session.userId,
      id: { not: entityId },
      occurrences: {
        some: {
          dreamEntryId: { in: dreamEntryIds },
        },
      },
    },
    include: {
      occurrences: {
        where: {
          dreamEntryId: { in: dreamEntryIds },
        },
      },
    },
    take: 10,
  })

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return '👤'
      case 'place': return '📍'
      case 'thing': return '🔷'
      default: return '🔹'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Entity Header */}
      <Card className="mb-8">
        <div className="text-center">
          <div className="text-6xl mb-4">{getEntityIcon(entity.type)}</div>
          <h1 className="text-3xl font-medium mb-2">{entity.name}</h1>
          {entity.label && (
            <p className="text-[var(--foreground-muted)] mb-4">{entity.label}</p>
          )}
          <div className="flex items-center justify-center gap-6 text-sm text-[var(--foreground-subtle)]">
            <div className="capitalize">{entity.type}</div>
            <div>{entity.occurrences.length} dreams</div>
            <div>
              First appeared {new Date(entity.firstSeenAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Co-occurring Entities */}
      {coOccurringEntities.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4">Often appears with:</h3>
          <div className="flex flex-wrap gap-2">
            {coOccurringEntities.map((e) => (
              <Link
                key={e.id}
                href={`/journal/entity/${e.id}`}
                className="px-3 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors flex items-center gap-2"
              >
                <span>{getEntityIcon(e.type)}</span>
                <span>{e.name}</span>
                <span className="text-xs text-[var(--foreground-subtle)]">
                  ({e.occurrences.length})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Dreams */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium mb-4">Dreams featuring {entity.name}</h3>
        {entity.occurrences.map((occurrence) => (
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
    </div>
  )
}

export default function EntityExplorationPage({ params }: { params: { id: string } }) {
  return (
    <AppShell activeNav="journal">
      <PageHeader title="Entity" subtitle="Explore this entity across your dreams" />
      <Suspense fallback={<SpinnerFullScreen />}>
        <EntityExplorationContent entityId={params.id} />
      </Suspense>
    </AppShell>
  )
}

