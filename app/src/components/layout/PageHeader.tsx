import Link from 'next/link'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  backHref?: string
  backLabel?: string
  action?: {
    label: string
    href: string
    icon?: string
  }
  subtitle?: string
  children?: ReactNode
  /** Hide header on mobile for immersive views */
  hideOnMobile?: boolean
}

/**
 * Consistent page header component matching Stream's aesthetic
 * - Sticky header with backdrop blur
 * - Optional back button
 * - Optional action button
 */
export function PageHeader({ 
  title, 
  backHref = '/', 
  backLabel = 'Home',
  action,
  subtitle,
  children,
  hideOnMobile = false
}: PageHeaderProps) {
  return (
    <header className={`border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-40 ${hideOnMobile ? 'hidden md:block' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[var(--foreground-muted)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {children}
            {action && (
              <Link
                href={action.href}
                className="px-4 py-2 rounded-lg bg-[var(--accent-muted)]/70 text-white font-medium hover:bg-[var(--accent-muted)] transition-colors flex items-center gap-2"
              >
                {action.icon && <span>{action.icon}</span>}
                <span>{action.label}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

