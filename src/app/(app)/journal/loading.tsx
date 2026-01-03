import { PageHeader } from '@/components/layout'
import { DreamCardSkeleton } from '@/components/ui'

export default function JournalLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Dream Journal"
        subtitle="Your personal dream archive"
      />

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <DreamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

