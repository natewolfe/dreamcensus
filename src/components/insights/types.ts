// Insights Component Types

export type NodeType = 'person' | 'place' | 'symbol' | 'theme' | 'emotion'

export interface ConstellationNode {
  id: string
  label: string
  type: NodeType
  frequency: number
  lastSeen: Date
  connections: string[]
}

export interface ConstellationViewProps {
  nodes: ConstellationNode[]
  timeRange: '7d' | '30d' | '90d' | 'all'
  onNodeSelect: (id: string) => void
  layout?: 'radial' | 'grid'
}

export interface PatternCardProps {
  title: string
  description: string
  confidence?: number
  relatedDreams?: number
  onViewDreams?: () => void
}

