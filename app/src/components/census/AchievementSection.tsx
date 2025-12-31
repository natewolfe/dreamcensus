import { AchievementBadge } from './AchievementBadge'
import type { Achievement } from '@/lib/achievements'

interface AchievementSectionProps {
  unlockedAchievements: Achievement[]
  lockedAchievements: Achievement[]
}

export function AchievementSection({ unlockedAchievements, lockedAchievements }: AchievementSectionProps) {
  if (unlockedAchievements.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wide">
          Your Achievements
        </h2>
        {lockedAchievements.length > 0 && (
          <span className="text-xs text-[var(--foreground-subtle)]">
            {lockedAchievements.length} more to unlock
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {unlockedAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={true}
          />
        ))}
      </div>
    </section>
  )
}

