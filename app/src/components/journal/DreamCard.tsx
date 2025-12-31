import Link from 'next/link'

interface DreamCardProps {
  dream: {
    id: string
    textRaw: string
    capturedAt: Date
    clarity?: number | null
    isLucid?: boolean
    isNightmare: boolean
    isRecurring: boolean
  }
}

export function DreamCard({ dream }: DreamCardProps) {
  return (
    <Link
      href={`/journal/${dream.id}`}
      className="block p-6 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-[var(--foreground-subtle)]">
          {new Date(dream.capturedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
        {dream.clarity && (
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < dream.clarity! ? 'text-[var(--accent)]' : 'text-[var(--foreground-subtle)]'}>
                ⭐
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-[var(--foreground-muted)] line-clamp-2">
        {dream.textRaw}
      </p>
      {(dream.isLucid || dream.isNightmare || dream.isRecurring) && (
        <div className="flex gap-2 mt-3">
          {dream.isLucid && (
            <span className="text-xs px-2 py-1 bg-[var(--accent-muted)] rounded">Lucid</span>
          )}
          {dream.isNightmare && (
            <span className="text-xs px-2 py-1 bg-[var(--error)]/20 rounded">Nightmare</span>
          )}
          {dream.isRecurring && (
            <span className="text-xs px-2 py-1 bg-[var(--secondary-muted)] rounded">Recurring</span>
          )}
        </div>
      )}
    </Link>
  )
}

