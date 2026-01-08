'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { LearnCard } from './LearnCard'
import { ChevronRight } from '@/components/ui'
import type { DreamSchoolTopic } from './types'
import { cn } from '@/lib/utils'

const SCHOOL_TOPICS: DreamSchoolTopic[] = [
  {
    id: 'lucid-dreaming',
    title: 'Lucid Dreaming',
    subtitle: 'Becoming aware in dreams',
    icon: '✨',
    color: 'from-violet-500/20 to-purple-600/10',
    href: '/learn/lucid-dreaming',
    featured: true,
  },
  {
    id: 'dream-recall',
    title: 'Better Recall',
    subtitle: 'Remember more dreams',
    icon: '🧠',
    color: 'from-cyan-500/20 to-teal-600/10',
    href: '/learn/recall',
  },
  {
    id: 'dream-symbols',
    title: 'Dream Symbols',
    subtitle: 'Decode recurring imagery',
    icon: '🔮',
    color: 'from-rose-500/20 to-pink-600/10',
    href: '/learn/symbols',
  },
  {
    id: 'sleep-science',
    title: 'Sleep Science',
    subtitle: 'How dreams work',
    icon: '🔬',
    color: 'from-amber-500/20 to-orange-600/10',
    href: '/learn/science',
  },
  {
    id: 'collective-dreams',
    title: 'Collective Dreams',
    subtitle: 'Shared dream phenomena',
    icon: '🌐',
    color: 'from-emerald-500/20 to-green-600/10',
    href: '/learn/collective',
  },
]

// ============================================================================
// Row Item Types
// ============================================================================

type TopicItem = { type: 'topic'; topic: DreamSchoolTopic; span: 1 | 2 }
type FillerItem = { type: 'filler'; span: 1 | 2 }
type RowItem = TopicItem | FillerItem

/**
 * Build rows for a 3-column grid:
 * - Featured topics span 2 columns
 * - Normal topics span 1 column
 * - Pack as many items per row as possible
 * - Fill incomplete rows with filler card
 */
function buildRows(topics: DreamSchoolTopic[]): RowItem[][] {
  const COLS = 3
  const rows: RowItem[][] = []
  let currentRow: RowItem[] = []
  let colsUsed = 0

  for (const topic of topics) {
    const span = topic.featured ? 2 : 1

    // If this card won't fit, fill remaining space and start new row
    if (colsUsed + span > COLS) {
      const remaining = COLS - colsUsed
      if (remaining > 0) {
        currentRow.push({ type: 'filler', span: remaining as 1 | 2 })
      }
      rows.push(currentRow)
      currentRow = []
      colsUsed = 0
    }

    currentRow.push({ type: 'topic', topic, span })
    colsUsed += span

    // If row is full, push and reset
    if (colsUsed === COLS) {
      rows.push(currentRow)
      currentRow = []
      colsUsed = 0
    }
  }

  // Handle last incomplete row
  if (currentRow.length > 0) {
    const remaining = COLS - colsUsed
    if (remaining > 0) {
      currentRow.push({ type: 'filler', span: remaining as 1 | 2 })
    }
    rows.push(currentRow)
  }

  return rows
}

// ============================================================================
// Filler Card Component
// ============================================================================

function ExploreAllCard({ span = 1 }: { span?: 1 | 2 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="h-full"
    >
      <Link href="/learn" className="block h-full">
        <div className={cn(
          'group relative h-full min-h-[100px] overflow-hidden rounded-xl',
          'flex flex-col justify-center items-center text-center',
          'bg-card-bg/50 border border-dashed border-border/60',
          'hover:border-accent/40 hover:bg-card-bg/70',
          'transition-all duration-300 p-3',
          span === 2 && 'px-6'
        )}>
          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '16px 16px',
            }}
          />

          <h3 className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors flex items-center gap-2">
            Explore all
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </h3>
        </div>
      </Link>
    </motion.div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Intelligent grid layout:
 * - 3-column grid
 * - Featured topics span 2 columns, normal topics span 1
 * - Rows pack as many cards as fit (3 normal, or 1 featured + 1 normal, etc.)
 * - Incomplete rows get filler card
 */
export function DreamSchoolSection() {
  const router = useRouter()
  const rows = buildRows(SCHOOL_TOPICS)

  return (
    <section aria-labelledby="learn-heading" className="mt-8">
      {/* Section header */}
      <div className="flex items-center justify-end mb-4">
        <Link
          href="/learn"
          onClick={() => router.push('/learn')}
          className="text-sm text-accent hover:text-accent/80 transition-colors duration-300"
        >
          Learn more →
        </Link>
      </div>

      {/* Desktop: 3-column grid with intelligent packing */}
      <div className="hidden md:grid md:grid-cols-3 gap-3">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            {row.map((item) => {
              const key = item.type === 'topic' ? item.topic.id : `filler-${rowIndex}`
              const colSpan = item.span === 2 ? 'col-span-2' : 'col-span-1'

              if (item.type === 'filler') {
                return (
                  <div key={key} className={cn(colSpan, 'h-full')}>
                    <ExploreAllCard span={item.span} />
                  </div>
                )
              }

              const isWide = item.span === 2
              return (
                <div key={key} className={cn(colSpan, 'h-full')}>
                  <LearnCard
                    topic={item.topic}
                    size="lg"
                    variant="card"
                    align={isWide ? 'left' : 'center'}
                    iconPosition={isWide ? 'left' : 'top'}
                    wide={isWide}
                    className="h-full"
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:hidden scrollbar-hide">
        {SCHOOL_TOPICS.map((topic) => (
          <div key={topic.id} className="flex-shrink-0 w-[140px]">
            <LearnCard topic={topic} size="md" variant="card" />
          </div>
        ))}
        {/* ExploreAllCard at end of scroll */}
        <div className="flex-shrink-0 w-[140px]">
          <ExploreAllCard />
        </div>
      </div>
    </section>
  )
}

