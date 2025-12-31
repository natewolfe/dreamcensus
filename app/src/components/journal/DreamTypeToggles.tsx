'use client'

interface DreamTypeTogglesProps {
  lucid: boolean
  nightmare: boolean
  recurring: boolean
  onToggleLucid: (value: boolean) => void
  onToggleNightmare: (value: boolean) => void
  onToggleRecurring: (value: boolean) => void
}

export function DreamTypeToggles({
  lucid,
  nightmare,
  recurring,
  onToggleLucid,
  onToggleNightmare,
  onToggleRecurring,
}: DreamTypeTogglesProps) {
  const toggles = [
    {
      label: 'Lucid',
      description: 'Aware you were dreaming',
      value: lucid,
      onChange: onToggleLucid,
      emoji: '💡',
    },
    {
      label: 'Nightmare',
      description: 'Frightening or disturbing',
      value: nightmare,
      onChange: onToggleNightmare,
      emoji: '😰',
    },
    {
      label: 'Recurring',
      description: 'Had this dream before',
      value: recurring,
      onChange: onToggleRecurring,
      emoji: '🔄',
    },
  ]

  return (
    <div className="space-y-3">
      {toggles.map((toggle) => (
        <button
          key={toggle.label}
          onClick={() => toggle.onChange(!toggle.value)}
          className={`
            w-full p-6 rounded-xl border-2 text-left transition-all
            ${
              toggle.value
                ? 'bg-[var(--accent-muted)] border-[var(--accent)]'
                : 'bg-[var(--background-elevated)] border-[var(--border)] hover:border-[var(--accent)]'
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">{toggle.emoji}</div>
            <div className="flex-1">
              <div className="font-medium mb-1">{toggle.label}</div>
              <div className="text-sm text-[var(--foreground-subtle)]">
                {toggle.description}
              </div>
            </div>
            {toggle.value && (
              <div className="text-2xl text-[var(--accent)]">✓</div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

