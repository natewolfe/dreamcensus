import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DreamCard } from '@/components/journal/DreamCard'

export const metadata = {
  title: 'My Dreams | Dream Census',
  description: 'Your dream journal',
}

async function DreamsContent() {
  const session = await getSession()
  
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center py-16">
        <div className="text-6xl mb-4">📔</div>
        <h3 className="text-xl font-medium mb-2">No dreams yet</h3>
        <p className="text-[var(--foreground-muted)] mb-6">
          Start capturing dreams to build your journal
        </p>
        <Link href="/journal/capture" className="btn btn-primary">
          Capture Your First Dream
        </Link>
      </div>
    )
  }
  
  const dreams = await db.dreamEntry.findMany({
    where: { userId: session.userId },
    orderBy: { capturedAt: 'desc' },
    take: 50,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {dreams.length > 0 ? (
        <div className="space-y-4">
          {dreams.map((dream) => (
            <DreamCard key={dream.id} dream={dream} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📔</div>
          <h3 className="text-xl font-medium mb-2">No dreams yet</h3>
          <p className="text-[var(--foreground-muted)] mb-6">
            Start capturing your dreams to build your journal
          </p>
        </div>
      )}
    </div>
  )
}

export default function ProfileDreamsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <DreamsContent />
      </Suspense>
    </AppShell>
  )
}

