import { PageHeader } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import Link from 'next/link'

interface FormPageProps {
  params: Promise<{ categorySlug: string; formSlug: string }>
}

export default async function FormPage({ params }: FormPageProps) {
  const { categorySlug, formSlug } = await params
  
  // TODO: Fetch form and questions from DB after migration
  // For now, return a placeholder
  
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Form Runner"
        subtitle={`${categorySlug} / ${formSlug}`}
      />

      <div className="space-y-6">
        <Card padding="lg">
          <p className="text-muted text-center py-8">
            Form runner will be available after schema migration
          </p>
          <div className="flex justify-center">
            <Link href={`/census/${categorySlug}`}>
              <Button variant="secondary">
                ← Back to Category
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

