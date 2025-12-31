import { AppShell } from '@/components/layout'
import { OnboardingWizard } from '@/components/auth/OnboardingWizard'

export const metadata = {
  title: 'Welcome | Dream Census',
  description: 'Complete your profile',
}

export default function OnboardingPage() {
  return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <OnboardingWizard />
      </div>
    </AppShell>
  )
}

