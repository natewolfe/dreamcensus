'use client'

import { type InputHTMLAttributes, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useEnhancedAnimations } from '@/hooks/use-enhanced-animations'

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  leftLabel?: string
  rightLabel?: string
  showValue?: boolean
  hapticFeedback?: boolean
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  leftLabel,
  rightLabel,
  showValue = false,
  hapticFeedback = false,
  className,
  id,
  ...props
}: SliderProps) {
  const showEffects = useEnhancedAnimations()
  const [isDragging, setIsDragging] = useState(false)
  const [showPopAnimation, setShowPopAnimation] = useState(false)
  const previousValue = useRef(value)
  const percentage = ((value - min) / (max - min)) * 100

  const handleChange = (newValue: number) => {
    // Trigger haptic feedback on certain values
    if (hapticFeedback && 'vibrate' in navigator) {
      if (newValue === min || newValue === max || newValue === (min + max) / 2) {
        navigator.vibrate(10)
      }
    }

    // Trigger pop animation on landmark values
    const landmarkValues = [0, 25, 50, 75, 100]
    const normalizedValue = ((newValue - min) / (max - min)) * 100
    const previousNormalizedValue = ((previousValue.current - min) / (max - min)) * 100
    
    if (showEffects && showValue) {
      const crossedLandmark = landmarkValues.some(landmark => {
        return (previousNormalizedValue < landmark && normalizedValue >= landmark) ||
               (previousNormalizedValue > landmark && normalizedValue <= landmark)
      })
      
      if (crossedLandmark) {
        setShowPopAnimation(true)
        setTimeout(() => setShowPopAnimation(false), 150)
      }
    }
    
    previousValue.current = newValue
    onChange(newValue)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Labels */}
      {(leftLabel || rightLabel) && (
        <div className="mb-3 flex items-center justify-between text-sm text-muted">
          {leftLabel && <span>{leftLabel}</span>}
          {rightLabel && <span>{rightLabel}</span>}
        </div>
      )}

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          id={id}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          min={min}
          max={max}
          step={step}
          className={cn(
            'slider-input w-full cursor-pointer appearance-none bg-transparent',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
          )}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={showValue ? `${value}` : undefined}
          {...props}
        />

        {/* Custom track styling via CSS */}
        <style jsx>{`
          .slider-input::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            background: linear-gradient(
              to right,
              var(--accent) 0%,
              var(--accent) ${percentage}%,
              var(--subtle) ${percentage}%,
              var(--subtle) 100%
            );
            border-radius: 9999px;
          }

          .slider-input::-webkit-slider-thumb {
            appearance: none;
            width: ${isDragging ? '28px' : '24px'};
            height: ${isDragging ? '28px' : '24px'};
            border-radius: 50%;
            background: var(--accent);
            cursor: pointer;
            margin-top: -10px;
            transition: all 0.15s ease-out;
          }

          .slider-input::-moz-range-track {
            width: 100%;
            height: 4px;
            background: var(--subtle);
            border-radius: 9999px;
          }

          .slider-input::-moz-range-progress {
            height: 4px;
            background: var(--accent);
            border-radius: 9999px;
          }

          .slider-input::-moz-range-thumb {
            width: ${isDragging ? '28px' : '24px'};
            height: ${isDragging ? '28px' : '24px'};
            border: none;
            border-radius: 50%;
            background: var(--accent);
            cursor: pointer;
            transition: all 0.15s ease-out;
          }
        `}</style>
      </div>

      {/* Value display */}
      {showValue && (
        <div className={cn(
          'mt-2 text-center text-lg font-medium',
          showPopAnimation && 'slider-value-pop'
        )}>
          {value}
        </div>
      )}
    </div>
  )
}

