import { 
  PageHeaderSkeleton, 
  CardSkeleton, 
  Skeleton 
} from '@/components/ui'

export default function LearnLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 md:px-6 py-8 md:pb-16">
      <PageHeaderSkeleton />

      <div className="space-y-8">
        {/* Introduction Card */}
        <CardSkeleton lines={3} className="bg-gradient-to-br from-accent/5 to-transparent border-dashed" />

        {/* Topics Section */}
        <section aria-label="Loading topics" className="space-y-3">
          <div>
            <Skeleton className="h-5 w-24 mb-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card-bg p-2 md:p-3">
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton variant="circular" className="h-8 w-8" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex flex-row items-end justify-end mt-auto pt-2 w-full border-t border-border/50">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon Card */}
        <CardSkeleton lines={2} className="bg-transparent" />
      </div>
    </div>
  )
}
