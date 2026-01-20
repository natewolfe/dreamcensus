'use client'

import Link from 'next/link'
import { Card } from '@/components/ui'

const ACTIONS = [
  { label: 'Record Dream', href: '/today/morning', icon: '☀️', sublabel: 'Morning' },
  { label: 'Census', href: '/census', icon: '📋', sublabel: 'Questions' },
  { label: 'Prompts', href: '/prompts', icon: '💭', sublabel: 'Reflect' },
  { label: 'Alarm', href: '/settings/alarm', icon: '⏰', sublabel: 'Schedule' },
  { label: 'Learn', href: '/learn', icon: '📚', sublabel: 'Explore' },
]

export function QuickActions() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {ACTIONS.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card variant="interactive" padding="md">
              <div className="flex flex-col items-center gap-2 text-center min-h-[80px] justify-center">
                <div className="text-3xl">{action.icon}</div>
                <div>
                  <div className="text-sm font-medium text-foreground">{action.label}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
