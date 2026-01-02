import { Suspense } from 'react'
import { AppShell, PageHeader } from '@/components/layout'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { InviteFlow } from './InviteFlow'
import { SpinnerFullScreen } from '@/components/ui'

export const metadata = {
  title: 'Invite Friends | Dream Census',
  description: 'Help map the collective unconscious',
}

async function InviteContent() {
  const session = await getSession()
  
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">👥</div>
          <h2 className="text-2xl font-medium mb-4">Sign in Required</h2>
          <p className="text-[var(--foreground-muted)]">
            Create an account to invite friends and track your impact.
          </p>
        </div>
      </div>
    )
  }

  // Get or create referral code
  let referral = await db.referral.findFirst({
    where: { referrerId: session.userId },
    include: {
      referredUsers: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  })

  if (!referral) {
    // Generate unique code
    const code = Math.random().toString(36).substring(2, 10)
    referral = await db.referral.create({
      data: {
        referrerId: session.userId,
        code,
      },
      include: {
        referredUsers: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    })
  }

  // Get dreams count for referred users
  const referredUserIds = referral.referredUsers.map(u => u.id)
  const dreamsShared = await db.dreamEntry.count({
    where: {
      userId: { in: referredUserIds },
    },
  })

  return (
    <InviteFlow
      referralCode={referral.code}
      clicks={referral.clicks}
      friendsJoined={referral.referredUsers.length}
      dreamsShared={dreamsShared}
    />
  )
}

export default function InvitePage() {
  return (
    <AppShell activeNav="profile">
      <PageHeader
        title="Invite Friends"
        subtitle="Help map the collective unconscious"
      />
      <Suspense fallback={<SpinnerFullScreen />}>
        <InviteContent />
      </Suspense>
    </AppShell>
  )
}

