import { Suspense } from 'react'
import { AppShell } from '@/components/layout'
import { SettingsForm } from '@/components/profile/SettingsForm'

export const metadata = {
  title: 'Settings | Dream Census',
  description: 'Account settings',
}

export default function ProfileSettingsPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-medium mb-8" style={{ fontFamily: 'var(--font-family-display)' }}>
          Settings
        </h1>

        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <SettingsForm />
        </Suspense>
      </div>
    </AppShell>
  )
}

