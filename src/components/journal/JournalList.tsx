'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input, EmptyState } from '@/components/ui'
import { DreamCard } from './DreamCard'
import { fadeInUp } from '@/lib/motion'
import type { JournalListProps, Dream } from './types'

export function JournalList({ dreams, initialSearch, onSearch }: JournalListProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch ?? '')

  // Filter dreams by search query
  const filteredDreams = useMemo(() => {
    if (!searchQuery.trim()) return dreams

    const query = searchQuery.toLowerCase()
    return dreams.filter((dream) => {
      return (
        dream.title?.toLowerCase().includes(query) ||
        dream.emotions.some((e) => e.toLowerCase().includes(query)) ||
        dream.tags.some((t) => t.toLowerCase().includes(query))
      )
    })
  }, [dreams, searchQuery])

  // Group dreams by date
  const groupedDreams = useMemo(() => {
    const groups: Record<string, Dream[]> = {}

    filteredDreams.forEach((dream) => {
      const date = dream.capturedAt.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(dream)
    })

    return Object.entries(groups).sort((a, b) => {
      // Sort by most recent first
      const dateA = a[1][0]?.capturedAt ? new Date(a[1][0].capturedAt) : new Date(0)
      const dateB = b[1][0]?.capturedAt ? new Date(b[1][0].capturedAt) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  }, [filteredDreams])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleClear = () => {
    setSearchQuery('')
    onSearch?.('')
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="sticky top-0 z-10 backdrop-blur-sm pb-4 text-lg">
        <Input
          type="text"
          placeholder="Search dreams, emotions, tags..."
          value={searchQuery}
          onChange={handleSearchChange}
          clearable
          onClear={handleClear}
        />
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="text-sm text-muted">
          {filteredDreams.length} result{filteredDreams.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Grouped timeline */}
      <AnimatePresence mode="popLayout">
        {groupedDreams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={searchQuery ? "🔍" : "📖"}
              title={searchQuery ? "No dreams match your search" : "No dreams yet"}
              className="py-8"
            />
          </motion.div>
        ) : (
          groupedDreams.map(([date, dateDreams]) => (
            <motion.section
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Date header */}
              <h3 className="text-md font-medium text-muted sticky top-16 pb-3">
                📆 {date}
              </h3>

              {/* Dreams for this date */}
              <div className="space-y-3">
                {dateDreams.map((dream) => (
                  <DreamCard
                    key={dream.id}
                    dream={dream}
                    variant="compact"
                    href={`/journal/${dream.id}`}
                  />
                ))}
              </div>
            </motion.section>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}

