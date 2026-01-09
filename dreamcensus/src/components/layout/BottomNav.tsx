'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import { navIconMapLarge } from './NavIcons'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="border-t border-border bg-card-bg">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3',
                'transition-colors duration-150',
                'min-h-[64px]', // Touch target
                isActive
                  ? 'text-accent'
                  : 'text-muted hover:text-foreground'
              )}
            >
              {navIconMapLarge[item.icon]}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

