import type { AlarmSound } from './types'

/**
 * Available alarm sounds
 */
export const ALARM_SOUNDS: AlarmSound[] = [
  {
    id: 'gentle-rise',
    name: 'Gentle Rise',
    file: '/sounds/alarms/gentle-rise.mp3',
    description: 'Soft, gradual awakening',
  },
  {
    id: 'morning-birds',
    name: 'Morning Birds',
    file: '/sounds/alarms/morning-birds.mp3',
    description: 'Natural birdsong',
  },
  {
    id: 'dream-bells',
    name: 'Dream Bells',
    file: '/sounds/alarms/dream-bells.mp3',
    description: 'Mystical chimes',
  },
  {
    id: 'classic-chime',
    name: 'Classic Chime',
    file: '/sounds/alarms/classic-chime.mp3',
    description: 'Traditional alarm tone',
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    file: '/sounds/alarms/ocean-waves.mp3',
    description: 'Gentle ocean sounds',
  },
]

export type AlarmSoundId = typeof ALARM_SOUNDS[number]['id']

/**
 * Global audio element for alarm playback
 */
let audioElement: HTMLAudioElement | null = null
let audioUnlocked = false

/**
 * Unlock audio playback (call on user gesture)
 * Browsers require a user interaction before allowing audio
 */
export function unlockAudio(): void {
  if (audioUnlocked) return

  // Create and immediately pause to unlock
  const audio = new Audio()
  audio.play().catch(() => {
    // Expected to fail, but unlocks audio context
  })
  audio.pause()
  audioUnlocked = true
}

/**
 * Play an alarm sound in a loop
 * @param soundId - Sound to play
 * @param volume - Volume 0-100
 */
export function playSound(soundId: string, volume: number = 80): void {
  const sound = ALARM_SOUNDS.find((s) => s.id === soundId)
  if (!sound) {
    console.warn(`Alarm sound "${soundId}" not found`)
    return
  }

  // Stop any currently playing sound
  stopSound()

  audioElement = new Audio(sound.file)
  audioElement.loop = true
  audioElement.volume = Math.max(0, Math.min(1, volume / 100))

  audioElement.play().catch((err) => {
    console.error('Audio playback failed:', err)
    // If autoplay fails, the ring overlay will show "Tap to enable sound"
  })
}

/**
 * Stop currently playing alarm sound
 */
export function stopSound(): void {
  if (audioElement) {
    audioElement.pause()
    audioElement.currentTime = 0
    audioElement = null
  }
}

/**
 * Preview a sound (plays for 5 seconds then stops)
 * @param soundId - Sound to preview
 * @param volume - Volume 0-100
 */
export function previewSound(soundId: string, volume: number = 80): void {
  unlockAudio() // Ensure audio is unlocked
  playSound(soundId, volume)

  // Auto-stop after 5 seconds
  setTimeout(stopSound, 5000)
}

/**
 * Check if audio is unlocked
 */
export function isAudioUnlocked(): boolean {
  return audioUnlocked
}
