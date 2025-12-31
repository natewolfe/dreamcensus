import { ReactNode } from 'react'

interface ContentContainerProps {
  children: ReactNode
  /** Max width constraint - defaults to 6xl for consistency */
  maxWidth?: 'full' | '4xl' | '5xl' | '6xl' | '7xl'
  /** Custom padding override - defaults to px-4 py-8 */
  className?: string
}

/**
 * Shared content container for consistent page layouts
 * - Provides standard max-width and padding
 * - Ensures all main pages have harmonized spacing
 * - Responsive: maintains padding on mobile, centers on desktop
 */
export function ContentContainer({ 
  children, 
  maxWidth = '6xl',
  className 
}: ContentContainerProps) {
  // Static class mapping for Tailwind JIT - template literals don't work
  const maxWidthClasses = {
    'full': '',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-5xl',
    '7xl': 'max-w-7xl'
  }
  
  const maxWidthClass = maxWidthClasses[maxWidth]
  const defaultPadding = 'px-4 py-8'
  const finalClassName = className || defaultPadding
  
  return (
    <div className={`${maxWidthClass} mx-auto ${finalClassName}`}>
      {children}
    </div>
  )
}

