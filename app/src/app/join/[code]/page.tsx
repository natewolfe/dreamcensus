import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  // Track the click
  const referral = await db.referral.findUnique({
    where: { code },
  })

  if (referral) {
    // Increment click count
    await db.referral.update({
      where: { id: referral.id },
      data: { clicks: { increment: 1 } },
    })
  }

  // Store the referral code in a cookie for attribution on signup
  // (Implementation depends on your auth system)
  
  // Redirect to home/signup
  redirect('/')
}

