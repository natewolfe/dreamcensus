import { PageHeaderSkeleton, Skeleton, Card } from '@/components/ui'

export default function AlarmSettingsLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-2xl px-4 py-8 pb-16">
      <PageHeaderSkeleton showActions showSubtitle />

      <div className="space-y-6 mt-6">
        {/* Status Card - Time Picker + Toggle */}
        <Card padding="none" variant="plain">
          <div className="flex items-end gap-4">
            {/* Wake Time Skeleton - Left */}
            <div className="flex-1">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>

            {/* Alarm Status Skeleton - Right */}
            <div className="flex flex-col">
              <Skeleton className="h-14 w-28 rounded-lg" />
            </div>
          </div>
        </Card>

        {/* Repeat Days */}
        <Card padding="lg" className="mb-3">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </Card>

        {/* Sound */}
        <Card padding="lg" className="mb-3">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </Card>

        {/* Snooze */}
        <Card padding="lg">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </Card>
      </div>
    </div>
  )
}
