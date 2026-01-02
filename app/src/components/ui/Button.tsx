'use client'

import { forwardRef } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      variant = 'primary', 
      size = 'md', 
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props 
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantStyles = {
      primary: 'bg-[var(--accent-muted)] text-white border-[var(--accent-muted)] hover:bg-[var(--accent)] hover:border-[var(--accent)] shadow-[var(--shadow-glow)]',
      secondary: 'bg-transparent text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--border-focus)] hover:text-[var(--foreground)]',
      ghost: 'bg-transparent text-[var(--foreground-muted)] border-transparent hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]',
      danger: 'bg-[var(--error)] text-white border-[var(--error)] hover:bg-[var(--error)]/90',
      success: 'bg-[var(--success)] text-white border-[var(--success)] hover:bg-[var(--success)]/90',
      accent: 'bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-glow)]',
    }
    
    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2.5',
      lg: 'text-lg px-6 py-3.5',
    }
    
    const widthStyles = fullWidth ? 'w-full' : ''
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

