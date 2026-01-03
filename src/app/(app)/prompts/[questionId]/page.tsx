import { PromptDetailClient } from './PromptDetailClient'
import { getStreamQuestions } from '../actions'
import { notFound } from 'next/navigation'

interface PromptDetailPageProps {
  params: Promise<{ questionId: string }>
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { questionId } = await params
  
  // Fetch questions to find the one we need
  const questionsResult = await getStreamQuestions(100)
  
  if (!questionsResult.success) {
    notFound()
  }

  const question = questionsResult.data.find(q => q.id === questionId)
  
  if (!question) {
    notFound()
  }

  return <PromptDetailClient question={question} />
}

