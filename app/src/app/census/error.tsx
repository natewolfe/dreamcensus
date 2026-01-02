'use client'

import { ErrorDisplay } from '@/components/ErrorDisplay'

export default function CensusError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      error={error}
      title="Something went wrong"
      message="We encountered an error loading the census. Don't worry—your progress has been saved and you can try again."
      icon="🌙"
      onRetry={reset}
      showHomeLink={true}
    />
  )
}
