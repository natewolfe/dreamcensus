import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getLastNightIntention } from '../actions'
import { MorningPageClient } from './MorningPageClient'

export default async function MorningCapturePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Fetch user displayName and intention in parallel
  const [user, intention] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      select: { displayName: true },
    }),
    getLastNightIntention(),
  ])

  return (
    <MorningPageClient
      userId={session.userId}
      displayName={user?.displayName ?? undefined}
      lastNightIntention={intention ?? undefined}
    />
  )
}
