'use client'

import { SearchableDropdown, Slider, type DropdownOption } from '@/components/ui'
import { ALARM_SOUNDS, previewSound, stopSound } from '@/lib/alarm'
import type { AlarmSoundSelectorProps } from './types'

export function AlarmSoundSelector({
  soundId,
  volume,
  onSoundChange,
  onVolumeChange,
}: AlarmSoundSelectorProps) {
  // Convert alarm sounds to dropdown options
  const soundOptions: DropdownOption[] = ALARM_SOUNDS.map((sound) => ({
    value: sound.id,
    label: sound.name,
    description: sound.description,
  }))

  const handleSoundChange = (value: string) => {
    onSoundChange(value)
    // Auto-preview on selection
    previewSound(value, volume)
  }

  const handleTestClick = () => {
    if (soundId) {
      previewSound(soundId, volume)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sound selection dropdown */}
      <div className="flex flex-col gap-3">
        <label className="text-base font-medium text-muted">
          Alarm Sound
        </label>
        <div className="flex gap-2">
          <SearchableDropdown
            options={soundOptions}
            value={soundId}
            onChange={handleSoundChange}
            placeholder="Select a sound..."
            showSearch={false}
            className="flex-1"
          />
          <button
            onClick={handleTestClick}
            onBlur={stopSound}
            className="px-4 py-2 rounded-lg bg-subtle/50 hover:bg-subtle text-md text-foreground font-semibold transition-colors cursor-pointer"
          >
            Test
          </button>
        </div>
      </div>

      {/* Volume slider */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-medium text-muted">
          Volume
        </label>
        <div className="flex items-center gap-4">
          <Slider
            value={volume}
            onChange={onVolumeChange}
            min={0}
            max={100}
            step={5}
            className="flex-1"
          />
          <span className="text-lg text-foreground w-12 text-right">
            {volume}%
          </span>
        </div>
      </div>
    </div>
  )
}
