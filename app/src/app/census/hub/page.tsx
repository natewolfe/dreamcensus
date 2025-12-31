import { Suspense } from 'react'
import { CensusOverview } from '@/components/census/CensusOverview'
import { CensusPageSkeleton } from '@/components/census/CensusPageSkeleton'

export const metadata = {
  title: 'Census | Dream Census',
  description: 'Explore your relationship with dreams through our comprehensive census',
}

export default function CensusHubPage() {
  return (
    <Suspense fallback={<CensusPageSkeleton />}>
      <CensusOverview />
    </Suspense>
  )
}

