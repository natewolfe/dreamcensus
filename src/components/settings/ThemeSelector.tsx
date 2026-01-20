'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useTheme, type ThemePreference } from '@/hooks/use-theme'
import { SearchableDropdown, type DropdownOption } from '@/components/ui'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: Array<{
  value: ThemePreference
  label: string
  description: string
  colors: {
    bg: string
    fg: string
    accent: string
  }
}> = [
  {
    value: 'auto',
    label: 'Auto',
    description: 'Changes based on time of day',
    colors: {
      bg: 'linear-gradient(135deg, #e8f0f5 0%, #faf9f7 25%, #2a2030 50%, #0c0e1a 75%)',
      fg: '#2d3748',
      accent: '#d4a574',
    },
  },
  {
    value: 'dawn',
    label: 'Dawn',
    description: 'Soft pale blue and light tan',
    colors: {
      bg: '#e8f0f5',
      fg: '#2d3748',
      accent: '#d4a574',
    },
  },
  {
    value: 'day',
    label: 'Day',
    description: 'Bright off-white with gold accents',
    colors: {
      bg: '#faf9f7',
      fg: '#1a1a1a',
      accent: '#c9a227',
    },
  },
  {
    value: 'dusk',
    label: 'Dusk',
    description: 'Warm gold and mauve',
    colors: {
      bg: '#2a2030',
      fg: '#f0e8e0',
      accent: '#d4a054',
    },
  },
  {
    value: 'night',
    label: 'Night',
    description: 'Dark blue-purple with silver-cyan',
    colors: {
      bg: '#0c0e1a',
      fg: '#e8eaf6',
      accent: '#7ec8c8',
    },
  },
]

export function ThemeSelector() {
  const { preference, resolved, setPreference } = useTheme()

  // Convert theme options to dropdown format
  const dropdownOptions: DropdownOption[] = THEME_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.description,
  }))

  // Get the selected theme's colors for the swatch preview
  const selectedTheme = THEME_OPTIONS.find((opt) => opt.value === preference)
  const resolvedTheme = THEME_OPTIONS.find((opt) => opt.value === resolved)

  const handleThemeChange = (value: string) => {
    setPreference(value as ThemePreference)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-stretch">
        {/* Color swatch preview */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'w-12 h-12 rounded-lg border-2 border-accent transition-all'
            )}
            style={{
              background: selectedTheme?.colors.bg,
            }}
          >
            {/* Small accent dot */}
            <div
              className="absolute bottom-1 right-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedTheme?.colors.accent }}
            />
          </div>

          {/* Active indicator for auto mode */}
          {preference === 'auto' && resolvedTheme && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: resolvedTheme.colors.accent }}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </div>

        {/* Dropdown selector */}
        <SearchableDropdown
          options={dropdownOptions}
          value={preference}
          onChange={handleThemeChange}
          placeholder="Select a theme..."
          showSearch={false}
          className="flex-1"
        />
      </div>

      {/* Info note */}
      <AnimatePresence>
        {preference === 'auto' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-muted overflow-hidden"
          >
            Auto mode cycles: Dawn (5-8am) → Day (8am-6pm) → Dusk (6-9pm) → Night (9pm-5am)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

