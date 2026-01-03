'use client'

import { useRouter } from 'next/navigation'
import { MorningMode } from '@/components/morning'
import { FlowPageWrapper } from '@/components/ui'

export default function MorningCapturePage() {
  const router = useRouter()

  const handleComplete = (dreamId: string) => {
    // Navigate back to today with success state
    router.push(`/today?dream=${dreamId}`)
  }

  const handleCancel = () => {
    router.push('/today')
  }

  const handleSaveAndExit = () => {
    // TODO: Save draft and exit
    router.push('/today')
  }

  return (
    <FlowPageWrapper
      title="Morning Capture"
      subtitle="Record your dreams"
      onExit={handleSaveAndExit}
      exitText="Save & Exit"
    >
      <MorningMode
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </FlowPageWrapper>
  )
}

