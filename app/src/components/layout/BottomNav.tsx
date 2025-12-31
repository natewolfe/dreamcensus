'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, getActiveNavFromPath, type NavItemId } from '@/lib/navigation'

interface BottomNavProps {
  activeNav?: NavItemId | null
  className?: string
}

export function BottomNav({ activeNav, className = '' }: BottomNavProps) {
  const pathname = usePathname()
  const currentNav = activeNav ?? getActiveNavFromPath(pathname)

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-[var(--background)]/95 backdrop-blur-sm border-t border-[var(--border)] z-[var(--z-bottom-nav)] nav-bottom ${className}`}
      style={{ height: 'var(--nav-bottom-height)' }}
      aria-label="Main navigation"
    >
      <div className="h-full max-w-[600px] mx-auto px-4 py-3 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = currentNav === item.id

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center gap-1 py-3 pb-4 px-3 rounded-lg transition-all
                ${isActive ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-[var(--accent)] rounded-sm -translate-y-1/2" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

