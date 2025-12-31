'use client'

import { motion } from 'motion/react'

export default function CensusError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Census error:', error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-[var(--space-page)]">
      <motion.div 
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Dream-themed illustration */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 bg-[var(--accent)]/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative text-6xl flex items-center justify-center h-full">
            🌙
          </div>
        </div>

        <h2 className="text-2xl font-medium mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>
          Something went wrong
        </h2>
        <p className="text-[var(--foreground-muted)] mb-6">
          We encountered an error loading the census. Don't worry—your progress has been saved 
          and you can try again.
        </p>
        
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg text-left">
            <div className="text-xs font-mono text-[var(--error)]">{error.message}</div>
          </div>
        )}

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
      </motion.div>
    </div>
  )
}
