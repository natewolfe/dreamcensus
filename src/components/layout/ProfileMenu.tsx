'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/(auth)/actions'

interface ProfileMenuProps {
  isExpanded: boolean
}

export function ProfileMenu({ isExpanded }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ bottom: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPosition({
        // Position menu's bottom edge 8px above trigger's top
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
      })
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    await signOut()
  }

  const menuItems = [
    { label: 'Profile', href: '/settings', icon: UserIcon },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ]

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'nav-link flex w-full items-center rounded-md px-1 py-2 text-sm font-medium transition-colors',
          isExpanded ? 'gap-3' : 'justify-center',
          'text-muted hover:bg-subtle/30'
        )}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle/30">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        {isExpanded && <span>Account</span>}
      </button>

      {/* Dropdown Menu - rendered via portal to escape sidebar clipping */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'fixed z-50 min-w-[180px]',
                'bg-card-bg border border-border rounded-lg shadow-lg overflow-hidden'
              )}
              style={{
                bottom: menuPosition.bottom,
                left: menuPosition.left,
              }}
              role="menu"
            >
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-subtle/30 transition-colors"
                  role="menuitem"
                >
                  <item.icon className="h-4 w-4 text-muted" />
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-border" />
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-subtle/30 transition-colors cursor-pointer"
                role="menuitem"
              >
                <LogoutIcon className="h-4 w-4" />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

// Inline icons to keep menu self-contained
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
