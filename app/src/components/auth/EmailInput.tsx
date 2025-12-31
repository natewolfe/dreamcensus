'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendMagicLink } from '@/app/auth/actions'

export function EmailInput() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await sendMagicLink({ email })
      
      if (result.success) {
        router.push('/auth/verify')
      } else {
        setError(result.error || 'Failed to send magic link')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-6 py-4 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl text-lg focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full btn btn-primary text-lg py-4"
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Magic Link'}
      </button>
    </form>
  )
}

