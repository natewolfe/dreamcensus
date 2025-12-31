'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { Confetti } from '@/components/ui/Confetti'
import { AchievementBadge } from './AchievementBadge'
import type { CensusChapterData } from '@/lib/chapters'
import type { Achievement } from '@/lib/achievements'

interface ChapterCelebrationProps {
  chapter: CensusChapterData
  insights: string[]
  nextChapter?: CensusChapterData | null
  newAchievements?: Achievement[]
}

export function ChapterCelebration({ 
  chapter, 
  insights, 
  nextChapter,
  newAchievements = []
}: ChapterCelebrationProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Confetti animation */}
      <Confetti />
      
      <motion.div 
        className="max-w-xl text-center relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Achievement badge */}
        <motion.div
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-glow)] flex items-center justify-center shadow-glow"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.5 }}
        >
          <span className="text-4xl">{chapter.iconEmoji || '✦'}</span>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-medium mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>
          {chapter.name} Complete!
        </h1>
        
        <p className="text-xl text-[var(--foreground-muted)] mb-8">
          You've explored {chapter.stepCount} questions about {chapter.description?.toLowerCase() || 'your inner world'}
        </p>
        
        {/* New achievements */}
        {newAchievements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-[var(--accent)] mb-3">
              New Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {newAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* What you revealed */}
        {insights.length > 0 && (
          <div className="bg-[var(--background-elevated)] rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-sm font-medium text-[var(--accent)] mb-4">
              What you revealed
            </h3>
            <ul className="space-y-3 text-[var(--foreground-muted)]">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[var(--accent)] flex-shrink-0">✦</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Next chapter teaser */}
        {nextChapter && (
          <div className="p-6 bg-[var(--background-subtle)] rounded-2xl mb-8">
            <div className="text-sm text-[var(--foreground-subtle)] mb-2">Next up</div>
            <div className="flex items-center gap-4">
              <span className="text-3xl">{nextChapter.iconEmoji || '✦'}</span>
              <div className="text-left flex-1">
                <div className="font-medium">{nextChapter.name}</div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  {nextChapter.estimatedMinutes} min · {nextChapter.stepCount} questions
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {nextChapter ? (
            <Link href={`/census/${nextChapter.slug}`} className="btn btn-primary">
              Continue to {nextChapter.name} →
            </Link>
          ) : (
            <Link href="/census/complete" className="btn btn-primary">
              See Your Full Results →
            </Link>
          )}
          <Link href="/census" className="btn btn-secondary">
            Back to Census
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

