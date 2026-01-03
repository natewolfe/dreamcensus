import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  children: ReactNode
}

const variantStyles = {
  primary: 'bg-accent text-white hover:brightness-110 active:brightness-95',
  secondary: 'bg-subtle text-foreground hover:bg-muted',
  ghost: 'bg-transparent hover:bg-subtle',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-10 px-5 text-base',
  lg: 'h-14 px-6 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'rounded-lg font-medium',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        'active:scale-98',
        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        // Variant and size
        variantStyles[variant],
        sizeStyles[size],
        // Full width
        fullWidth && 'w-full',
        // Loading state
        loading && 'pointer-events-none',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  )
}

function Spinner({ size }: { size: 'sm' | 'md' }) {
  return (
    <svg
      className={cn(
        'animate-spin',
        size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

