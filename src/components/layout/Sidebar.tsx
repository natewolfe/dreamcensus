'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import { navIconMap } from './NavIcons'
import { useSidebar } from '@/providers/sidebar-provider'

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()

  return (
    <div className={cn(
      'flex h-full flex-col border-r border-border bg-card-bg transition-all duration-300',
      isOpen ? 'w-64' : 'w-16'
    )}>
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4">
        <Link 
          href="/today" 
          className={cn('flex items-center gap-2', !isOpen && 'justify-center')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <span className="text-lg font-bold">DC</span>
          </div>
          {isOpen && <span className="text-lg font-semibold">Dream Census</span>}
        </Link>
        {isOpen && (
          <button
            onClick={toggle}
            className="rounded p-1 text-muted hover:bg-subtle hover:text-foreground transition-colors"
            aria-label="Collapse sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {/* Expand button when collapsed */}
        {!isOpen && (
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center rounded-lg px-3 py-2.5 text-muted hover:bg-subtle hover:text-foreground transition-colors mb-2"
            aria-label="Expand sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2.5',
                'text-sm font-medium transition-colors duration-150',
                isOpen ? 'gap-3' : 'justify-center',
                isActive
                  ? 'bg-accent/10 text-white'
                  : 'text-muted hover:bg-subtle hover:text-foreground'
              )}
              title={!isOpen ? item.label : undefined}
            >
              {navIconMap[item.icon]}
              {isOpen && item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t border-border p-4">
        <Link
          href="/settings"
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isOpen ? 'gap-3' : 'justify-center',
            pathname?.startsWith('/settings')
              ? 'bg-accent text-white'
              : 'text-muted hover:bg-subtle hover:text-foreground'
          )}
          title={!isOpen ? 'Settings' : undefined}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {isOpen && <span>Settings</span>}
        </Link>
      </div>
    </div>
  )
}

