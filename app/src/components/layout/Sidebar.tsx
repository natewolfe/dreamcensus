'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, getActiveNavFromPath, type NavItemId } from '@/lib/navigation'

interface SidebarProps {
  activeNav?: NavItemId | null
  collapsed?: boolean
  className?: string
  onToggle?: () => void
  user?: {
    id: string
    email?: string | null
    displayName?: string | null
  } | null
}

export function Sidebar({ 
  activeNav, 
  collapsed = false, 
  className = '',
  onToggle,
  user 
}: SidebarProps) {
  const pathname = usePathname()
  const currentNav = activeNav ?? getActiveNavFromPath(pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 bg-[var(--background-subtle)] border-r border-[var(--border)] z-[var(--z-sidebar)] transition-all flex flex-col ${className}`}
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
      }}
      aria-label="Sidebar navigation"
    >
      {/* Logo + Toggle section */}
      <div className={`flex items-center gap-2 p-3 border-b border-[var(--border)] ${collapsed ? 'justify-center' : 'justify-start'}`}>
        {/* Menu toggle button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="5" x2="17" y2="5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="15" x2="17" y2="15" />
            </svg>
          </button>
        )}
        
        {/* Logo */}
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-[var(--foreground)] overflow-hidden"
          >
            <span 
              className="truncate"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              Dream Census
            </span>
          </Link>
        )}
        
        {/* Show only logo when collapsed */}
        {collapsed && !onToggle && (
          <Link href="/" className="text-xl" aria-label="Dream Census Home">
            🌙
          </Link>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 pr-0 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentNav === item.id

          return (
            <div key={item.id}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-2 py-3 rounded-lg rounded-r-none transition-all
                  ${
                    isActive
                      ? 'bg-[var(--background-elevated)] text-[var(--foreground)]'
                      : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-[var(--foreground-subtle)] truncate">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
              
              {/* New Entry button under Journal */}
              {item.id === 'journal' && !collapsed && (
                <Link
                  href="/journal/capture"
                  className="flex items-center justify-center gap-2 px-3 pl-1 py-2.5 mt-2 mr-3 rounded-lg transition-all font-semibold text-sm bg-[var(--accent-muted)]/70 text-white hover:bg-[var(--accent-muted)] shadow-sm"
                >
                  <span>✨</span>
                  <span>New Entry</span>
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* Profile/User section at bottom */}
      <div className="mt-auto border-t border-[var(--border)] p-1">
        {user ? (
          // Logged in user
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`
                w-full flex items-center gap-2 px-3 py-3 rounded-lg transition-all
                text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-sm flex-shrink-0">
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '👤'}
              </div>
              
              {!collapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.displayName || user.email || 'User'}
                    </div>
                  </div>
                  
                  {/* Ellipsis menu button */}
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    className="flex-shrink-0"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </>
              )}
            </button>

            {/* Dropdown menu */}
            {menuOpen && !collapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  View Profile
                </Link>
                <Link
                  href="/profile/settings"
                  className="block px-4 py-3 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-subtle)] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <hr className="border-[var(--border)]" />
                <button
                  className="w-full text-left px-4 py-3 text-sm text-[var(--error)] hover:bg-[var(--background-subtle)] transition-colors"
                  onClick={() => {
                    setMenuOpen(false)
                    // TODO: Implement sign out
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          // Guest mode
          <div className={`
            flex items-center gap-3 px-1 py-3 pr-0 rounded-lg
            ${collapsed ? 'justify-center flex-col' : ''}
          `}>
            {/* Guest avatar */}
            <div className="w-8 h-8 rounded-full bg-[var(--background-elevated)] border border-[var(--border)] flex items-center justify-center text-sm flex-shrink-0">
              👤
            </div>
            
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--foreground-muted)]">Guest</div>
                </div>
                
                <Link
                  href="/auth/signin"
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--accent-muted)]/70 text-white hover:bg-[var(--accent-muted)] transition-colors flex-shrink-0"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
