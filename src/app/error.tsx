'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">⚠️</div>
        
        <div>
          <h1 className="text-3xl font-medium text-foreground mb-2">
            Something Went Wrong
          </h1>
          <p className="text-muted">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/today'}>
            Go to Today
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-left">
            <p className="text-xs text-red-400 font-mono">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

