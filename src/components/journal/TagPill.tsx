'use client'

import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { TagPillProps } from './types'

export function TagPill({
  label,
  source,
  confidence,
  onAccept,
  onDismiss,
  onEdit,
  readonly = false,
}: TagPillProps) {
  const [showUndo, setShowUndo] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const undoTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const touchStartRef = useRef<{ x: number; time: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (readonly) return
    const touch = e.touches[0]
    if (touch) {
      touchStartRef.current = {
        x: touch.clientX,
        time: Date.now(),
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (readonly || !touchStartRef.current) return
    
    const touch = e.touches[0]
    if (!touch) return
    
    const deltaX = touch.clientX - touchStartRef.current.x
    
    // If swiped left significantly, dismiss
    if (deltaX < -80) {
      handleDismiss()
      touchStartRef.current = null
    }
  }

  const handleTouchEnd = () => {
    touchStartRef.current = null
  }

  const handleAccept = () => {
    if (onAccept) {
      onAccept()
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setShowUndo(true)
    
    // Clear existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }
    
    // Auto-confirm dismiss after 5 seconds
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndo(false)
      if (onDismiss) {
        onDismiss()
      }
    }, 5000)
  }

  const handleUndo = () => {
    setIsDismissed(false)
    setShowUndo(false)
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }
  }

  const handleLongPress = () => {
    if (readonly) return
    if (onEdit) {
      onEdit()
    }
  }

  // Long press detection
  const longPressTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const handleMouseDown = () => {
    if (readonly) return
    longPressTimeoutRef.current = setTimeout(handleLongPress, 500)
  }

  const handleMouseUp = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
    }
  }

  if (isDismissed && showUndo) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0.5, scale: 0.9 }}
        className="flex items-center gap-2"
      >
        <span className="text-sm text-muted line-through">{label}</span>
        <button
          onClick={handleUndo}
          className="text-xs text-accent hover:underline"
        >
          Undo
        </button>
      </motion.div>
    )
  }

  if (isDismissed) {
    return null
  }

  const isAISuggested = source === 'ai_suggested'
  const isUserAdded = source === 'user'

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileTap={{ scale: 0.95 }}
      onClick={isAISuggested && !readonly ? handleAccept : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
        'transition-all select-none',
        isAISuggested && 'border-2 border-dashed border-accent/50 bg-accent/10 text-accent',
        isAISuggested && !readonly && 'cursor-pointer hover:border-accent hover:bg-accent/20',
        isUserAdded && 'border border-border bg-card-bg text-foreground',
        readonly && 'cursor-default'
      )}
      disabled={readonly}
    >
      {isAISuggested && !readonly && (
        <span className="text-xs">✨</span>
      )}
      
      <span>{label}</span>
      
      {confidence !== undefined && (
        <span className="text-xs opacity-60">
          {Math.round(confidence * 100)}%
        </span>
      )}
      
      {!readonly && onDismiss && (
        <span
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          className="text-xs opacity-60 hover:opacity-100 ml-0.5"
        >
          ×
        </span>
      )}
    </motion.button>
  )
}

