'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type DataSource = 'collective' | 'personal'

interface DataSourceToggleProps {
  value: DataSource
  size?: 'sm' | 'md' | 'lg'
  disabled?: DataSource[]
  basePath?: string
  preserveParams?: string[]
  className?: string
  /** Optional callback for local state toggle (instead of URL navigation) */
  onChange?: (source: DataSource) => void
}

const SIZE_STYLES = {
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-3 py-1.5 text-md',
  lg: 'py-2 md:py-3 px-3 md:px-4 text-lg md:text-xl',
}

export function DataSourceToggle({ 
  value, 
  size = 'md',
  disabled = [],
  basePath,
  preserveParams = [],
  className,
  onChange,
}: DataSourceToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sizeStyle = SIZE_STYLES[size]

  const handleChange = (source: DataSource) => {
    if (disabled.includes(source)) return
    
    // Use callback if provided (local state mode)
    if (onChange) {
      onChange(source)
      return
    }
    
    // Otherwise use URL navigation
    const path = basePath ?? pathname
    const params = new URLSearchParams()
    
    // Preserve specified params
    preserveParams.forEach((param) => {
      const value = searchParams.get(param)
      if (value) params.set(param, value)
    })
    
    // Set source param
    params.set('source', source)
    
    router.push(`${path}?${params.toString()}`)
  }

  const getButtonStyles = (source: DataSource) => {
    const isActive = value === source
    const isDisabled = disabled.includes(source)

    if (isDisabled) {
      return cn(
        sizeStyle,
        'rounded-md transition-colors cursor-not-allowed',
        'bg-card-bg/30 text-muted/50 border border-border/70'
      )
    }

    return cn(
      sizeStyle,
      'rounded-md font-medium transition-colors',
      isActive
        ? 'bg-accent/20 border border-border/45 text-foreground'
        : 'bg-card-bg/30 text-muted border border-border/70 hover:text-foreground hover:bg-subtle/50'
    )
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <button
        onClick={() => handleChange('collective')}
        disabled={disabled.includes('collective')}
        className={getButtonStyles('collective')}
      >
        Collective
      </button>
      <button
        onClick={() => handleChange('personal')}
        disabled={disabled.includes('personal')}
        className={getButtonStyles('personal')}
      >
        Personal
      </button>
    </div>
  )
}
