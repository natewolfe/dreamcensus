import { Suspense } from 'react'
import { AppShell } from '@/components/layout'
import { VerificationCode } from '@/components/auth/VerificationCode'

export const metadata = {
  title: 'Verify Email | Dream Census',
  description: 'Verify your email address',
}

function VerifyContent() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✉️</div>
          <h1 className="text-3xl font-medium mb-2">Check your email</h1>
          <p className="text-[var(--foreground-muted)]">
            We sent a link to your email address
          </p>
        </div>
        
        <VerificationCode />
        
        <div className="text-center mt-6">
          <p className="text-sm text-[var(--foreground-subtle)] mb-2">
            Or enter the 6-digit code:
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </AppShell>
  )
}

