import { Card } from '@/components/ui'
import { InsightsCarousel, type InsightItem } from './InsightsCarousel'
import { CensusCTACard } from './CensusCTACard'

interface InsightsSectionProps {
  insights: InsightItem[]
  censusProgress: number
  censusAnswered: number
  nextSectionName?: string
  nextSectionSlug?: string
}

export function InsightsSection({
  insights,
  censusProgress,
  censusAnswered,
  nextSectionName,
  nextSectionSlug,
}: InsightsSectionProps) {
  return (
    <div className="flex flex-col gap-5 h-[300px] md:h-[340px]">
      {/* Insights carousel card - takes remaining space */}
      <Card 
        variant="dashed" 
        padding="none" 
        className="flex-1 flex flex-col min-h-0"
      >
        <InsightsCarousel insights={insights} />
      </Card>

      {/* Census CTA card - fixed height at bottom */}
      <CensusCTACard
        progress={censusProgress}
        answeredQuestions={censusAnswered}
        nextSectionName={nextSectionName}
        nextSectionSlug={nextSectionSlug}
      />
    </div>
  )
}
