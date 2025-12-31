'use client'

import Link from 'next/link'
import { UserMenu } from './UserMenu'

interface TopBarProps {
  user?: {
    id: string
    email?: string | null
    displayName?: string | null
  } | null
}

/**
 * Mobile-only top bar with logo and user menu.
 * On desktop, the Sidebar handles navigation and branding.
 */
export function TopBar({ user }: TopBarProps) {
  return (
    <header
      className="mobile-only fixed top-0 left-0 right-0 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border)] z-[var(--z-top-bar)]"
      style={{ height: 'var(--nav-top-height)' }}
    >
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-medium text-[var(--foreground)]"
        >
          <span className="text-2xl">🌙</span>
          <span style={{ fontFamily: 'var(--font-family-display)' }}>
            Dream Census
          </span>
        </Link>

        {/* Right: User Menu */}
        <UserMenu user={user} />
      </div>
    </header>
  )
}
