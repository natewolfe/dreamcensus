import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { DreamDetailClient } from './DreamDetailClient'
import { getDream } from '../actions'

interface DreamDetailPageProps {
  params: {
    id: string
  }
}

export default async function DreamDetailPage({ params }: DreamDetailPageProps) {
  const result = await getDream(params.id)

  if (!result.success) {
    if (result.error === 'Dream not found') {
      notFound()
    }
    // Other errors - redirect to journal
    redirect('/journal')
  }

  const dream = result.data

  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/journal"
          className="text-sm text-muted hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          ← Back to Journal
        </Link>
      </div>

      <DreamDetailClient dream={dream} />
    </div>
  )
}

