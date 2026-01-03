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

