'use client'

import { type ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { SidebarProvider, useSidebar } from '@/providers/sidebar-provider'
import { AmbientBackground } from '@/components/backgrounds'

export interface AppShellProps {
  children: ReactNode
  showTopBar?: boolean
  topBarTitle?: string
  topBarActions?: ReactNode
}

function AppShellInner({
  children,
  showTopBar = false,
  topBarTitle,
  topBarActions,
}: AppShellProps) {
  // Sidebar context available for future use (e.g., overlay)
  useSidebar()

  return (
    <div className="app-shell flex h-screen flex-col bg-background text-foreground md:flex-row">
      {/* Ambient Background */}
      <AmbientBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden md:block relative z-10">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Top Bar (optional) */}
        {showTopBar && (
          <TopBar title={topBarTitle} actions={topBarActions} />
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden">
          <BottomNav />
        </nav>
      </main>
    </div>
  )
}

export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellInner {...props} />
    </SidebarProvider>
  )
}

