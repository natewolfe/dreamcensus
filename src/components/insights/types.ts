// Insights Component Types

export interface PatternCardProps {
  title: string
  description: string
  confidence?: number
  relatedDreams?: number
  onViewDreams?: () => void
}

