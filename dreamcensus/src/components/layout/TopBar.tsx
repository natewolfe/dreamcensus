import { type ReactNode } from 'react'

export interface TopBarProps {
  title?: string
  actions?: ReactNode
}

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card-bg px-6">
      {title && (
        <h1 className="text-xl font-semibold">{title}</h1>
      )}
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  )
}

