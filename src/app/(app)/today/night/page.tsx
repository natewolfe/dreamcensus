'use client'

import { useRouter } from 'next/navigation'
import { NightMode } from '@/components/night'
import { FlowPageWrapper } from '@/components/ui'

export default function NightCheckInPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/today')
  }

  const handleCancel = () => {
    router.push('/today')
  }

  const handleExit = () => {
    // Night mode doesn't persist drafts - it's a quick check-in
    // Data is only saved on completion via saveNightCheckIn action
    router.push('/today')
  }

  return (
    <FlowPageWrapper
      title="Bedtime"
      subtitle="Wind down for sleep"
      onExit={handleExit}
      exitText="Exit"
    >
      <NightMode
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </FlowPageWrapper>
  )
}

