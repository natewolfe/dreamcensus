'use client'

import { motion } from 'motion/react'
import { Button } from './ui'

export interface ErrorDisplayProps {
  error?: Error & { digest?: string }
  title?: string
  message?: string
  icon?: string
  onRetry?: () => void
  showHomeLink?: boolean
  showError?: boolean
}

export function ErrorDisplay({
  error,
  title = 'Something went wrong',
  message = 'We encountered an error. Please try again.',
  icon = '🌙',
  onRetry,
  showHomeLink = true,
  showError = true,
}: ErrorDisplayProps) {
  // Log error in development
  if (process.env.NODE_ENV === 'development' && error) {
    console.error('Error:', error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-[var(--space-page)]">
      <motion.div 
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Icon with glow effect */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 bg-[var(--accent)]/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative text-6xl flex items-center justify-center h-full">
            {icon}
          </div>
        </div>

        <h2 className="text-2xl font-medium mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>
          {title}
        </h2>
        <p className="text-[var(--foreground-muted)] mb-6">
          {message}
        </p>
        
        {/* Show error details in development */}
        {showError && process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg text-left">
            <div className="text-xs font-mono text-[var(--error)] break-all">
              {error.message}
            </div>
            {error.digest && (
              <div className="text-xs font-mono text-[var(--foreground-muted)] mt-2">
                Digest: {error.digest}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="primary">
              Try again
            </Button>
          )}
          {showHomeLink && (
            <Button 
              onClick={() => window.location.href = '/'}
              variant="secondary"
            >
              Go home
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

