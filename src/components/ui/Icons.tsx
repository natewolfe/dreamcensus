import { cn } from '@/lib/utils'

interface IconProps {
  className?: string
  'aria-hidden'?: boolean
}

export function ChevronLeft({ className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden={ariaHidden}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

export function ChevronRight({ className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden={ariaHidden}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function UndoIcon({ className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden={ariaHidden}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13a9 9 0 1 0 2.64-6.36L3 9" />
    </svg>
  )
}

export function ListIcon({ className, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden={ariaHidden}
    >
      <line x1="8" y1="6" x2="21" y2="6" strokeWidth={2} strokeLinecap="round" />
      <line x1="8" y1="12" x2="21" y2="12" strokeWidth={2} strokeLinecap="round" />
      <line x1="8" y1="18" x2="21" y2="18" strokeWidth={2} strokeLinecap="round" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}
