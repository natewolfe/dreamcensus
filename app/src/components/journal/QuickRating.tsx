'use client'

interface QuickRatingProps {
  value?: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
}

export function QuickRating({ value, onChange, label, min = 1, max = 5 }: QuickRatingProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-3">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`
              w-16 h-16 rounded-full text-2xl font-medium transition-all
              ${
                value === num
                  ? 'bg-[var(--accent)] text-white scale-110 shadow-lg'
                  : 'bg-[var(--background-elevated)] border-2 border-[var(--border)] hover:border-[var(--accent)] hover:scale-105'
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-[var(--foreground-subtle)] px-2">
        <span>Not at all</span>
        <span>Extremely</span>
      </div>
    </div>
  )
}

