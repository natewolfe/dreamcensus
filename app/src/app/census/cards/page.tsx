import { Suspense } from 'react'
import { AppShell } from '@/components/layout'
import { getSession } from '@/lib/auth'
import { selectQuestions } from '@/lib/question-selection'
import { CardFlow } from './CardFlow'
import { SpinnerFullScreen } from '@/components/ui'

export const metadata = {
  title: 'Census Cards | Dream Census',
  description: 'Answer census questions at your own pace',
}

async function CardFlowContent({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>
}) {
  const session = await getSession()
  
  if (!session) {
    // Redirect to auth or show guest message
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🌙</div>
          <h2 className="text-2xl font-medium mb-4">Sign in to continue</h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            Create an account to save your progress and explore the Dream Census.
          </p>
        </div>
      </div>
    )
  }

  const params = await searchParams
  const mode = params.theme ? 'theme-focus' : 'mixed'
  const result = await selectQuestions({
    userId: session.userId,
    mode,
    themeSlug: params.theme,
    limit: 20,
  })

  if (result.questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-2xl font-medium mb-4">
            {mode === 'theme-focus' ? 'Theme Complete!' : 'Census Complete!'}
          </h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            {mode === 'theme-focus' 
              ? "You've answered all questions in this theme. Explore other themes or review your answers."
              : "You've completed the Dream Census! Explore your responses or continue with extended questions."
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <CardFlow 
      initialQuestions={result.questions}
      themeProgress={result.themeProgress}
      mode={mode}
    />
  )
}

export default function CardFlowPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>
}) {
  return (
    <AppShell activeNav="census">
      <Suspense fallback={<SpinnerFullScreen />}>
        <CardFlowContent searchParams={searchParams} />
      </Suspense>
    </AppShell>
  )
}

