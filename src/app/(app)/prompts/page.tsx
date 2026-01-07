import { PageHeader } from '@/components/layout'
import { PromptStreamClient } from './PromptStreamClient'
import { getStreamQuestionsFormatted } from './actions'

export default async function PromptsPage() {
  const questionsResult = await getStreamQuestionsFormatted(10)

  if (!questionsResult.success) {
    return (
      <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
        <PageHeader
          title="Prompts"
          subtitle="Explore questions about dreams"
        />
        <div className="text-center py-12 text-muted">
          <p>Failed to load questions</p>
        </div>
      </div>
    )
  }

  return (
    <div id="main-content" className="flex flex-col h-screen">
      <PromptStreamClient initialQuestions={questionsResult.data} />
    </div>
  )
}

