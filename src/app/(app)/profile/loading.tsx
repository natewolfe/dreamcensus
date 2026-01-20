import { Skeleton, StatCardSkeleton, CardSkeleton } from '@/components/ui'

export default function ProfileLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 md:px-6 md:pl-3 py-4 md:py-8 md:pb-16 space-y-8">
      {/* Profile Header skeleton - centered avatar with name below */}
      <div className="relative flex flex-col items-center gap-4">
        {/* Share button placeholder (top right) */}
        <Skeleton className="absolute right-0 top-0 h-8 w-16 rounded-md" />
        
        {/* Centered avatar */}
        <Skeleton variant="circular" className="h-24 w-24" />
        
        {/* Name and member since */}
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Stats + Weather Chart wrapper */}
      <div className="flex flex-col gap-2">
        {/* Stats Grid - 4 columns */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Weather Chart skeleton (inline variant - no header) */}
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      {/* Personal Insights Section */}
      <section className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Dream Profile / Progress card */}
          <CardSkeleton lines={4} className="min-h-[220px]" />
          
          {/* Right: Insights Carousel card */}
          <div className="rounded-lg border border-border bg-card-bg p-5 min-h-[220px] flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="circular" className="h-2 w-2" />
                ))}
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="rounded-lg border border-border bg-card-bg p-4 min-h-[80px] flex flex-col items-center justify-center gap-2"
            >
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
