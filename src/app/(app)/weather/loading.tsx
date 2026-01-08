import { 
  PageHeaderSkeleton, 
  WeatherChartSkeleton,
  CardSkeleton,
  StatCardSkeleton,
  Skeleton,
} from '@/components/ui'

export default function WeatherLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-6xl px-4 md:px-6 py-8 pb-16">
      {/* Header with time range selector */}
      <div className="flex items-end justify-between mb-8 md:mb-6">
        <div className="flex items-center flex gap-2">
          <Skeleton className="h-12 md:h-14 w-28 rounded-sm" />
          <Skeleton className="h-12 md:h-14 w-28 rounded-sm" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Hero weather chart */}
      <section className="mb-8">
        <CardSkeleton lines={0} className="h-64" />
      </section>

      {/* Key metrics grid */}
      <div className="grid grid-cols-[minmax(140px,28%)_1fr] gap-6 mb-8">
        <Skeleton className="h-24 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>

      {/* Two column: Emotions + Community pulse */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CardSkeleton lines={5} showHeader />
        </div>
        <div className="space-y-4">
          <CardSkeleton lines={4} showHeader />
          <CardSkeleton lines={2} />
        </div>
      </div>

      {/* Trending symbols */}
      <CardSkeleton lines={3} showHeader />
    </div>
  )
}

