import { type ReactNode, type ElementType } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'dashed' | 'ghost' | 'plain' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: ElementType
  className?: string
  children: ReactNode
  onClick?: () => void
}

const variantStyles = {
  elevated: 'bg-muted/10 border border-muted/40',
  outlined: 'bg-transparent border border-border/50',
  dashed: 'bg-transparent border border-border/50 border-dashed',
  ghost: 'bg-card-bg/50 border-0',
  plain: 'bg-transparent border-0',
  interactive:
    'bg-card-bg border border-border hover:shadow-lg transition-all duration-300 cursor-pointer',
}

const paddingStyles = {
  none: 'p-0',
  sm: 'p-2 md:p-3',
  md: 'p-3 md:p-4',
  lg: 'p-4 md:p-6',
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

