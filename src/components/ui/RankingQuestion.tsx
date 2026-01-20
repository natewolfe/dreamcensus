'use client'

import { useState } from 'react'
import { motion, Reorder } from 'motion/react'
import { cn } from '@/lib/utils'

export interface RankingItem {
  id: string
  label: string
}

export interface RankingQuestionProps {
  items: RankingItem[]
  value: string[] // Array of item IDs in ranked order
  onChange: (value: string[]) => void
  maxItems?: number
  disabled?: boolean
  className?: string
}

export function RankingQuestion({
  items,
  value,
  onChange,
  maxItems,
  disabled = false,
  className,
}: RankingQuestionProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Ensure value is initialized with all items
  const rankedItems = value.length > 0 ? value : items.map((item) => item.id)

  const handleReorder = (newOrder: readonly string[]) => {
    if (disabled) return
    onChange([...newOrder])
  }

  const handleKeyboardMove = (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = rankedItems.indexOf(itemId)
    if (currentIndex === -1) return

    const newOrder = [...rankedItems]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= rankedItems.length) return

    // Swap items
    const currentItem = newOrder[currentIndex]
    const targetItem = newOrder[targetIndex]
    if (currentItem === undefined || targetItem === undefined) return
    
    newOrder[currentIndex] = targetItem
    newOrder[targetIndex] = currentItem

    onChange(newOrder)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-sm text-muted mb-4">
        Drag items to reorder them from most to least important
        {maxItems && ` (rank top ${maxItems})`}
      </div>

      <Reorder.Group
        axis="y"
        values={rankedItems}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {rankedItems.map((itemId, index) => {
          const item = items.find((i) => i.id === itemId)
          if (!item) return null

          const isDragging = draggedItem === itemId
          const isWithinMax = !maxItems || index < maxItems

          return (
            <Reorder.Item
              key={item.id}
              value={itemId}
              onDragStart={() => setDraggedItem(itemId)}
              onDragEnd={() => setDraggedItem(null)}
              className={cn(
                'relative',
                disabled && 'pointer-events-none'
              )}
            >
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg',
                  'border-2 bg-card-bg transition-all',
                  isDragging
                    ? 'border-accent shadow-lg cursor-grabbing'
                    : 'border-border cursor-grab hover:border-accent/50',
                  !isWithinMax && 'opacity-50',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {/* Rank number */}
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    'font-bold text-sm',
                    isWithinMax
                      ? 'bg-muted text-foreground'
                      : 'bg-subtle/30 text-muted'
                  )}
                >
                  {index + 1}
                </div>

                {/* Drag handle */}
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                  <svg
                    className="w-5 h-5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                </div>

                {/* Item label */}
                <div className="flex-1 font-medium">
                  {item.label}
                </div>

                {/* Keyboard controls */}
                {!disabled && (
                  <div className="flex-shrink-0 flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleKeyboardMove(itemId, 'up')}
                      disabled={index === 0}
                      className={cn(
                        'p-1 rounded hover:bg-subtle/20 transition-colors',
                        index === 0 && 'opacity-30 cursor-not-allowed'
                      )}
                      aria-label="Move up"
                    >
                      <svg
                        className="w-5 h-5 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeyboardMove(itemId, 'down')}
                      disabled={index === rankedItems.length - 1}
                      className={cn(
                        'p-1 rounded hover:bg-subtle/20 transition-colors',
                        index === rankedItems.length - 1 && 'opacity-30 cursor-not-allowed'
                      )}
                      aria-label="Move down"
                    >
                      <svg
                        className="w-5 h-5 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </motion.div>
            </Reorder.Item>
          )
        })}
      </Reorder.Group>

      {maxItems && rankedItems.length > maxItems && (
        <div className="text-sm text-muted text-center pt-2">
          Only the top {maxItems} will be considered
        </div>
      )}
    </div>
  )
}

