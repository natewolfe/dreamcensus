'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface VividnessSliderProps {
  value: number
  onChange: (value: number) => void
  leftLabel?: string
  rightLabel?: string
}

export function VividnessSlider({
  value,
  onChange,
  leftLabel = 'Faint',
  rightLabel = 'Crystal clear',
}: VividnessSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showValue, setShowValue] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const handleChange = useCallback((clientX: number) => {
    if (!trackRef.current) return
    
    const rect = trackRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, 
      ((clientX - rect.left) / rect.width) * 100
    ))
    
    onChange(Math.round(percentage))
    
    // Haptic feedback at milestones
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (percentage === 0 || percentage === 50 || percentage === 100) {
        navigator.vibrate(10)
      }
    }
  }, [onChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setShowValue(true)
    handleChange(e.clientX)
  }

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (isDragging) {
      handleChange(e.clientX)
    }
  }, [isDragging, handleChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => setShowValue(false), 1000)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setShowValue(true)
    const touch = e.touches[0]
    if (touch) {
      handleChange(touch.clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0]
      if (touch) {
        handleChange(touch.clientX)
      }
    }
  }

  // Add/remove mouse event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div className="w-full py-4">
      {/* Labels */}
      <div className="flex justify-between mb-3 text-sm text-muted">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${value}% vivid`}
        aria-label="Vividness"
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            onChange(Math.max(0, value - 5))
          } else if (e.key === 'ArrowRight') {
            onChange(Math.min(100, value + 5))
          }
        }}
        className={cn(
          'relative h-2 rounded-full bg-subtle cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
      >
        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          style={{ width: `${value}%` }}
          layout
        />

        {/* Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'h-6 w-6 rounded-full bg-white',
            'shadow-md border-2 border-accent',
            'transition-transform',
            isDragging && 'scale-110'
          )}
          style={{ left: `${value}%` }}
          layout
        />

        {/* Value tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: showValue ? 1 : 0, 
            y: showValue ? 0 : 10 
          }}
          className={cn(
            'absolute -top-8 -translate-x-1/2',
            'px-2 py-1 rounded bg-card-bg border border-border',
            'text-sm font-medium text-foreground',
            'pointer-events-none'
          )}
          style={{ left: `${value}%` }}
        >
          {value}
        </motion.div>
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-2">
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className={cn(
              'w-1 h-1 rounded-full',
              value >= tick ? 'bg-accent' : 'bg-subtle'
            )}
          />
        ))}
      </div>
    </div>
  )
}

