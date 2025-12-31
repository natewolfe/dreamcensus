'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import type { Achievement } from '@/lib/achievements'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
}

export function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
        unlocked
          ? 'bg-[var(--background-elevated)] border-[var(--border)]'
          : 'bg-[var(--background-subtle)] border-[var(--border-subtle)] opacity-60'
      }`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`text-xl ${unlocked ? '' : 'grayscale'}`}>
        {achievement.icon}
      </span>
      <span className="text-sm font-medium">{achievement.name}</span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg shadow-lg text-xs whitespace-nowrap z-10">
          <div className="font-medium mb-1">{achievement.name}</div>
          <div className="text-[var(--foreground-muted)]">{achievement.description}</div>
          {!unlocked && (
            <div className="text-[var(--foreground-subtle)] mt-1">🔒 Locked</div>
          )}
        </div>
      )}
    </motion.div>
  )
}

