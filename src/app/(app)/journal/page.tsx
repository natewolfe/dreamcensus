import Link from 'next/link'
import { PageHeader } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { JournalList } from '@/components/journal'
import { getDreams } from './actions'

export default async function JournalPage() {
  const result = await getDreams(50, 0)
  const dreams = result.success ? result.data.dreams : []

  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Dream Journal"
        subtitle="Your personal dream archive"
        actions={
          <Link href="/today/morning">
            <Button size="sm">
              + New Dream
            </Button>
          </Link>
        }
      />

      {dreams.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12 text-muted">
            <div className="mb-4 text-6xl">📖</div>
            <h3 className="text-xl font-semibold mb-2">No dreams yet</h3>
            <p className="text-sm mb-6">
              Start your journey by capturing your first dream in Morning Mode
            </p>
            <Link href="/today/morning">
              <Button variant="primary">
                Capture Your First Dream
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <JournalList dreams={dreams} />
      )}
    </div>
  )
}

