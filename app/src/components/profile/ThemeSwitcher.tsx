'use client'

import { useTheme } from '@/lib/theme/ThemeProvider'
import { Icon } from '@/components/ui'

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme()
  
  const themeIcons: Record<string, React.ReactNode> = {
    dark: <Icon name="moon" size={20} />,
    light: <Icon name="sun" size={20} />,
    aurora: <span className="text-lg">🌌</span>,
    midnight: <span className="text-lg">🌊</span>,
  }
  
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-[var(--foreground)]">
        App Theme
      </label>
      <p className="text-sm text-[var(--foreground-muted)] mb-4">
        Choose your preferred color scheme
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.values(themes).map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${theme === t.id 
                ? 'border-[var(--accent)] bg-[var(--accent-muted)]' 
                : 'border-[var(--border)] hover:border-[var(--foreground-subtle)]'
              }
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0">
                {themeIcons[t.id]}
              </div>
              <div>
                <div className="text-base font-medium">{t.name}</div>
                {t.description && (
                  <div className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    {t.description}
                  </div>
                )}
              </div>
            </div>
            
            {/* Color preview swatches */}
            <div className="flex gap-2 mt-3">
              <div 
                className="w-8 h-8 rounded border border-[var(--border)]" 
                style={{ backgroundColor: t.colors.background }}
                title="Background"
              />
              <div 
                className="w-8 h-8 rounded border border-[var(--border)]" 
                style={{ backgroundColor: t.colors.accent }}
                title="Accent"
              />
              <div 
                className="w-8 h-8 rounded border border-[var(--border)]" 
                style={{ backgroundColor: t.colors.foreground }}
                title="Text"
              />
            </div>
            
            {theme === t.id && (
              <div className="flex items-center gap-1 mt-3 text-sm text-[var(--accent)]">
                <Icon name="check" size={16} />
                <span>Active</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

