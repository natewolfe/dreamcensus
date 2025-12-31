'use client'

export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Journal error:', error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">📔</div>
        <h2 className="text-2xl font-medium mb-4">Journal Error</h2>
        <p className="text-[var(--foreground-muted)] mb-6">
          We encountered an error loading your dream journal. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-secondary"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}

