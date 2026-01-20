'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MorningMode } from '@/components/morning'
import { FlowPageWrapper } from '@/components/ui'

interface JournalNewClientProps {
  userId: string
  displayName?: string
}

export function JournalNewClient({
  userId,
  displayName,
}: JournalNewClientProps) {
  const router = useRouter()
  const [hasData, setHasData] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleComplete = (dreamId: string) => {
    router.push(`/journal/${dreamId}`)
  }

  const handleExit = () => {
    // Only save if there's actual data
    // For now, just exit - draft is already saved to IndexedDB automatically
    router.push('/journal')
  }

  return (
    <FlowPageWrapper
      onExit={handleExit}
      exitText={hasData ? "Save & Exit" : "Exit"}
      hideExit={isComplete}
    >
      <MorningMode
        mode="journal"
        userId={userId}
        displayName={displayName}
        onComplete={handleComplete}
        onCancel={handleExit}
        onHasDataChange={setHasData}
        onCompletionVisible={setIsComplete}
      />
    </FlowPageWrapper>
  )
}
