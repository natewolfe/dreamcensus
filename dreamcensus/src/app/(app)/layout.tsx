import { AppShell } from '@/components/layout'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login')
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  )
}

