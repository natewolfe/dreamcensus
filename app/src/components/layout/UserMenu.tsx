'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { devSignOut } from '@/app/auth/dev-actions'

interface UserMenuProps {
  user?: {
    id: string
    email?: string | null
    displayName?: string | null
  } | null
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!user || !user.email) {
    // Not signed in
    return (
      <Link
        href="/auth/signin"
        className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        Sign In
      </Link>
    )
  }

  // Signed in
  const initials = user.displayName
    ? user.displayName.substring(0, 2).toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || '??'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
        <span className="text-sm text-[var(--foreground-muted)] max-w-[100px] truncate hidden sm:block">
          {user.displayName || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg shadow-lg z-[var(--z-modal)] animate-fade-in">
          <div className="py-2">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/profile/settings"
              className="block px-4 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <hr className="my-2 border-[var(--border)]" />
            <button
              onClick={async () => {
                setIsOpen(false)
                await devSignOut()
              }}
              className="block w-full text-left px-4 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

