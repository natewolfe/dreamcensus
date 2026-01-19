'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { Card, Button, Input, PinInput } from '@/components/ui'
import { sendAuthCode, verifyAuthCode, resetUserDatabase } from '@/app/(auth)/actions'

type AuthStep = 'email' | 'code' | 'loading'

interface AuthFlowProps {
  /** Whether this is a new user signup (Get Started) or returning user (Sign In) */
  mode: 'signup' | 'signin'
}

export function AuthFlow({ mode }: AuthFlowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const isNewUser = mode === 'signup'
  const returnTo = searchParams.get('returnTo')

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
      if (result.success) {
        // Use returnTo if specified, otherwise use the default redirect
        const destination = returnTo || result.data.redirectTo
        router.push(destination)
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
    <div className="min-h-screen bg-[#040508] text-[#e8eaf6] flex items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(149, 117, 205, 0.15) 0%, transparent 60%)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-xl"
      >
        <Card className="bg-[#0c0e1a]/80 backdrop-blur-sm border-[#262942]" padding="lg">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-xl blur-xl"
                  style={{ background: 'radial-gradient(circle, rgba(176, 147, 255, 0.3) 0%, transparent 70%)' }}
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold">
              {isNewUser ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm text-[#7986cb]">
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
                <p className="text-sm text-red-400 bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                  {error}
                </p>
              )}

              {isNewUser && (
                <p className="text-xs text-[#7986cb] bg-[#13152a] rounded-xl p-3 border border-[#262942]">
                  ⚠️ <strong>Get Started</strong> creates a fresh account and clears
                  any existing demo data for testing purposes.
                </p>
              )}

              <Button fullWidth type="submit" disabled={isPending} size="lg">
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
              <div className="rounded-xl bg-[#b093ff]/10 p-4 text-center border border-[#b093ff]/20">
                <p className="text-sm text-[#7986cb] mb-1">Demo mode: Your code is</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-[#b093ff]">
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

              <p className="text-xs text-[#7986cb] text-center">
                We sent a code to <strong className="text-[#e8eaf6]">{email}</strong>
              </p>

              <Button fullWidth type="submit" disabled={isPending || code.length !== 6} size="lg">
                {isPending ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-[#7986cb] hover:text-[#e8eaf6] transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isPending}
                  className="text-[#b093ff] hover:text-[#c5b3ff] transition-colors disabled:opacity-50"
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
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#b093ff] border-t-transparent" />
              </div>
              <p className="text-[#7986cb]">
                {isNewUser ? 'Creating your account...' : 'Signing you in...'}
              </p>
            </div>
          )}

          {/* Footer Link */}
          {step !== 'loading' && (
            <div className="mt-6 text-center text-sm">
              {isNewUser ? (
                <>
                  <span className="text-[#7986cb]">Already have an account? </span>
                  <a href="/login" className="text-[#b093ff] hover:text-[#c5b3ff] transition-colors">
                    Sign in
                  </a>
                </>
              ) : (
                <>
                  <span className="text-[#7986cb]">Don&apos;t have an account? </span>
                  <a href="/onboarding" className="text-[#b093ff] hover:text-[#c5b3ff] transition-colors">
                    Get started
                  </a>
                </>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
