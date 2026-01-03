'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { ConstellationViewProps, NodeType } from './types'

const NODE_COLORS: Record<NodeType, string> = {
  person: '#f06292',
  place: '#4dd0e1',
  symbol: '#aed581',
  theme: '#ffb74d',
  emotion: '#b39ddb',
}

export function ConstellationView({
  nodes,
  timeRange,
  onNodeSelect,
}: ConstellationViewProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [, setHoveredNode] = useState<string | null>(null)

  if (nodes.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12 text-muted">
          <div className="mb-3 text-4xl">✨</div>
          <p className="text-sm">
            Capture more dreams with tags to see your constellation
          </p>
        </div>
      </Card>
    )
  }

  const maxFrequency = Math.max(...nodes.map((n) => n.frequency), 1)

  const getNodeSize = (frequency: number) => {
    const ratio = frequency / maxFrequency
    if (ratio > 0.7) return 'w-16 h-16 text-base'
    if (ratio > 0.4) return 'w-12 h-12 text-sm'
    return 'w-10 h-10 text-xs'
  }

  const getNodeOpacity = (node: typeof nodes[0]) => {
    const daysSince = Math.floor(
      (Date.now() - node.lastSeen.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSince < 7) return 'opacity-100'
    if (daysSince < 30) return 'opacity-75'
    return 'opacity-50'
  }

  // Simple grid layout for now (force-directed would require D3 or similar)
  return (
    <div className="space-y-6">
      {/* Time range */}
      <div className="text-sm text-muted">
        {timeRange === 'all' ? 'All time' : `Last ${timeRange}`}
      </div>

      {/* Constellation */}
      <div className="relative min-h-[400px] rounded-xl bg-card-bg border border-border p-8">
        <div className="flex flex-wrap gap-6 justify-center items-center">
          {nodes.map((node, index) => {
            const isSelected = selectedNode === node.id
            const isConnected = selectedNode && node.connections.includes(selectedNode)

            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedNode(node.id)
                  onNodeSelect(node.id)
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={cn(
                  getNodeSize(node.frequency),
                  getNodeOpacity(node),
                  'rounded-full flex items-center justify-center',
                  'font-medium transition-all',
                  'border-2',
                  isSelected && 'ring-4 ring-accent/30 scale-110',
                  isConnected && 'ring-2 ring-accent/50',
                  !isSelected && !isConnected && 'hover:ring-2 hover:ring-accent/30'
                )}
                style={{
                  backgroundColor: NODE_COLORS[node.type],
                  borderColor: NODE_COLORS[node.type],
                  color: '#fff',
                }}
                title={`${node.label} (${node.frequency} times)`}
              >
                <span className="truncate px-2">{node.label}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Selected node details */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border"
          >
            {(() => {
              const node = nodes.find((n) => n.id === selectedNode)
              if (!node) return null

              return (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">
                      {node.label}
                    </h4>
                    <p className="text-sm text-muted">
                      {node.type} · {node.frequency} appearance{node.frequency !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-subtle mt-1">
                      Last seen: {node.lastSeen.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-muted hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              )
            })()}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs">
        {(Object.entries(NODE_COLORS) as [NodeType, string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-muted capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

