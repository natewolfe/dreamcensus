'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input, PinInput } from '@/components/ui'
import { sendAuthCode, verifyAuthCode, resetUserDatabase } from '@/app/(auth)/actions'

type AuthStep = 'email' | 'code' | 'loading'

interface AuthFlowProps {
  /** Whether this is a new user signup (Get Started) or returning user (Sign In) */
  mode: 'signup' | 'signin'
}

export function AuthFlow({ mode }: AuthFlowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const isNewUser = mode === 'signup'

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      // For "Get Started", reset the database first
      if (isNewUser) {
        setIsResetting(true)
        const resetResult = await resetUserDatabase()
        setIsResetting(false)
        if (!resetResult.success) {
          setError(resetResult.error ?? 'Failed to prepare fresh environment')
          return
        }
      }

      const result = await sendAuthCode(email, isNewUser)
      if (result.success) {
        setStep('code')
      } else {
        setError(result.error ?? 'Failed to send code')
      }
    })
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    verifyCode(code)
  }

  const verifyCode = (codeToVerify: string) => {
    setError(null)

    startTransition(async () => {
      setStep('loading')
      const result = await verifyAuthCode(email, codeToVerify)
      if (result.success && result.data.redirectTo) {
        router.push(result.data.redirectTo)
      } else {
        setStep('code')
        setError(result.error ?? 'Verification failed')
      }
    })
  }

  const handlePinComplete = (completedCode: string) => {
    verifyCode(completedCode)
  }

  const handleResendCode = () => {
    setCode('')
    setError(null)
    startTransition(async () => {
      const result = await sendAuthCode(email, isNewUser)
      if (!result.success) {
        setError(result.error ?? 'Failed to resend code')
      }
    })
  }

  const handleBack = () => {
    setStep('email')
    setCode('')
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md" padding="lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-foreground">
              <span className="text-2xl font-bold">DC</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            {isNewUser ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {step === 'email'
              ? isNewUser
                ? 'Start your dream journey with a fresh account'
                : 'Sign in to continue your dream journey'
              : 'Enter the confirmation code'}
          </p>
        </div>

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 rounded-lg p-3">
                {error}
              </p>
            )}

            {isNewUser && (
              <p className="text-xs text-muted bg-surface rounded-lg p-3">
                ⚠️ <strong>Get Started</strong> creates a fresh account and clears
                any existing demo data for testing purposes.
              </p>
            )}

            <Button fullWidth type="submit" disabled={isPending}>
              {isPending
                ? isResetting
                  ? 'Preparing fresh environment...'
                  : 'Sending code...'
                : 'Continue with Email'}
            </Button>
          </form>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="rounded-lg bg-accent/10 p-4 text-center">
              <p className="text-sm text-muted mb-1">Demo mode: Your code is</p>
              <p className="text-3xl font-mono font-bold tracking-widest text-accent">
                123456
              </p>
            </div>

            <div className="py-2">
              <PinInput
                length={6}
                value={code}
                onChange={setCode}
                onComplete={handlePinComplete}
                error={error ?? undefined}
                disabled={isPending}
                autoFocus
                label="Enter your 6-digit confirmation code"
                size="lg"
              />
            </div>

            <p className="text-xs text-muted text-center">
              We sent a code to <strong>{email}</strong>
            </p>

            <Button fullWidth type="submit" disabled={isPending || code.length !== 6}>
              {isPending ? 'Verifying...' : 'Verify & Continue'}
            </Button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={handleBack}
                className="text-muted hover:text-foreground transition-colors"
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isPending}
                className="text-accent hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Loading Step */}
        {step === 'loading' && (
          <div className="py-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
            <p className="text-muted">
              {isNewUser ? 'Creating your account...' : 'Signing you in...'}
            </p>
          </div>
        )}

        {/* Footer Link */}
        {step !== 'loading' && (
          <div className="mt-6 text-center text-sm">
            {isNewUser ? (
              <>
                <span className="text-muted">Already have an account? </span>
                <a href="/login" className="text-accent hover:underline">
                  Sign in
                </a>
              </>
            ) : (
              <>
                <span className="text-muted">Don&apos;t have an account? </span>
                <a href="/onboarding" className="text-accent hover:underline">
                  Get started
                </a>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

