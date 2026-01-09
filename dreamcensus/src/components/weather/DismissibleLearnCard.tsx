'use client'

import { useState, useEffect } from 'react'
import { LearnCard } from '@/components/school'
import type { LearnCardProps } from '@/components/school'

interface DismissibleLearnCardProps extends Omit<LearnCardProps, 'onDismiss'> {
  dismissalKey: string  // Unique key for storing dismissal in localStorage
}

export function DismissibleLearnCard({ dismissalKey, ...props }: DismissibleLearnCardProps) {
  // null = loading (prevents flash), true/false = resolved state
  const [isDismissed, setIsDismissed] = useState<boolean | null>(null)

  // Check localStorage on mount to see if already dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem(`dismissed_${dismissalKey}`) === 'true'
    setIsDismissed(dismissed)
  }, [dismissalKey])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(`dismissed_${dismissalKey}`, 'true')
  }

  // Don't render until we've checked localStorage (prevents flash of content)
  if (isDismissed === null) {
    return null
  }

  // Don't render if dismissed
  if (isDismissed) {
    return null
  }

  return <LearnCard {...props} onDismiss={handleDismiss} />
}
