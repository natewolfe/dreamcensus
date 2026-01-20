'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MorningMode } from '@/components/morning'
import { FlowPageWrapper } from '@/components/ui'

interface MorningPageClientProps {
  userId: string
  displayName?: string
  lastNightIntention?: string
}

export function MorningPageClient({
  userId,
  displayName,
  lastNightIntention,
}: MorningPageClientProps) {
  const router = useRouter()
  const [hasData, setHasData] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleComplete = (dreamId: string) => {
    // Navigate back to today with success state
    router.push(`/today?dream=${dreamId}`)
  }

  const handleCancel = () => {
    router.push('/today')
  }

  const handleExit = () => {
    // Only save if there's actual data
    // For now, just exit - draft is already saved to IndexedDB automatically
    router.push('/today')
  }

  return (
    <FlowPageWrapper
      onExit={handleExit}
      exitText={hasData ? 'Save & Exit' : 'Exit'}
      hideExit={isComplete}
    >
      <MorningMode
        userId={userId}
        displayName={displayName}
        lastNightIntention={lastNightIntention}
        onComplete={handleComplete}
        onCancel={handleCancel}
        onHasDataChange={setHasData}
        onCompletionVisible={setIsComplete}
      />
    </FlowPageWrapper>
  )
}
