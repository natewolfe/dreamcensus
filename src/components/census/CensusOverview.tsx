'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { SectionCard } from './SectionCard'
import type { CensusSection, CensusProgress } from './types'

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

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-card-bg border border-border p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Overall Progress
            </h3>
            <p className="text-sm text-muted">
              {answeredQuestions} of {totalQuestions} questions answered
            </p>
          </div>
          <div className="text-2xl font-bold text-accent">
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
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => handleSectionClick(nextSection)}
              className="text-sm text-accent hover:underline"
            >
              Continue: {nextSection.name} →
            </button>
          </div>
        )}
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {sortedSections.map((section, index) => {
          const sectionProgress = progress[section.id] ?? {
            sectionId: section.id,
            totalQuestions: section.questions.length,
            answeredQuestions: 0,
          }
          
          // Lock sections that aren't next
          const prevSection = sortedSections[index - 1]
          const isLocked = index > 0 && prevSection?.id !== nextSection?.id

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SectionCard
                section={section}
                progress={sectionProgress}
                isLocked={isLocked}
                onClick={() => handleSectionClick(section)}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

