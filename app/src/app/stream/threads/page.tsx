import Link from 'next/link'

export const metadata = {
  title: 'Threads | The Stream',
  description: 'Visualize your exploration threads',
}

export default function ThreadsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/stream" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
              ← Back to Stream
            </Link>
            <h1 className="text-xl font-medium">Your Threads</h1>
          </div>
        </div>
      </header>

      {/* Coming Soon */}
      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-8">🧵</div>
        <h2 className="text-3xl font-bold mb-4">Thread Visualization</h2>
        <p className="text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto">
          Thread tracking will visualize how your answers create interconnected paths through the question space.
          This feature is coming soon.
        </p>
        <Link
          href="/stream"
          className="btn btn-primary inline-block mt-8"
        >
          Continue Exploring →
        </Link>
      </main>
    </div>
  )
}

