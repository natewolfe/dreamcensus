import { AppShell } from '@/components/layout'
import { EmailInput } from '@/components/auth/EmailInput'

export const metadata = {
  title: 'Sign In | Dream Census',
  description: 'Sign in to your account',
}

export default function SignInPage() {
  return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌙</div>
            <h1 className="text-3xl font-medium mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>
              Save Your Dream Journey
            </h1>
            <p className="text-[var(--foreground-muted)]">
              Sign in to sync your progress across devices
            </p>
          </div>
          
          <EmailInput />
          
          <p className="text-center text-sm text-[var(--foreground-subtle)] mt-6">
            We'll send you a magic link to sign in.
            <br />
            No password needed.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

