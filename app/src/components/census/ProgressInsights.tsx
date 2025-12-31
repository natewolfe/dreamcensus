'use client'

import { useState } from 'react'

interface InsightCardProps {
  icon: string
  value: string | number
  label: string
  highlight?: boolean
  tooltip?: string
  isNew?: boolean
}

function InsightCard({ icon, value, label, highlight, tooltip, isNew }: InsightCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div 
      className={`relative p-6 rounded-2xl border-2 transition-all ${
        highlight 
          ? 'border-[var(--accent)] bg-[var(--accent-muted)] shadow-glow' 
          : 'border-[var(--border)] bg-[var(--background-elevated)]'
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-[var(--accent)] text-white text-xs font-medium rounded-full">
          New!
        </div>
      )}
      
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-family-display)' }}>
        {value}
      </div>
      <div className="text-sm text-[var(--foreground-muted)]">{label}</div>
      
      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg shadow-lg text-xs text-[var(--foreground-muted)] whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--border)]" />
        </div>
      )}
    </div>
  )
}

interface ProgressInsightsProps {
  chaptersComplete: number
  totalChapters: number
  insightsUnlocked: number
  timeInvested: number
  dreamScore: number
  isReturning: boolean
}

export function ProgressInsights({
  chaptersComplete,
  totalChapters,
  insightsUnlocked,
  timeInvested,
  dreamScore,
  isReturning
}: ProgressInsightsProps) {
  return (
    <section className="py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InsightCard 
          icon="🌌"
          value={`${chaptersComplete}/${totalChapters}`}
          label="Realms explored"
          highlight={chaptersComplete === totalChapters}
        />
        <InsightCard 
          icon="💡"
          value={insightsUnlocked}
          label="Insights unlocked"
          tooltip="Complete more chapters to unlock personal insights"
        />
        <InsightCard 
          icon="⏱️"
          value={`${timeInvested} min`}
          label="Time invested"
        />
        <InsightCard 
          icon="🔮"
          value={dreamScore}
          label="Dream awareness"
          isNew={isReturning && chaptersComplete > 0}
          tooltip="Your personalized dream awareness score (0-100)"
        />
      </div>
    </section>
  )
}

