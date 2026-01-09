import { 
  Skeleton, 
  PageHeaderSkeleton, 
  RitualCardSkeleton,
  CardSkeleton,
} from '@/components/ui'

export default function TodayLoading() {
  return (
    <div id="main-content" className="container mx-auto mb-16 max-w-4xl px-4 md:px-6 md:pl-3 py-4 md:py-6">
      {/* Week Summary Skeleton */}
      <section className="mb-10" aria-label="Loading week summary">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="relative flex flex-1 items-start justify-between px-1 sm:px-3">
            {/* Track line placeholder */}
            <div 
              className="pointer-events-none absolute inset-x-6 sm:inset-x-8 h-[2px] bg-subtle/20"
              style={{ top: 'calc(1rem + 14px + 10px)' }}
            />
            
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center min-w-[2rem] sm:min-w-[2.5rem]">
                <Skeleton className="h-3 w-4 sm:w-6 mb-3.5" />
                <Skeleton variant="circular" className="h-5 w-5" />
              </div>
            ))}
          </div>
          
          {/* Streak skeleton */}
          <Skeleton className="h-14 w-16 rounded-lg" />
        </div>
      </section>

      {/* Page Header + Alarm Widget */}
      <div className="flex flex-row items-end justify-between mb-6">
        <PageHeaderSkeleton showSubtitle={false} />
        <Skeleton className="h-12 w-20 rounded-lg" />
      </div>

      <div className="space-y-10">
        {/* Ritual Cards */}
        <section className="flex flex-row gap-3" aria-label="Loading rituals">
          <RitualCardSkeleton />
          <RitualCardSkeleton />
        </section>

        {/* Prompts + Insights Section */}
        <section className="flex flex-col-reverse md:flex-row gap-5">
          {/* Insights skeleton */}
          <div className="w-full md:w-4/9">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
          
          {/* Prompts stack skeleton */}
          <div className="w-full md:max-w-5/9">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </section>

        {/* Weather Chart Skeleton */}
        <CardSkeleton lines={0} className="h-48" />

        {/* Dream School Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-36 rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
