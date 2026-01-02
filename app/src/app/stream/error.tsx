'use client'

import { ErrorDisplay } from '@/components/ErrorDisplay'

export default function StreamError({
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
      message="We encountered an error loading the stream. Your progress has been saved."
      icon="🌊"
      onRetry={reset}
      showHomeLink={false}
    />
  )
}
