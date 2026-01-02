'use client'

import Link from 'next/link'

interface TagOccurrence {
  id: string
  startIndex: number
  endIndex: number
  tag: {
    id: string
    name: string
    type: string
  }
  source: string
}

interface EntityOccurrence {
  id: string
  startIndex: number
  endIndex: number
  entity: {
    id: string
    name: string
    type: string
    label?: string | null
  }
}

export interface TaggedTextProps {
  text: string
  tagOccurrences?: TagOccurrence[]
  entityOccurrences?: EntityOccurrence[]
  className?: string
}

interface TextSegment {
  text: string
  type: 'text' | 'tag' | 'entity'
  data?: TagOccurrence | EntityOccurrence
}

export function TaggedText({
  text,
  tagOccurrences = [],
  entityOccurrences = [],
  className = '',
}: TaggedTextProps) {
  // Combine and sort all occurrences
  const allOccurrences = [
    ...tagOccurrences.map(t => ({ ...t, occurrenceType: 'tag' as const })),
    ...entityOccurrences.map(e => ({ ...e, occurrenceType: 'entity' as const })),
  ].sort((a, b) => a.startIndex - b.startIndex)

  // Build segments
  const segments: TextSegment[] = []
  let lastIndex = 0

  for (const occurrence of allOccurrences) {
    // Add any plain text before this occurrence
    if (occurrence.startIndex > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, occurrence.startIndex),
        type: 'text',
      })
    }

    // Add the highlighted occurrence
    segments.push({
      text: text.slice(occurrence.startIndex, occurrence.endIndex),
      type: occurrence.occurrenceType,
      data: occurrence,
    })

    lastIndex = occurrence.endIndex
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      type: 'text',
    })
  }

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.text}</span>
        }

        if (segment.type === 'tag' && segment.data) {
          const tagData = segment.data as TagOccurrence & { occurrenceType: 'tag' }
          return (
            <Link
              key={index}
              href={`/explore/tag/${tagData.tag.name}`}
              className={`${getTagStyle(tagData.tag.type)} cursor-pointer hover:opacity-80 transition-opacity`}
              title={`${tagData.tag.type}: ${tagData.tag.name}`}
            >
              {segment.text}
            </Link>
          )
        }

        if (segment.type === 'entity' && segment.data) {
          const entityData = segment.data as EntityOccurrence & { occurrenceType: 'entity' }
          return (
            <Link
              key={index}
              href={`/journal/entity/${entityData.entity.id}`}
              className="bg-[var(--accent)]/20 text-[var(--accent-glow)] px-1 rounded cursor-pointer hover:bg-[var(--accent)]/30 transition-colors"
              title={`${getEntityIcon(entityData.entity.type)} ${entityData.entity.name}${entityData.entity.label ? ` (${entityData.entity.label})` : ''}`}
            >
              {segment.text}
            </Link>
          )
        }

        return null
      })}
    </div>
  )
}

function getTagStyle(tagType: string): string {
  switch (tagType) {
    case 'symbol':
      return 'bg-blue-500/15 text-blue-400 px-1 rounded'
    case 'emotion':
      return 'bg-pink-500/15 text-pink-400 px-1 rounded'
    case 'theme':
      return 'bg-purple-500/15 text-purple-400 px-1 rounded'
    case 'action':
      return 'bg-green-500/15 text-green-400 px-1 rounded'
    default:
      return 'bg-gray-500/15 text-gray-400 px-1 rounded'
  }
}

function getEntityIcon(type: string): string {
  switch (type) {
    case 'person':
      return '👤'
    case 'place':
      return '📍'
    case 'thing':
      return '🔷'
    default:
      return '🔹'
  }
}

