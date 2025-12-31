export function CensusSkeleton() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero skeleton */}
        <div className="py-16 text-center">
          <div className="h-12 w-96 mx-auto bg-[var(--background-elevated)] rounded-lg animate-pulse mb-4" />
          <div className="h-6 w-[600px] max-w-full mx-auto bg-[var(--background-elevated)] rounded-lg animate-pulse" />
        </div>

        {/* Progress cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--background-elevated)]">
              <div className="h-8 w-8 bg-[var(--background)] rounded-lg animate-pulse mb-3" />
              <div className="h-8 w-16 bg-[var(--background)] rounded-lg animate-pulse mb-1" />
              <div className="h-4 w-24 bg-[var(--background)] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chapter grid skeleton */}
        <div className="mt-12">
          <div className="h-4 w-32 bg-[var(--background-elevated)] rounded-lg animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--background-elevated)]">
                <div className="h-16 w-16 bg-[var(--background)] rounded-2xl animate-pulse mb-4" />
                <div className="h-6 w-32 bg-[var(--background)] rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-full bg-[var(--background)] rounded-lg animate-pulse mb-1" />
                <div className="h-4 w-3/4 bg-[var(--background)] rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

