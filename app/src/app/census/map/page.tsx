import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell, PageHeader } from '@/components/layout'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CensusMap } from './CensusMap'
import { SpinnerFullScreen } from '@/components/ui'

export const metadata = {
  title: 'Census Map | Dream Census',
  description: 'View the complete Dream Census and track your progress',
}

async function CensusMapContent() {
  const session = await getSession()
  
  // Fetch all themes with their questions
  const themes = await db.theme.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      questions: {
        select: { id: true },
      },
      prerequisiteTheme: {
        select: { id: true, slug: true, name: true },
      },
    },
  })

  // Get user's answered questions if logged in
  let answeredQuestionIds = new Set<string>()
  if (session) {
    const answered = await db.questionResponse.findMany({
      where: { userId: session.userId },
      select: { questionId: true },
    })
    answeredQuestionIds = new Set(answered.map(r => r.questionId))
  }

  // Calculate progress for each theme
  const themesWithProgress = themes.map(theme => {
    const totalQuestions = theme.questions.length
    const answeredQuestions = theme.questions.filter(q => 
      answeredQuestionIds.has(q.id)
    ).length
    const percentage = totalQuestions > 0 
      ? Math.round((answeredQuestions / totalQuestions) * 100) 
      : 0
    const isComplete = answeredQuestions >= totalQuestions && totalQuestions > 0
    const isLocked = theme.prerequisiteThemeId && themes.find(t => 
      t.id === theme.prerequisiteThemeId
    )?.questions.some(q => !answeredQuestionIds.has(q.id))

    return {
      id: theme.id,
      slug: theme.slug,
      name: theme.name,
      description: theme.description,
      icon: theme.icon,
      estimatedMinutes: theme.estimatedMinutes,
      totalQuestions,
      answeredQuestions,
      percentage,
      isComplete,
      isLocked: isLocked || false,
      prerequisite: theme.prerequisiteTheme,
    }
  })

  // Calculate overall progress
  const totalQuestions = themesWithProgress.reduce((sum, t) => sum + t.totalQuestions, 0)
  const totalAnswered = themesWithProgress.reduce((sum, t) => sum + t.answeredQuestions, 0)
  const overallPercentage = totalQuestions > 0 
    ? Math.round((totalAnswered / totalQuestions) * 100) 
    : 0

  return (
    <CensusMap 
      themes={themesWithProgress}
      overallProgress={{
        total: totalQuestions,
        answered: totalAnswered,
        percentage: overallPercentage,
      }}
    />
  )
}

export default function CensusMapPage() {
  return (
    <AppShell activeNav="census">
      <PageHeader
        title="The Dream Census"
        subtitle="A comprehensive exploration of your dream life"
      />
      <Suspense fallback={<SpinnerFullScreen />}>
        <CensusMapContent />
      </Suspense>
    </AppShell>
  )
}

