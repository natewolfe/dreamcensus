import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 text-muted', className)}>
      <div className="mb-4 text-6xl" role="img" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      {description && <p className="text-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}
