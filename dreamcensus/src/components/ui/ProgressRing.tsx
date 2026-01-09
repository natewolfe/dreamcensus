'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  variant?: 'streak' | 'completion' | 'insight'
  children?: React.ReactNode
}

const SIZES = {
  sm: { diameter: 48, stroke: 4, fontSize: 'text-sm' },
  md: { diameter: 80, stroke: 6, fontSize: 'text-2xl' },
  lg: { diameter: 120, stroke: 8, fontSize: 'text-4xl' },
}

export function ProgressRing({
  progress,
  size = 'md',
  showLabel = true,
  label,
  children,
}: ProgressRingProps) {
  const { diameter, stroke, fontSize } = SIZES[size]
  const radius = (diameter - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="var(--ring-track)"
          strokeWidth={stroke}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="var(--ring-fill)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: 'drop-shadow(0 0 4px var(--ring-glow))',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? (
          <>
            <span className={cn(fontSize, 'font-bold text-foreground')}>
              {Math.round(progress)}
            </span>
            {showLabel && label && (
              <span className="text-xs text-muted">{label}</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

