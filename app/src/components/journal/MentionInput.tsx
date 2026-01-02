'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export interface Entity {
  id: string
  name: string
  type: 'person' | 'place' | 'thing'
  label?: string | null
}

export interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  entities: Entity[]
  onCreateEntity?: (name: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function MentionInput({
  value,
  onChange,
  entities,
  onCreateEntity,
  placeholder = 'Write your dream...',
  className = '',
  rows = 6,
}: MentionInputProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })
  const [mentionQuery, setMentionQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter entities based on mention query
  const filteredEntities = mentionQuery
    ? entities.filter(e =>
        e.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : entities

  // Detect @ mentions
  useEffect(() => {
    if (!textareaRef.current) return

    const text = value
    const cursor = cursorPosition
    
    // Find @ before cursor
    let atIndex = -1
    for (let i = cursor - 1; i >= 0; i--) {
      if (text[i] === '@') {
        // Check if there's a space or start of string before @
        if (i === 0 || /\s/.test(text[i - 1])) {
          atIndex = i
          break
        }
      }
      // Stop if we hit whitespace (not part of mention)
      if (/\s/.test(text[i])) {
        break
      }
    }

    if (atIndex >= 0) {
      const query = text.slice(atIndex + 1, cursor)
      // Only show autocomplete if query doesn't contain spaces
      if (!/\s/.test(query)) {
        setMentionQuery(query)
        setShowAutocomplete(true)
        setSelectedIndex(0)
        
        // Calculate position for autocomplete dropdown
        const textarea = textareaRef.current
        const computed = window.getComputedStyle(textarea)
        const lineHeight = parseInt(computed.lineHeight)
        const paddingTop = parseInt(computed.paddingTop)
        
        // Approximate position (simplified)
        setAutocompletePosition({
          top: paddingTop + lineHeight,
          left: 10,
        })
        return
      }
    }

    setShowAutocomplete(false)
    setMentionQuery('')
  }, [value, cursorPosition])

  const insertMention = (entity: Entity) => {
    if (!textareaRef.current) return

    const text = value
    const cursor = cursorPosition
    
    // Find @ position
    let atIndex = -1
    for (let i = cursor - 1; i >= 0; i--) {
      if (text[i] === '@') {
        if (i === 0 || /\s/.test(text[i - 1])) {
          atIndex = i
          break
        }
      }
      if (/\s/.test(text[i])) break
    }

    if (atIndex >= 0) {
      const before = text.slice(0, atIndex)
      const after = text.slice(cursor)
      const newText = `${before}@${entity.name} ${after}`
      onChange(newText)
      
      // Set cursor after mention
      const newCursor = atIndex + entity.name.length + 2
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursor, newCursor)
          setCursorPosition(newCursor)
        }
      }, 0)
    }

    setShowAutocomplete(false)
    setMentionQuery('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filteredEntities.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (selectedIndex < filteredEntities.length) {
        insertMention(filteredEntities[selectedIndex])
      } else if (onCreateEntity && mentionQuery) {
        // Create new entity option is selected
        onCreateEntity(mentionQuery)
        setShowAutocomplete(false)
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false)
    }
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return '👤'
      case 'place': return '📍'
      case 'thing': return '🔷'
      default: return '🔹'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setCursorPosition(e.target.selectionStart)
        }}
        onSelect={(e) => {
          setCursorPosition(e.currentTarget.selectionStart)
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 bg-[var(--background-subtle)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] outline-none transition-colors resize-none"
      />

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {showAutocomplete && (filteredEntities.length > 0 || onCreateEntity) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden max-h-60 w-full max-w-xs"
            style={{
              top: autocompletePosition.top,
              left: autocompletePosition.left,
            }}
          >
            <div className="overflow-y-auto max-h-60">
              {filteredEntities.map((entity, index) => (
                <button
                  key={entity.id}
                  onClick={() => insertMention(entity)}
                  className={`w-full text-left px-4 py-2 transition-colors flex items-center gap-3 ${
                    index === selectedIndex
                      ? 'bg-[var(--accent-muted)] text-[var(--foreground)]'
                      : 'hover:bg-[var(--background-subtle)] text-[var(--foreground-muted)]'
                  }`}
                >
                  <span className="text-xl">{getEntityIcon(entity.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium">{entity.name}</div>
                    {entity.label && (
                      <div className="text-xs text-[var(--foreground-subtle)]">
                        {entity.label}
                      </div>
                    )}
                  </div>
                </button>
              ))}
              
              {/* Create new entity option */}
              {onCreateEntity && mentionQuery && (
                <button
                  onClick={() => {
                    onCreateEntity(mentionQuery)
                    setShowAutocomplete(false)
                  }}
                  className={`w-full text-left px-4 py-2 border-t border-[var(--border)] transition-colors flex items-center gap-3 ${
                    selectedIndex === filteredEntities.length
                      ? 'bg-[var(--accent-muted)] text-[var(--foreground)]'
                      : 'hover:bg-[var(--background-subtle)] text-[var(--foreground-muted)]'
                  }`}
                >
                  <span className="text-xl">➕</span>
                  <div>
                    <div className="font-medium">Create "{mentionQuery}"</div>
                    <div className="text-xs text-[var(--foreground-subtle)]">
                      Add as new entity
                    </div>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

