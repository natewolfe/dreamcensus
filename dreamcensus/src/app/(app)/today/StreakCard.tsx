'use client'

import { motion } from 'motion/react'
import Link from 'next/link'

interface StreakCardProps {
  streakCount: number
}

export function StreakCard({ streakCount }: StreakCardProps) {
  return (
    <Link href="/journal" className="block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        style={{ backfaceVisibility: 'hidden', willChange: 'transform' }}
        className="w-22 md:w-26 p-3 rounded-lg bg-transparent border border-border/50 flex flex-col items-center cursor-pointer transition-all duration-300 hover:shadow-xl"
      >
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted">
          Streak
        </span>
        {streakCount > 0 ? (
          <>
            <span className="text-2xl sm:text-3xl font-medium tabular-nums text-accent">
              {streakCount}
            </span>
            <span className="mt-0.5 text-[10px] tracking-wide text-muted">
              {streakCount === 1 ? 'day' : 'days'}
            </span>
          </>
        ) : (
          <span className="mt-1.5 text-xs text-muted leading-tight text-center max-w-[4rem]">
            Start today
          </span>
        )}
      </motion.div>
    </Link>
  )
}