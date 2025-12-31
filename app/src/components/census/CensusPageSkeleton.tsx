import { PageHeader } from '@/components/layout'

export function CensusPageSkeleton() {
  return (
    <>
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-[var(--background-elevated)] rounded-2xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

