'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { calculateProgress, formatProgress } from '@/lib/progress'

export interface ChapterCardProps {
  chapter: {
    slug: string
    name: string
    description: string | null
    iconEmoji: string | null
    estimatedMinutes: number
    stepCount: number
    answeredCount: number
    isComplete: boolean
    isLocked: boolean
  }
  isRecommended?: boolean
}

function ShimmerOverlay() {
  return <div className="shimmer-overlay" />
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3z" />
    </svg>
  )
}

export function ChapterCard({ chapter, isRecommended = false }: ChapterCardProps) {
  const progress = calculateProgress(chapter.answeredCount, chapter.stepCount)

  return (
    <Link
      href={chapter.isLocked ? '#' : `/census/${chapter.slug}`}
      className={`
        group relative block rounded-2xl border border-[var(--border)] transition-all duration-300 overflow-hidden
        ${chapter.isLocked ? 'opacity-60 cursor-not-allowed' : ''}
        ${chapter.isComplete ? 'border-[var(--accent)]' : ''}
        ${isRecommended ? 'ring-2 ring-[var(--foreground-muted)]/50 ring-offset-4 ring-offset-[var(--background)]' : ''}
        ${!chapter.isComplete && !chapter.isLocked ? 'border-[var(--border)] hover:border-[var(--accent)]/50' : ''}
      `}
      onClick={(e) => chapter.isLocked && e.preventDefault()}
    >
      {/* Shimmer effect for complete chapters */}
      {chapter.isComplete && <ShimmerOverlay />}
      
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--foreground-subtle)]/20 text-[var(--foreground-muted)] text-xs font-medium rounded-full z-10">
          Recommended
        </div>
      )}
      
      <div className="p-6 relative flex flex-col min-h-full">
        {/* Icon with state indicator */}
        <div className="relative w-16 h-16 mb-6">
          <motion.div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform ${
              chapter.isComplete 
                ? 'bg-[var(--accent)]/20' 
                : 'bg-[var(--background-elevated)]'
            }`}
            whileHover={!chapter.isLocked ? { scale: 1.05 } : {}}
          >
            {chapter.iconEmoji || '✦'}
          </motion.div>
          
          {chapter.isComplete && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-white" />
            </div>
          )}
          {chapter.isLocked && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--background-subtle)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <LockIcon className="w-3 h-3" />
            </div>
          )}
        </div>
        
        {/* Chapter info */}
        <h3 className="text-xl font-medium mb-2">{chapter.name}</h3>
        <p className="text-sm text-[var(--foreground-muted)] mb-4 line-clamp-2">
          {chapter.description}
        </p>
        
        {/* Progress bar (only if started) */}
        {progress > 0 && progress < 100 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[var(--foreground-subtle)] mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
        
        {/* Meta info + CTA */}
        <div className="mt-auto pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]/70">
            <span>⏱️ {chapter.estimatedMinutes} min</span>
            <span>📝 {chapter.stepCount} questions</span>
          </div>
          
          {/* CTA */}
          <div className={`
            text-sm font-medium flex items-center justify-end gap-1 transition-all
            ${chapter.isLocked ? 'text-[var(--accent-muted)]' : 'text-[var(--accent)]/70 group-hover:gap-2'}
          `}>
            {chapter.isComplete ? (
              <>Review your responses<span>→</span></>
            ) : chapter.isLocked ? (
              <>Locked<span>🔒</span></>
            ) : progress > 0 ? (
              <>Continue<span>→</span></>
            ) : (
              <>Begin<span>→</span></>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
