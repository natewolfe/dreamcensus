'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyCode } from '@/app/auth/actions'

export function VerificationCode() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Auto-verify when all 6 digits are entered
    if (code.every((d) => d !== '')) {
      handleVerify()
    }
  }, [code])

  const handleVerify = async () => {
    const codeString = code.join('')
    if (codeString.length !== 6) return

    setError(null)
    setIsLoading(true)

    try {
      const result = await verifyCode({ code: codeString })
      
      if (result.success) {
        if (result.needsOnboarding) {
          router.push('/auth/onboarding')
        } else {
          router.push('/profile')
        }
      } else {
        setError(result.error || 'Invalid code')
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-medium bg-[var(--background-elevated)] border-2 border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
            disabled={isLoading}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {error && (
        <div className="p-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg text-sm text-[var(--error)] text-center">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      <div className="text-center space-y-2">
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Use a different email
        </button>
        <div className="text-sm text-[var(--foreground-subtle)]">
          Didn't receive it? Check spam or try again
        </div>
      </div>
    </div>
  )
}

