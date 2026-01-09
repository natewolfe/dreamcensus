'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

export interface VASSliderProps {
  value: number | null
  onChange: (value: number) => void
  leftLabel: string
  rightLabel: string
  showValue?: boolean
  instruction?: string
  hapticFeedback?: boolean
  disabled?: boolean
  className?: string
}

export function VASSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
  showValue = false,
  instruction,
  hapticFeedback = true,
  disabled = false,
  className,
}: VASSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleChange = (newValue: number) => {
    // Trigger haptic feedback at endpoints
    if (hapticFeedback && 'vibrate' in navigator) {
      if (newValue === 0 || newValue === 100) {
        navigator.vibrate(15)
      }
    }

    onChange(newValue)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
    setShowTooltip(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Keep tooltip visible briefly after release
    setTimeout(() => setShowTooltip(false), 1000)
  }

  const handleTouchStart = () => {
    setIsDragging(true)
    setShowTooltip(true)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setTimeout(() => setShowTooltip(false), 1000)
  }

  const percentage = value !== null ? value : 50

  return (
    <div className={cn('space-y-4', className)}>
      {/* Instruction */}
      {instruction && (
        <p className="text-sm text-muted text-center italic">{instruction}</p>
      )}

      {/* Labels */}
      <div className="flex items-start justify-between text-sm">
        <span className="text-left max-w-[40%] text-muted">{leftLabel}</span>
        <span className="text-right max-w-[40%] text-muted">{rightLabel}</span>
      </div>

      {/* Slider container */}
      <div className="relative py-6">
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && value !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-accent text-foreground text-sm font-medium whitespace-nowrap"
              style={{ left: `${percentage}%` }}
            >
              {value}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slider track and input */}
        <div className="relative">
          <input
            type="range"
            value={value ?? 50}
            onChange={(e) => handleChange(Number(e.target.value))}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            min={0}
            max={100}
            step={1}
            disabled={disabled}
            className={cn(
              'vas-slider w-full cursor-pointer appearance-none bg-transparent',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value ?? 50}
            aria-valuetext={`${value} out of 100`}
          />

          {/* Custom track styling via CSS */}
          <style jsx>{`
            .vas-slider::-webkit-slider-runnable-track {
              width: 100%;
              height: 8px;
              background: linear-gradient(
                to right,
                var(--subtle) 0%,
                var(--accent) 50%,
                var(--accent) ${percentage}%,
                var(--subtle) ${percentage}%,
                var(--subtle) 100%
              );
              border-radius: 9999px;
            }

            .vas-slider::-webkit-slider-thumb {
              appearance: none;
              width: ${isDragging ? '32px' : '28px'};
              height: ${isDragging ? '32px' : '28px'};
              border-radius: 50%;
              background: var(--accent);
              cursor: pointer;
              margin-top: ${isDragging ? '-12px' : '-10px'};
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              transition: all 0.15s ease-out;
            }

            .vas-slider::-moz-range-track {
              width: 100%;
              height: 8px;
              background: var(--subtle);
              border-radius: 9999px;
            }

            .vas-slider::-moz-range-progress {
              height: 8px;
              background: var(--accent);
              border-radius: 9999px;
            }

            .vas-slider::-moz-range-thumb {
              width: ${isDragging ? '32px' : '28px'};
              height: ${isDragging ? '32px' : '28px'};
              border: none;
              border-radius: 50%;
              background: var(--accent);
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              transition: all 0.15s ease-out;
            }
          `}</style>
        </div>
      </div>

      {/* Value display (optional) */}
      {showValue && value !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-lg font-medium text-accent"
        >
          {value}
        </motion.div>
      )}
    </div>
  )
}

