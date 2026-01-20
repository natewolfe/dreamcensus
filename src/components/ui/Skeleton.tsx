import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-subtle/30',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function DreamCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card-bg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="60%" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
            <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
          </div>
        </div>
        <Skeleton variant="rectangular" width={60} height={20} />
      </div>
    </div>
  )
}

export function WeatherChartSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="rectangular" className="flex-1" height={24} />
          <Skeleton variant="text" width={40} />
        </div>
      ))}
    </div>
  )
}

// Page header skeleton - matches PageHeader component
export function PageHeaderSkeleton({ 
  showActions = false,
  showSubtitle = true,
}: { 
  showActions?: boolean
  showSubtitle?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-shrink-0 space-y-2">
        <Skeleton className="h-8 md:h-10 w-40 md:w-56" />
        {showSubtitle && (
          <Skeleton className="h-4 w-28 md:w-40 hidden md:block" />
        )}
      </div>
      {showActions && <Skeleton className="h-10 w-24 rounded-lg" />}
    </div>
  )
}

// Generic card skeleton
export function CardSkeleton({ 
  lines = 3,
  showHeader = false,
  className,
}: { 
  lines?: number
  showHeader?: boolean
  className?: string
}) {
  return (
    <div className={cn(
      'rounded-lg border border-border bg-card-bg p-4 md:p-6 space-y-3',
      className
    )}>
      {showHeader && <Skeleton className="h-5 w-32 mb-4" />}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={cn(
            'h-4',
            i === 0 && 'w-3/4',
            i > 0 && i < lines - 1 && 'w-full',
            i === lines - 1 && 'w-1/2'
          )} 
        />
      ))}
    </div>
  )
}

// Stat/metric card skeleton
export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/50 bg-transparent p-3 md:p-4">
      <div className="flex flex-col items-center gap-2 py-1">
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

// Section wrapper skeleton
export function SectionSkeleton({ 
  title = true,
  children,
}: { 
  title?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      {title && <Skeleton className="h-5 w-32" />}
      {children}
    </div>
  )
}

// Ritual card skeleton (Today page)
export function RitualCardSkeleton() {
  return (
    <div className="flex-1 min-w-0 rounded-lg border border-border bg-card-bg p-4 md:p-6 min-h-[180px] flex flex-col justify-between">
      <div className="flex flex-col items-center gap-3">
        <Skeleton variant="circular" className="h-10 w-10" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex justify-center mt-4">
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  )
}

// Settings link card skeleton
export function SettingsLinkSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card-bg p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  )
}
