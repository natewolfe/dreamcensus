import { PageHeader } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { JournalList } from '@/components/journal'
import { getDreams } from './actions'

interface JournalPageProps {
  searchParams: Promise<{ tag?: string }>
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = await searchParams
  const result = await getDreams(50, 0)
  const dreams = result.success ? result.data.dreams : []

  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 md:px-6 py-8 md:pb-16">
      <div className="mb-6 md:mb-0">
        <PageHeader
          title="Journal"
          subtitle="Your personal dream archive"
          actions={
            <Button size="md" variant="secondary" href="/journal/new">
              ✏️ New Dream
            </Button>
          }
        />
      </div>

      {dreams.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12 text-muted">
            <div className="mb-4 text-6xl">📖</div>
            <h3 className="text-xl font-semibold mb-2">No dreams yet</h3>
            <p className="text-sm mb-6">
              Start your journey by capturing your first dream
            </p>
            <Button variant="primary" href="/journal/new">
              Capture Your First Dream
            </Button>
          </div>
        </Card>
      ) : (
        <JournalList dreams={dreams} initialSearch={params.tag} />
      )}
    </div>
  )
}

