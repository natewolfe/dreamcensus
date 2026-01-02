import { forwardRef } from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', padding = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl border'
    
    const variantStyles = {
      elevated: 'bg-[var(--background-elevated)] border-[var(--border)] shadow-[var(--shadow-soft)]',
      flat: 'bg-[var(--background-elevated)] border-[var(--border)]',
      glass: 'bg-[var(--surface-glass)] border-[var(--border)] backdrop-blur-lg',
    }
    
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

