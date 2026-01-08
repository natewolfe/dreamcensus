import { 
  Skeleton, 
  CardSkeleton 
} from '@/components/ui'

export default function JournalDetailLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back Link Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Dream Detail Card Skeleton */}
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Main Content */}
        <CardSkeleton lines={8} />

        {/* Metadata */}
        <div className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton lines={3} showHeader />
          <CardSkeleton lines={3} showHeader />
        </div>

        {/* Tags */}
        <CardSkeleton lines={0} showHeader className="h-20" />
      </div>
    </div>
  )
}
