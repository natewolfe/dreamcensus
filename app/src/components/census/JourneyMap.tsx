'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import type { CensusChapterData } from '@/lib/chapters'

interface JourneyMapProps {
  chapters: CensusChapterData[]
  currentPosition?: string | null
}

function calculatePosition(index: number, total: number): { x: number; y: number } {
  // Create a flowing path across the screen
  const progress = index / (total - 1)
  
  // X position: spread across width with some curve
  const x = 10 + progress * 80
  
  // Y position: create a gentle wave
  const wave = Math.sin(progress * Math.PI * 2) * 15
  const y = 50 + wave
  
  return { x, y }
}

interface ChapterNodeProps {
  chapter: CensusChapterData
  position: { x: number; y: number }
  isCurrent: boolean
}

function ChapterNode({ chapter, position, isCurrent }: ChapterNodeProps) {
  const [showTooltip, setShowTooltip] = React.useState(false)

  return (
    <Link
      href={chapter.isLocked ? '#' : `/census/${chapter.slug}`}
      className={`absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer transition-all journey-node ${
        chapter.isComplete ? 'complete' : chapter.isLocked ? 'locked' : ''
      } ${isCurrent ? 'active' : ''}`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => chapter.isLocked && e.preventDefault()}
    >
      <motion.div
        className={`w-full h-full rounded-full flex items-center justify-center ${
          chapter.isComplete 
            ? 'bg-[var(--accent)] shadow-glow' 
            : chapter.isLocked 
            ? 'bg-[var(--background-subtle)] border-2 border-[var(--border)]'
            : 'bg-[var(--background-elevated)] border-2 border-[var(--border)] hover:border-[var(--accent)]'
        }`}
        whileHover={!chapter.isLocked ? { scale: 1.1 } : {}}
      >
        <span className="text-2xl">{chapter.iconEmoji || '✦'}</span>
      </motion.div>
      
      {/* Completion checkmark */}
      {chapter.isComplete && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center border-2 border-[var(--background)]">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      {/* Lock icon */}
      {chapter.isLocked && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--background-subtle)] rounded-full flex items-center justify-center border-2 border-[var(--border)]">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3z" />
          </svg>
        </div>
      )}
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-[var(--background-elevated)] px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap border border-[var(--border)]">
            <div className="font-medium">{chapter.name}</div>
            <div className="text-[var(--foreground-muted)] text-xs">
              {chapter.isComplete ? '✓ Complete' : 
               chapter.isLocked ? '🔒 Locked' : 
               `${chapter.estimatedMinutes} min`}
            </div>
          </div>
        </div>
      )}
    </Link>
  )
}

export function JourneyMap({ chapters, currentPosition }: JourneyMapProps) {
  // Calculate the progress percentage for the animated path
  const completedCount = chapters.filter(ch => ch.isComplete).length
  const progressPercent = (completedCount / chapters.length) * 100

  return (
    <section className="py-2">
      <div className="relative h-48 md:h-64 mx-auto max-w-4xl">
        {/* SVG path connecting chapters */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
              <stop offset={`${progressPercent}%`} stopColor="var(--accent)" stopOpacity="1" />
              <stop offset={`${progressPercent}%`} stopColor="var(--border)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--border)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          
          {/* Generate path through all chapter positions using viewBox coordinates */}
          <path
            d={chapters.map((ch, i) => {
              const pos = calculatePosition(i, chapters.length)
              const command = i === 0 ? 'M' : 'L'
              return `${command} ${pos.x} ${pos.y}`
            }).join(' ')}
            stroke="url(#pathGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Chapter nodes */}
        {chapters.map((chapter, i) => (
          <ChapterNode 
            key={chapter.id}
            chapter={chapter}
            position={calculatePosition(i, chapters.length)}
            isCurrent={chapter.slug === currentPosition}
          />
        ))}
      </div>
    </section>
  )
}

// Add React import for useState
import React from 'react'

