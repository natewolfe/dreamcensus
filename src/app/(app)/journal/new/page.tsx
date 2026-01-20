import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { JournalNewClient } from './JournalNewClient'

export default async function JournalNewEntryPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Fetch user displayName for personalized greeting
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { displayName: true },
  })

  return (
    <JournalNewClient
      userId={session.userId}
      displayName={user?.displayName ?? undefined}
    />
  )
}
