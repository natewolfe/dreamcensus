import type { ReactNode } from 'react'

export interface SettingsSectionProps {
  title: string
  children: ReactNode
}

/**
 * Reusable section wrapper for settings pages
 * Provides consistent spacing and typography
 */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}
