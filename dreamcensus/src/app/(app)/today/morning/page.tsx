import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getLastNightIntention } from '../actions'
import { MorningPageClient } from './MorningPageClient'

export default async function MorningCapturePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const intention = await getLastNightIntention()

  return (
    <MorningPageClient
      userId={session.userId}
      lastNightIntention={intention ?? undefined}
    />
  )
}
