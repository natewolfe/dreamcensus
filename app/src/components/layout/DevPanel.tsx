'use client'

import { useState } from 'react'
import { devSignOut, devSignOutAndClearData, devCreateFreshSession, devSignInWithEmail } from '@/app/auth/dev-actions'

interface DevPanelProps {
  user?: {
    id: string
    email?: string | null
    displayName?: string | null
  } | null
}

/**
 * Development panel for testing authentication flows
 * Only visible in development mode
 */
export function DevPanel({ user }: DevPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('test@example.com')
  const [isLoading, setIsLoading] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    await devSignOut()
  }

  const handleClearData = async () => {
    if (!confirm('⚠️ This will permanently delete ALL data for the current user. Continue?')) {
      return
    }
    setIsLoading(true)
    await devSignOutAndClearData()
  }

  const handleFreshSession = async () => {
    setIsLoading(true)
    await devCreateFreshSession()
  }

  const handleSignInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await devSignInWithEmail(email)
  }

  return (
    <>
      {/* Floating Dev Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[var(--z-modal)] w-12 h-12 rounded-full bg-yellow-500 text-black font-bold shadow-lg hover:bg-yellow-400 transition-all flex items-center justify-center opacity-0 hover:opacity-100"
        title="Development Panel"
      >
        🛠️
      </button>

      {/* Dev Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--background-elevated)] border-2 border-yellow-500 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-yellow-500">🛠️ Dev Panel</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {/* Current User Status */}
            <div className="mb-6 p-4 bg-[var(--background-subtle)] rounded-lg">
              <div className="text-xs text-[var(--foreground-subtle)] mb-1">Current User</div>
              {user ? (
                <>
                  <div className="text-sm font-mono text-[var(--accent)]">{user.id}</div>
                  {user.email && (
                    <div className="text-sm text-[var(--foreground-muted)] mt-1">{user.email}</div>
                  )}
                  {!user.email && (
                    <div className="text-xs text-[var(--foreground-subtle)] mt-1">Anonymous</div>
                  )}
                </>
              ) : (
                <div className="text-sm text-[var(--foreground-muted)]">No active session</div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Mock Sign In with Email */}
              <form onSubmit={handleSignInWithEmail} className="space-y-2">
                <label className="block text-sm font-medium text-[var(--foreground-muted)]">
                  Mock Sign In with Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium disabled:opacity-50"
                  >
                    Sign In
                  </button>
                </div>
              </form>

              <hr className="border-[var(--border)]" />

              {/* Fresh Anonymous Session */}
              <button
                onClick={handleFreshSession}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium disabled:opacity-50"
              >
                Create Fresh Anonymous Session
              </button>

              {user && (
                <>
                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm font-medium disabled:opacity-50"
                  >
                    Sign Out (Keep Data)
                  </button>

                  {/* Clear All Data */}
                  <button
                    onClick={handleClearData}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium disabled:opacity-50"
                  >
                    ⚠️ Sign Out & Delete All Data
                  </button>
                </>
              )}
            </div>

            {/* Warning */}
            <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-500">
              <strong>Development Only:</strong> This panel is only visible in development mode.
            </div>
          </div>
        </div>
      )}
    </>
  )
}

