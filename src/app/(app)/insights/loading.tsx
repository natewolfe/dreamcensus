import { 
  PageHeaderSkeleton, 
  CardSkeleton, 
  StatCardSkeleton 
} from '@/components/ui'

export default function InsightsLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeaderSkeleton />

      <div className="space-y-6">
        {/* Stats Card */}
        <div className="rounded-lg border border-border bg-card-bg p-4 md:p-6">
          <div className="mb-4">
            <CardSkeleton lines={0} showHeader className="border-0 bg-transparent p-0" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>

        {/* Settings Card */}
        <CardSkeleton lines={3} showHeader />
      </div>
    </div>
  )
}
