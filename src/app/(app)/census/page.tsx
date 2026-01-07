import { PageHeader } from '@/components/layout'
import { CensusOverview } from '@/components/census'
import { getCensusSections, getCensusProgress } from './actions'

export default async function CensusPage() {
  const [sectionsResult, progressResult] = await Promise.all([
    getCensusSections(),
    getCensusProgress(),
  ])

  if (!sectionsResult.success || !progressResult.success) {
    return (
      <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
        <PageHeader
          title="Census"
          subtitle="Help us understand dreaming"
        />
        <div className="text-center py-12 text-muted">
          <p>Failed to load census</p>
        </div>
      </div>
    )
  }

  const sections = sectionsResult.data
  const progress = progressResult.data

  if (sections.length === 0) {
    return (
      <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 md:mb-0">
          <PageHeader
            title="Census"
            subtitle="Help us understand dreaming"
          />
        </div>
        <div className="text-center py-12 text-muted">
          <div className="mb-4 text-6xl">📋</div>
          <h3 className="text-xl font-semibold mb-2">Census coming soon</h3>
          <p className="text-sm">
            Questions will be available after initial setup
          </p>
        </div>
      </div>
    )
  }

  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 md:px-6 py-8 md:pb-16">
      <div className="mb-6 md:mb-0">
        <PageHeader
          title="Census"
          subtitle="Help us understand dreaming"
        />
      </div>

      <CensusOverview
        sections={sections}
        progress={progress}
      />
    </div>
  )
}
