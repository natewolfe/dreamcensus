'use client'

import { Card } from '@/components/ui'
import { InsightsCarousel, type InsightItem } from '@/components/today'

interface ProfileInsightsProps {
  insights: InsightItem[]
  hideHeader?: boolean
}

export function ProfileInsights({ insights, hideHeader = false }: ProfileInsightsProps) {
  return (
    <section id="insights" className="scroll-mt-8">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Personal Insights</h2>
        </div>
      )}
      <Card 
        variant="elevated" 
        padding="none" 
        className="min-h-[220px] flex flex-col h-full"
      >
        <InsightsCarousel insights={insights} linkTo={null} />
      </Card>
    </section>
  )
}
