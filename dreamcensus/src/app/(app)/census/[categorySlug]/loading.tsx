import { 
  Skeleton, 
  CardSkeleton 
} from '@/components/ui'

export default function CensusSectionLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      {/* Section Header Skeleton */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Question Cards Skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton 
            key={i} 
            lines={3} 
            showHeader 
          />
        ))}
      </div>

      {/* Navigation Footer Skeleton */}
      <div className="mt-8 flex justify-between items-center">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}
