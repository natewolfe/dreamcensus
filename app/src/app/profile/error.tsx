'use client'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">✨</div>
        <h2 className="text-2xl font-medium mb-4">Something went wrong</h2>
        <p className="text-[var(--foreground-muted)] mb-6">
          We encountered an error loading your profile. Please try again.
        </p>
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
      </div>
    </div>
  )
}

