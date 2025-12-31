import { AppShell } from '@/components/layout'
import { CaptureWizard } from '@/components/journal/CaptureWizard'

export const metadata = {
  title: 'Capture Dream | Dream Census',
  description: 'Capture your dream',
}

export default function CapturePage() {
  return (
    <AppShell activeNav="journal">
      <div className="min-h-screen flex items-center justify-center px-4">
        <CaptureWizard />
      </div>
    </AppShell>
  )
}

