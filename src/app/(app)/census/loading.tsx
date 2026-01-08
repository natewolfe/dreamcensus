import { 
  PageHeaderSkeleton, 
  CardSkeleton, 
  Skeleton 
} from '@/components/ui'

export default function CensusLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 md:px-6 py-8 md:pb-16">
      <div className="mb-6 md:mb-0">
        <PageHeaderSkeleton showSubtitle={false} />
      </div>

      <div className="space-y-8">
        {/* Census Constellation Placeholder */}
        <div className="rounded-xl border border-border bg-card-bg p-6 md:p-8">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>

        {/* Overall Progress Card */}
        <CardSkeleton lines={2} showHeader />

        {/* Section Groups */}
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            {/* Kind header */}
            <div className="flex items-center justify-between w-full bg-subtle/40 px-4 py-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>

            {/* Progress bar */}
            <Skeleton className="h-1 w-full rounded-full mb-4" />

            {/* Section cards */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, sectionIndex) => (
                <CardSkeleton 
                  key={sectionIndex} 
                  lines={2} 
                  showHeader 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
