import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getChapter, getChapterSteps } from '@/lib/chapters'
import { CensusWizard } from '../wizard'
import { getSavedProgress } from '../actions'
import type { CensusStepData, AnswersState } from '@/lib/types'

interface ChapterPageProps {
  params: Promise<{ chapter: string }>
}

export async function generateMetadata({ params }: ChapterPageProps) {
  const { chapter: chapterSlug } = await params
  const chapter = await getChapter(chapterSlug).catch(() => null)
  
  return {
    title: chapter ? `${chapter.name} | Dream Census` : 'Census',
    description: chapter?.description || 'Take the Dream Census survey',
  }
}

/**
 * Find the index of the last answered step in this chapter
 */
function findLastAnsweredStepIndex(answers: AnswersState, steps: CensusStepData[]): number {
  for (let i = steps.length - 1; i >= 0; i--) {
    const key = steps[i].analyticsKey || steps[i].id
    if (answers[key] !== undefined) {
      // Return the next step after the last answered one
      return Math.min(i + 1, steps.length - 1)
    }
  }
  return 0
}

async function ChapterContent({ chapterSlug }: { chapterSlug: string }) {
  // Verify chapter exists
  const chapter = await getChapter(chapterSlug)
  if (!chapter) {
    notFound()
  }

  // Get chapter steps and saved progress
  const [steps, savedProgress] = await Promise.all([
    getChapterSteps(chapterSlug),
    getSavedProgress().catch(() => null), // Graceful fallback
  ])

  // If chapter is empty, redirect back
  if (steps.length === 0) {
    redirect('/census')
  }

  const initialStep = savedProgress 
    ? findLastAnsweredStepIndex(savedProgress.answers, steps)
    : 0

  return (
    <CensusWizard 
      steps={steps} 
      totalSteps={steps.length}
      initialAnswers={savedProgress?.answers ?? {}}
      initialStep={initialStep}
      chapterSlug={chapterSlug}
      chapterName={chapter.name}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-6 w-full max-w-2xl px-6">
        <div className="h-2 w-32 bg-[var(--background-elevated)] rounded" />
        <div className="h-8 w-3/4 bg-[var(--background-elevated)] rounded" />
        <div className="h-4 w-1/2 bg-[var(--background-elevated)] rounded" />
        <div className="space-y-3 mt-8">
          <div className="h-12 bg-[var(--background-elevated)] rounded" />
          <div className="h-12 bg-[var(--background-elevated)] rounded" />
          <div className="h-12 bg-[var(--background-elevated)] rounded" />
        </div>
      </div>
    </div>
  )
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapter } = await params
  
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ChapterContent chapterSlug={chapter} />
    </Suspense>
  )
}

