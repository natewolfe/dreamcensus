'use client'

import { QuickRating } from './QuickRating'

interface SleepContextProps {
  sleepDuration?: number
  sleepQuality?: number
  onChangeDuration: (value: number) => void
  onChangeQuality: (value: number) => void
}

export function SleepContext({
  sleepDuration,
  sleepQuality,
  onChangeDuration,
  onChangeQuality,
}: SleepContextProps) {
  return (
    <div className="space-y-8">
      {/* Sleep Duration */}
      <div>
        <label className="block text-sm font-medium mb-4">
          Hours of sleep
        </label>
        <div className="flex justify-center gap-2">
          {[4, 5, 6, 7, 8, 9, 10].map((hours) => (
            <button
              key={hours}
              onClick={() => onChangeDuration(hours)}
              className={`
                px-4 py-3 rounded-lg text-lg font-medium transition-all
                ${
                  sleepDuration === hours
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--background-elevated)] border border-[var(--border)] hover:border-[var(--accent)]'
                }
              `}
            >
              {hours}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Quality */}
      <div>
        <label className="block text-sm font-medium mb-4 text-center">
          Sleep quality
        </label>
        <QuickRating
          value={sleepQuality}
          onChange={onChangeQuality}
          label="Quality"
        />
      </div>
    </div>
  )
}

