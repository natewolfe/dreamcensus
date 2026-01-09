'use client'

import { type ReactNode, type ButtonHTMLAttributes, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useEnhancedAnimations } from '@/hooks/use-enhanced-animations'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'special'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  children: ReactNode
  /** When provided, renders as a Link instead of button */
  href?: string
}

const variantStyles = {
  primary: 'bg-accent text-foreground hover:brightness-110 active:brightness-95',
  secondary: 'bg-subtle text-foreground hover:bg-muted',
  ghost: 'bg-transparent hover:bg-subtle',
  danger: 'bg-red-600 text-foreground hover:bg-red-700',
  special: 'relative overflow-hidden text-foreground shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-300',
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
  href,
  ...props
}: ButtonProps) {
  const isLink = !!href && !disabled
  const elementRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const showEffects = useEnhancedAnimations()

  // Mouse tracking for special variant glow effect
  useEffect(() => {
    const element = elementRef.current
    if (!element || variant !== 'special') return

    // Initialize CSS variables
    element.style.setProperty('--mouse-x', '50%')
    element.style.setProperty('--mouse-y', '50%')

    const updateMousePosition = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      element.style.setProperty('--mouse-x', `${x}%`)
      element.style.setProperty('--mouse-y', `${y}%`)
    }

    const handleMouseEnter = (e: MouseEvent) => {
      updateMousePosition(e)
      setIsHovering(true)
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    element.addEventListener('mousemove', updateMousePosition as EventListener)
    element.addEventListener('mouseenter', handleMouseEnter as EventListener)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', updateMousePosition as EventListener)
      element.removeEventListener('mouseenter', handleMouseEnter as EventListener)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [variant])

  const baseClasses = cn(
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium cursor-pointer',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    'active:scale-98',
    // Disabled state (for button)
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    // Mark as button-link to exclude from global <a> styles
    isLink && 'btn-link',
    // Ripple effect for primary and special variants
    showEffects && (variant === 'primary' || variant === 'special') && 'btn-ripple',
    // Variant and size
    variantStyles[variant],
    sizeStyles[size],
    // Full width
    fullWidth && 'w-full',
    // Loading state
    loading && 'pointer-events-none',
    className
  )

  const regularContent = loading ? (
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
  )

  // Special variant with layered effects
  const specialContent = (
    <>
      {/* Animated gradient background */}
      <span
        className="absolute inset-0 animate-special-gradient"
        style={{
          backgroundImage: 'linear-gradient(280deg, var(--special-start), var(--special-mid), var(--special-end))',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Pointer-responsive glow */}
      <span
        className={cn(
          'absolute inset-0 pointer-events-none transition-opacity duration-500 ease-in-out',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: `radial-gradient(circle 340px at var(--mouse-x) var(--mouse-y), color-mix(in oklch, var(--special-glow) 40%, transparent), transparent 90%)`,
        }}
      />

      {/* Shimmer effect */}
      <span
        className="absolute inset-0 animate-special-shimmer"
        style={{
          backgroundImage: 'linear-gradient(260deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Subtle grain texture overlay */}
      <span
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2 font-semibold tracking-wide">
        {loading && <Spinner size="sm" />}
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
    </>
  )

  const content = variant === 'special' ? specialContent : regularContent

  // Render as Link when href is provided
  if (isLink) {
    return (
      <Link
        href={href}
        ref={elementRef as React.RefObject<HTMLAnchorElement>}
        className={baseClasses}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      ref={elementRef as React.RefObject<HTMLButtonElement>}
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {content}
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

