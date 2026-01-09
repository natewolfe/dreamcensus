'use client'

import { useTheme, type ThemePreference } from '@/hooks/use-theme'

const THEME_ORDER: ThemePreference[] = ['auto', 'dawn', 'day', 'dusk', 'night']

const THEME_LABELS: Record<ThemePreference, string> = {
  auto: 'Auto',
  dawn: 'Dawn',
  day: 'Day',
  dusk: 'Dusk',
  night: 'Night',
}

export function ThemeCycleButton() {
  const { preference, setPreference } = useTheme()

  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(preference)
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length
    setPreference(THEME_ORDER[nextIndex])
  }

  const Icon = THEME_ICONS[preference]

  return (
    <button
      onClick={cycleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-subtle/30 hover:text-foreground transition-colors"
      title={`Theme: ${THEME_LABELS[preference]}`}
      aria-label={`Current theme: ${THEME_LABELS[preference]}. Click to cycle themes.`}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

// SVG Icons for each theme
const THEME_ICONS: Record<ThemePreference, React.FC<{ className?: string }>> = {
  auto: AutoIcon,
  dawn: SunriseIcon,
  day: SunIcon,
  dusk: StarIcon,
  night: MoonIcon,
}

function AutoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SunriseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M4.93 10.93l2.83 2.83" />
      <path d="M2 18h4" />
      <path d="M18 18h4" />
      <path d="M16.24 13.76l2.83-2.83" />
      <path d="M18 18a6 6 0 0 0-12 0" />
    </svg>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
