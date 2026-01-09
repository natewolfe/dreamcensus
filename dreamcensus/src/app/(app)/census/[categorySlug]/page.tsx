import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getSectionAnswers } from '../actions'
import { CategorySectionRunner } from './CategorySectionRunner'

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params
  
  // Fetch the census section for this category slug
  const section = await db.censusSection.findFirst({
    where: { slug: categorySlug },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
      },
      instrument: true,
    },
  })

  if (!section) {
    notFound()
  }

  // Get existing answers for this section
  const answersResult = await getSectionAnswers(section.id)
  const initialAnswers = answersResult.success ? answersResult.data : new Map<string, unknown>()

  // Transform to frontend types
  const sectionData = {
    id: section.id,
    instrumentId: section.instrumentId,
    name: section.name,
    description: section.description ?? undefined,
    icon: section.icon ?? undefined,
    order: section.sortOrder,
    questions: section.questions.map((q) => ({
      id: q.id,
      sectionId: q.sectionId,
      type: q.type as any,
      text: q.text,
      description: q.helpText ?? undefined,
      required: q.isRequired,
      order: q.sortOrder,
      config: q.props as any,
    })),
    estimatedMinutes: Math.ceil(section.estimatedTime / 60),
  }
  
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      <CategorySectionRunner
        section={sectionData}
        initialAnswers={initialAnswers}
        title={section.name}
        subtitle={section.description ?? 'Complete these questions'}
      />
    </div>
  )
}

