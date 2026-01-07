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
      'flex h-full flex-col border-r border-border/30 bg-background transition-all duration-300',
      isOpen ? 'w-50' : 'w-16'
    )}>
      {/* Logo & Toggle */}
      {isOpen ? (
        <div className="flex items-center justify-between p-2 pt-3 pb-1">
          <div className="flex items-center gap-1">
            <Link 
              href="/today"
              className="nav-link flex px-2 py-2 gap-3 shrink-0 items-center justify-center rounded-md text-foreground transition-colors"
            >
              <span className="text-lg font-bold">🌙</span>
              <span className="whitespace-nowrap text-md font-semibold">
                T I D E S
              </span>
            </Link>
          </div>
          
          <button
            onClick={toggle}
            className="flex items-center justify-center rounded-md px-3 py-3 text-muted opacity-50 hover:opacity-100 hover:bg-subtle/30 transition-all duration-150"
            aria-label="Collapse sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={toggle}
            className="group/expand flex w-full items-center justify-center rounded-md px-3 py-2 text-muted hover:bg-subtle/30 transition-colors duration-150"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <span className="relative flex items-center justify-center">
              <span className="text-lg transition-opacity group-hover/expand:opacity-0">🌙</span>
              <svg 
                className="absolute h-5 w-5 opacity-0 transition-opacity group-hover/expand:opacity-100"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-2">
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-link group flex items-center rounded-md px-3 py-2.5',
                'text-sm font-medium transition-all duration-200',
                isOpen ? 'gap-3' : 'justify-center',
                isActive
                  ? 'bg-subtle/20 text-foreground'
                  : 'text-muted hover:bg-subtle/20 opacity-80 hover:opacity-100'
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
      <div className="border-t border-border/30 p-2">
        <Link
          href="/settings"
          className={cn(
            'nav-link flex w-full items-center rounded-md px-1 py-2 text-sm font-medium transition-colors',
            isOpen ? 'gap-3' : 'justify-center',
            pathname?.startsWith('/settings')
              ? 'text-foreground'
              : 'text-muted hover:bg-subtle/30'
          )}
          title={!isOpen ? 'Settings' : undefined}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle/30">
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

