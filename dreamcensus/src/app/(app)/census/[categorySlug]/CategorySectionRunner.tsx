'use client'

import { useRouter } from 'next/navigation'
import { SectionRunner } from '@/components/census'
import { PageHeader } from '@/components/layout'
import type { CensusSection } from '@/components/census/types'
import { submitSectionAnswers } from '../actions'
import { useState } from 'react'
import { Button, Card, Spinner } from '@/components/ui'

interface CategorySectionRunnerProps {
  section: CensusSection
  initialAnswers: Map<string, unknown>
  title: string
  subtitle: string
}

export function CategorySectionRunner({
  section,
  initialAnswers,
  title,
  subtitle,
}: CategorySectionRunnerProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleComplete = async (answers: Map<string, unknown>) => {
    setIsSubmitting(true)
    
    try {
      // Convert Map to array for server action
      const answersArray = Array.from(answers.entries()).map(([questionId, value]) => ({
        questionId,
        value,
      }))

      const result = await submitSectionAnswers({
        sectionId: section.id,
        answers: answersArray,
      })

      if (result.success) {
        // Navigate back to census overview
        router.push('/census')
      } else {
        alert('Failed to save answers: ' + result.error)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('An error occurred while saving your answers')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExit = () => {
    router.push('/census')
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
            Exit
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
          />
        </Card>
      </div>
    </>
  )
}

