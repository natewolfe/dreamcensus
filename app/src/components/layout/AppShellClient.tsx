'use client'

import { ReactNode, useState, useEffect } from 'react'
import { type NavItemId } from '@/lib/navigation'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { DevPanel } from './DevPanel'

interface AppShellClientProps {
  children: ReactNode
  activeNav?: NavItemId | null
  centered?: boolean
  user?: {
    id: string
    email?: string | null
    displayName?: string | null
  } | null
}

/**
 * Client-side app shell that manages sidebar state.
 * - Desktop: Sidebar with logo, nav, and profile. No top bar.
 * - Mobile: Top bar with logo/user, bottom nav for navigation.
 */
export function AppShellClient({ children, activeNav, centered = false, user }: AppShellClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true')
    }
  }, [])

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const newValue = !prev
      localStorage.setItem('sidebar-collapsed', String(newValue))
      return newValue
    })
  }

  return (
    <div className="app-shell">
      {/* Mobile: Top bar with logo and user menu - HIDDEN per user request */}
      {/* <TopBar user={user} /> */}
      
      {/* Desktop: Full sidebar with logo, nav, and profile */}
      <Sidebar 
        activeNav={activeNav} 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        user={user}
        className="desktop-only" 
      />
      
      <main className={`app-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${centered ? 'centered' : ''}`}>
        {children}
      </main>
      
      {/* Mobile: Bottom navigation */}
      <BottomNav 
        activeNav={activeNav}
        className="mobile-only" 
      />

      {/* Development Panel (only visible in dev mode) */}
      <DevPanel user={user} />
    </div>
  )
}
