import { Suspense } from 'react'
import { AppShell, PageHeader } from '@/components/layout'
import { CensusOverview } from '@/components/census/CensusOverview'
import { CensusPageSkeleton } from '@/components/census/CensusPageSkeleton'

export const metadata = {
  title: 'Census | Dream Census',
  description: 'Explore your relationship with dreams through our comprehensive census',
}

export default function CensusPage() {
  return (
    <AppShell activeNav="census">
      <PageHeader
        title="The Census"
        subtitle="Explore your relationship with dreams"
      />
      <Suspense fallback={<CensusPageSkeleton />}>
        <CensusOverview />
      </Suspense>
    </AppShell>
  )
}

