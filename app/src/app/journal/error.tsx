'use client'

import { ErrorDisplay } from '@/components/ErrorDisplay'

export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      error={error}
      title="Journal Error"
      message="We encountered an error loading your dream journal. Please try again."
      icon="📔"
      onRetry={reset}
      showHomeLink={true}
    />
  )
}
