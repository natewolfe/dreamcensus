'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useCallback } from 'react'
import { SectionRunner } from '@/components/census'
import { PageHeader } from '@/components/layout'
import type { CensusSection } from '@/components/census/types'
import { submitSectionAnswers } from '../actions'
import { Button, Card, Spinner } from '@/components/ui'

interface CategorySectionRunnerProps {
  section: CensusSection
  initialAnswers: Map<string, unknown>
  title: string
  subtitle: string
}

/** Convert answers Map to server action format */
const toAnswersArray = (answers: Map<string, unknown>) =>
  Array.from(answers.entries()).map(([questionId, value]) => ({ questionId, value }))

export function CategorySectionRunner({
  section,
  initialAnswers,
  title,
  subtitle,
}: CategorySectionRunnerProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const currentAnswersRef = useRef<Map<string, unknown>>(initialAnswers)
  
  // Track answer changes from SectionRunner
  const handleAnswersChange = useCallback((answers: Map<string, unknown>, hasChanges: boolean) => {
    currentAnswersRef.current = answers
    setHasUnsavedChanges(hasChanges)
  }, [])

  const handleComplete = async (answers: Map<string, unknown>) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    try {
      const result = await submitSectionAnswers({
        sectionId: section.id,
        answers: toAnswersArray(answers),
      })

      if (result.success) {
        // Navigate back to census overview and refresh to ensure fresh data
        // Don't reset isSubmitting - we're navigating away
        router.push('/census')
        router.refresh()
      } else {
        alert('Failed to save answers: ' + result.error)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('An error occurred while saving your answers')
      setIsSubmitting(false)
    }
  }

  const handleExit = async () => {
    if (isSubmitting) return
    
    // Save partial progress if user has made changes
    if (hasUnsavedChanges) {
      setIsSubmitting(true)
      try {
        await submitSectionAnswers({
          sectionId: section.id,
          answers: toAnswersArray(currentAnswersRef.current),
        })
      } catch (error) {
        console.error('Failed to save partial progress:', error)
        // Continue navigating even if save fails - user chose to exit
      }
    }
    router.push('/census')
    router.refresh()
  }

  if (isSubmitting) {
    return (
      <>
        <PageHeader title={title} subtitle={subtitle} />
        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" />
              <p className="text-muted mt-4">Saving your answers...</p>
            </div>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button variant="secondary" onClick={handleExit}>
            {hasUnsavedChanges ? 'Save & Exit' : 'Exit'}
          </Button>
        }
      />
      <div className="space-y-6">
        <Card padding="lg">
          <SectionRunner
            section={section}
            initialAnswers={initialAnswers}
            onComplete={handleComplete}
            onExit={handleExit}
            onAnswersChange={handleAnswersChange}
          />
        </Card>
      </div>
    </>
  )
}

