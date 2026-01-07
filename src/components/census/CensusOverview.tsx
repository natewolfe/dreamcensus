'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui'
import { SectionCard } from './SectionCard'
import type { CensusSection, CensusProgress } from './types'

// Define larger groupings (kinds) for categories
const SECTION_KINDS = [
  {
    slug: 'self',
    name: 'Self',
    description: 'About you as a person',
    icon: '🪞',
    categorySlugs: ['personality', 'interiority'],
  },
  {
    slug: 'sleep',
    name: 'Sleep',
    description: 'Your sleep patterns and habits',
    icon: '😴',
    categorySlugs: ['sleep'],
  },
  {
    slug: 'dreams',
    name: 'Dreams',
    description: 'The dreaming experience',
    icon: '🌙',
    categorySlugs: ['recall', 'content', 'lucidity'],
  },
  {
    slug: 'cognition',
    name: 'Cognition',
    description: 'Mental faculties in dreams',
    icon: '🧠',
    categorySlugs: ['imagination', 'memory', 'spacetime'],
  },
  {
    slug: 'feelings',
    name: 'Feelings',
    description: 'Your emotional landscape',
    icon: '💜',
    categorySlugs: ['emotion', 'hope', 'fear'],
  },
  {
    slug: 'experience',
    name: 'Experience',
    description: 'What happens in dreams',
    icon: '✨',
    categorySlugs: ['embodiment', 'relationships', 'symbolism'],
  },
] as const

interface CensusOverviewProps {
  sections: CensusSection[]
  progress: Record<string, CensusProgress>
}

export function CensusOverview({
  sections,
  progress,
}: CensusOverviewProps) {
  const router = useRouter()
  
  const handleSectionClick = (section: CensusSection) => {
    // Use slug if available, otherwise fall back to ID
    const route = section.slug || section.id
    router.push(`/census/${route}`)
  }
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)
  
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0)
  const answeredQuestions = Object.values(progress).reduce(
    (sum, p) => sum + p.answeredQuestions,
    0
  )
  const overallProgress = totalQuestions > 0
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0

  // Find next incomplete section
  const nextSection = sortedSections.find((s) => {
    const sectionProgress = progress[s.id]
    return !sectionProgress || !sectionProgress.completedAt
  })

  // Group sections by kind
  const groupedByKind = SECTION_KINDS.map((kind) => {
    const kindSections = sortedSections.filter(
      (s) => s.slug && (kind.categorySlugs as readonly string[]).includes(s.slug)
    )
    const kindTotalQuestions = kindSections.reduce(
      (sum, s) => sum + s.questions.length,
      0
    )
    const kindAnsweredQuestions = kindSections.reduce(
      (sum, s) => sum + (progress[s.id]?.answeredQuestions ?? 0),
      0
    )
    return {
      ...kind,
      sections: kindSections,
      totalQuestions: kindTotalQuestions,
      answeredQuestions: kindAnsweredQuestions,
      progress:
        kindTotalQuestions > 0
          ? Math.round((kindAnsweredQuestions / kindTotalQuestions) * 100)
          : 0,
    }
  }).filter((kind) => kind.sections.length > 0)

  return (
    <div className="space-y-8">
      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="outlined" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-medium text-foreground">
                Overall Progress
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="block text-sm text-muted">
                  {answeredQuestions} of {totalQuestions} questions answered
                </span>
              </div>
            </div>
            <div className="text-3xl font-semibold text-accent">
              {overallProgress}%
            </div>
          </div>
          
          <div className="h-2 rounded-full bg-subtle/30 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-accent"
            />
          </div>

          {nextSection && (
            <div className="flex items-end justify-end gap-2 mt-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleSectionClick(nextSection)}
              >
                {overallProgress === 0 ? 'Begin' : `Next: ${nextSection.name}`} →
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Sections grouped by kind */}
      <div className="space-y-12 pt-4">
        {groupedByKind.map((kind, kindIndex) => (
          <motion.div
            key={kind.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: kindIndex * 0.1 }}
          >
            {/* Kind header divider */}
            <div className="flex items-center justify-between w-full bg-subtle/40 px-4 py-2">
              <span className="text-sm font-bold tracking-widest uppercase text-muted">
                {kind.name}
              </span>
              <span className="text-xs tracking-wide text-muted/70">
                {kind.progress}%
              </span>
            </div>

            {/* Kind progress bar */}
            <div className="h-1 rounded-full bg-subtle/20 overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${kind.progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: kindIndex * 0.1 + 0.2 }}
                className="h-full bg-accent/60"
              />
            </div>

            {/* Sections within this kind */}
            <div className="space-y-3">
              {kind.sections.map((section) => {
                const sectionProgress = progress[section.id] ?? {
                  sectionId: section.id,
                  totalQuestions: section.questions.length,
                  answeredQuestions: 0,
                }
                
                // Lock sections that haven't been reached yet
                const sectionIndex = sortedSections.findIndex((s) => s.id === section.id)
                const prevSection = sortedSections[sectionIndex - 1]
                const isLocked =
                  sectionIndex > 0 &&
                  prevSection?.id !== nextSection?.id &&
                  section.id !== nextSection?.id &&
                  !sectionProgress.completedAt

                return (
                  <SectionCard
                    key={section.id}
                    section={section}
                    progress={sectionProgress}
                    isLocked={isLocked}
                    prerequisiteName={isLocked ? nextSection?.name : undefined}
                    onClick={() => handleSectionClick(section)}
                  />
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

