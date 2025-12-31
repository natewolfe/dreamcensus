'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface OpinionSliderProps {
  steps: number
  labels?: { left?: string; center?: string; right?: string }
  value: number | null
  onChange: (value: number) => void
  onSubmit: () => void
}

export function OpinionSlider({
  steps,
  labels,
  value,
  onChange,
  onSubmit,
}: OpinionSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const calculateValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return null

      const rect = trackRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      // Map to 1-based step values
      const rawValue = percentage * (steps - 1) + 1
      return Math.max(1, Math.min(steps, Math.round(rawValue)))
    },
    [steps]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(true)
      const newValue = calculateValueFromPosition(e.clientX)
      if (newValue) onChange(newValue)
    },
    [calculateValueFromPosition, onChange]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newValue = calculateValueFromPosition(e.clientX)
        if (newValue) onChange(newValue)
      }
    },
    [isDragging, calculateValueFromPosition, onChange]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      // Auto-submit after release
      setTimeout(onSubmit, 200)
    }
  }, [isDragging, onSubmit])

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) {
        const val = calculateValueFromPosition(e.clientX)
        setHoverValue(val)
      }
    },
    [isDragging, calculateValueFromPosition]
  )

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setHoverValue(null)
    }
  }, [isDragging])

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const displayValue = value || hoverValue || 0
  const progressPercent = value ? ((value - 1) / (steps - 1)) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Track Container */}
      <div className="relative py-8">
        {/* Labels */}
        <div className="flex justify-between text-sm text-[var(--foreground-subtle)] mb-4">
          {labels?.left && <span>{labels.left}</span>}
          {labels?.center && <span className="absolute left-1/2 transform -translate-x-1/2">{labels.center}</span>}
          {labels?.right && <span>{labels.right}</span>}
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative h-16 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-full cursor-pointer group"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Progress Fill */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/40 via-yellow-500/40 to-green-500/40 rounded-full transition-all pointer-events-none"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Step Markers */}
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            {Array.from({ length: steps }, (_, i) => i + 1).map((num) => {
              const isActive = value === num
              const isHovered = hoverValue === num

              return (
                <div
                  key={num}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isActive || isHovered ? 'scale-125' : 'scale-100'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 transition-all ${
                      isActive
                        ? 'bg-white border-[var(--accent)] shadow-lg'
                        : isHovered
                        ? 'bg-white/50 border-white'
                        : 'bg-white/30 border-white/50'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium transition-all ${
                      isActive || isHovered
                        ? 'text-[var(--foreground)] opacity-100'
                        : 'text-[var(--foreground-subtle)] opacity-50'
                    }`}
                  >
                    {num}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Thumb */}
          {value && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-[var(--accent)] rounded-full shadow-xl transition-all pointer-events-none"
              style={{
                left: `${progressPercent}%`,
                transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.2)' : 'scale(1)'}`,
              }}
            />
          )}
        </div>

        {/* Current Value Display */}
        {displayValue > 0 && (
          <div className="text-center mt-4">
            <span className="text-4xl font-bold text-[var(--accent)]">
              {displayValue}
            </span>
            <span className="text-[var(--foreground-muted)] ml-2">
              of {steps}
            </span>
          </div>
        )}
      </div>

      {/* Fallback Buttons (for accessibility) */}
      <div className="sr-only-focusable flex justify-between gap-2">
        {Array.from({ length: steps }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => {
              onChange(num)
              setTimeout(onSubmit, 300)
            }}
            className="flex-1 py-2 rounded-lg border-2 border-[var(--border)] hover:border-[var(--accent)] focus:border-[var(--accent)] bg-[var(--background-elevated)]"
            aria-label={`Select ${num}`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Helper Text */}
      <p className="text-center text-sm text-[var(--foreground-subtle)]">
        Click or drag along the scale
      </p>
    </div>
  )
}

