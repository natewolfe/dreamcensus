import { type ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-shrink-0">
        <h1 className="text-2xl md:text-4xl font-bold">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-muted hidden md:block">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

