import { 
  PageHeaderSkeleton, 
  CardSkeleton, 
  Skeleton,
  Card,
  ProgressBar
} from '@/components/ui'

export default function CensusLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 md:px-6 py-8 md:pb-16">
      <div className="mb-6 md:mb-4">
        <PageHeaderSkeleton showSubtitle />
      </div>

      <div className="space-y-8">
        {/* Census Constellation Placeholder - matches actual responsive height */}
        <div 
          className="relative w-full rounded-xl bg-subtle/20 overflow-hidden"
          style={{ height: 'clamp(280px, 38vh, 450px)' }}
        >
          {/* Decorative dots to suggest constellation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-3xl">
              {/* Scattered placeholder dots */}
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton 
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${8 + (i % 3) * 4}px`,
                    height: `${8 + (i % 3) * 4}px`,
                    left: `${15 + (i * 7) % 70}%`,
                    top: `${20 + (i * 11) % 60}%`,
                    opacity: 0.3 + (i % 3) * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Overall Progress Card */}
        <Card variant="outlined" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-14" />
          </div>
          <ProgressBar value={0} size="md" variant="default" />
          <div className="flex justify-end mt-3">
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </Card>

        {/* Section Groups */}
        <div className="space-y-12 pt-4">
          {Array.from({ length: 3 }).map((_, groupIndex) => (
            <div key={groupIndex}>
              {/* Kind header divider */}
              <div className="flex items-center justify-between w-full bg-subtle/40 px-4 py-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-8" />
              </div>

              {/* Kind progress bar */}
              <ProgressBar value={0} size="sm" variant="subtle" className="mb-4" />

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
    </div>
  )
}
