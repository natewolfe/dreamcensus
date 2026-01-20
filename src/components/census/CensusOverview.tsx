'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Card, ProgressBar } from '@/components/ui'
import { SectionCard } from './SectionCard'
import { CensusConstellation } from './CensusConstellation'
import { fadeInUp, fadeInUpLarge } from '@/lib/motion'
import { 
  SECTION_KINDS, 
  SECTION_PREREQUISITES,
  getCompletedSlugs, 
  getNextSection, 
  isSectionUnlocked 
} from './constants'
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

  // Get completed sections and find next recommended section
  const completedSlugs = getCompletedSlugs(sortedSections, progress)
  const nextSection = getNextSection(sortedSections, progress)
  
  // Get completed sections with their icons for badges
  const completedSections = sortedSections.filter(
    s => s.slug && completedSlugs.has(s.slug) && s.icon
  )

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
      {/* Census Constellation */}
      <CensusConstellation
        sections={sections}
        progress={progress}
        onSectionClick={(sectionId) => {
          const section = sections.find((s) => s.id === sectionId)
          if (section) {
            handleSectionClick(section)
          }
        }}
      />

      {/* Overall progress */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
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
          
          <ProgressBar
            value={overallProgress}
            size="md"
            variant="default"
          />

          {/* Footer: completed badges + next button */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 mt-3">
            {/* Completed section badges */}
            {completedSections.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {completedSections.map((section) => (
                  <span
                    key={section.id}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/15 text-sm"
                    title={`${section.name} complete`}
                  >
                    {section.icon}
                  </span>
                ))}
              </div>
            )}
            
            {nextSection && (
              <Button
                variant="special"
                size="md"
                onClick={() => handleSectionClick(nextSection)}
                className="self-end md:ml-auto"
              >
                {overallProgress === 0 ? '📝 Begin' : `Next: ${nextSection.name}`} →
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Sections grouped by kind */}
      <div className="space-y-12 pt-4">
        {groupedByKind.map((kind, kindIndex) => (
          <motion.div
            key={kind.slug}
            id={`kind-${kind.slug}`}
            variants={fadeInUpLarge}
            initial="initial"
            animate="animate"
            transition={{ delay: kindIndex * 0.1 }}
            className="scroll-mt-20"
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
            <ProgressBar
              value={kind.progress}
              size="sm"
              variant="subtle"
              animationDelay={kindIndex * 0.1 + 0.2}
              className="mb-4"
            />

            {/* Sections within this kind */}
            <div className="space-y-3">
              {kind.sections.map((section) => {
                const sectionProgress = progress[section.id] ?? {
                  sectionId: section.id,
                  totalQuestions: section.questions.length,
                  answeredQuestions: 0,
                }
                
                // Use prerequisites-based locking
                const isLocked = section.slug 
                  ? !isSectionUnlocked(section.slug, completedSlugs) 
                  : false
                
                // Find prerequisite names for locked sections
                const prerequisites = section.slug ? SECTION_PREREQUISITES[section.slug] : undefined
                const missingPrereqs = prerequisites?.filter(p => !completedSlugs.has(p)) ?? []
                const prerequisiteSection = missingPrereqs.length > 0 
                  ? sortedSections.find(s => s.slug === missingPrereqs[0])
                  : undefined

                return (
                  <SectionCard
                    key={section.id}
                    section={section}
                    progress={sectionProgress}
                    isLocked={isLocked}
                    prerequisiteName={isLocked ? prerequisiteSection?.name : undefined}
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

