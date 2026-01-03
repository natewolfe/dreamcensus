import { type ReactNode, type ElementType } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'ghost' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: ElementType
  className?: string
  children: ReactNode
  onClick?: () => void
}

const variantStyles = {
  elevated: 'bg-card-bg border border-border shadow-md',
  outlined: 'bg-transparent border border-border',
  ghost: 'bg-card-bg/50 border-0',
  interactive:
    'bg-card-bg border border-border shadow-md hover:shadow-lg transition-shadow cursor-pointer',
}

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  as: Component = 'div',
  className,
  children,
  onClick,
}: CardProps) {
  return (
    <Component
      className={cn(
        'w-full rounded-lg text-left',
        variantStyles[variant],
        paddingStyles[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}

