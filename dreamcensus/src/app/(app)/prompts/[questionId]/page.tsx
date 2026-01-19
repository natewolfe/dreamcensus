import { PromptDetailClient } from './PromptDetailClient'
import { getStreamQuestionsFormatted } from '../actions'
import { notFound } from 'next/navigation'

interface PromptDetailPageProps {
  params: Promise<{ questionId: string }>
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { questionId } = await params
  
  const result = await getStreamQuestionsFormatted(50)
  
  if (!result.success || result.data.length === 0) {
    notFound()
  }

  // Find the starting index for the requested question
  const startIndex = result.data.findIndex(q => q.id === questionId)
  
  if (startIndex === -1) {
    notFound()
  }

  return (
    <PromptDetailClient 
      questions={result.data} 
      initialIndex={startIndex} 
    />
  )
}

