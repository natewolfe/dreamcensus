import { ReactNode } from 'react'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { type NavItemId } from '@/lib/navigation'
import { AppShellClient } from './AppShellClient'

interface AppShellProps {
  children: ReactNode
  activeNav?: NavItemId | null
  centered?: boolean
}

/**
 * Main app shell - Server Component wrapper that fetches user data
 * Note: Only reads session, doesn't create one (to avoid cookie setting errors)
 */
export async function AppShell({ children, activeNav, centered = false }: AppShellProps) {
  // Only read existing session, don't create new one
  const session = await getSession()
  
  let user = null
  if (session) {
    user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    })
  }

  return (
    <AppShellClient activeNav={activeNav} centered={centered} user={user}>
      {children}
    </AppShellClient>
  )
}

