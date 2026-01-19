'use client'

import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { generateConstellation, type Star } from './constellation-layout'
import type { CensusSection, CensusProgress } from './types'
import { cn } from '@/lib/utils'

interface CensusConstellationProps {
  sections: CensusSection[]
  progress: Record<string, CensusProgress>
  onSectionClick: (sectionId: string, slug: string) => void
}

interface TooltipState {
  star: Star
  x: number
  y: number
}

// Layout configurations for different screen sizes
const LAYOUTS = {
  mobile: { width: 600, height: 700 },   // Square-ish portrait, uses horizontal space
  desktop: { width: 1200, height: 450 }, // Wide horizontal
} as const

export function CensusConstellation({
  sections,
  progress,
  onSectionClick,
}: CensusConstellationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  
  // Detect screen size
  useEffect(() => {
    setHasMounted(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Get current layout dimensions
  const layout = isMobile ? LAYOUTS.mobile : LAYOUTS.desktop
  
  // Generate constellation layout (memoized, recalculates when layout changes)
  // Only generate after mount to avoid hydration mismatch from floating-point differences
  const { stars, lines } = useMemo(
    () => hasMounted 
      ? generateConstellation(sections, progress, layout.width, layout.height)
      : { stars: [], lines: [] },
    [sections, progress, layout.width, layout.height, hasMounted]
  )
  
  // Scroll to element on page
  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])
  
  const handleStarClick = useCallback((star: Star) => {
    if (star.type === 'kind') {
      // Scroll to the kind section on the page
      scrollToElement(`kind-${star.kindSlug}`)
    } else if (star.type === 'section' && !star.isLocked && star.sectionId && star.slug) {
      // Navigate to section
      onSectionClick(star.sectionId, star.slug)
    }
  }, [onSectionClick, scrollToElement])
  
  // Handle mouse enter/leave for tooltips
  const handleMouseEnter = useCallback((star: Star) => {
    if (!svgRef.current) return
    
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const point = svg.createSVGPoint()
    point.x = star.x
    point.y = star.y
    
    // Convert SVG coordinates to screen coordinates
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    
    const screenPoint = point.matrixTransform(ctm)
    
    setTooltip({
      star,
      x: screenPoint.x - rect.left,
      y: screenPoint.y - rect.top,
    })
  }, [])
  
  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  // Calculate responsive height - always reserve space to prevent layout shift
  const heightStyle = isMobile 
    ? { height: 'clamp(350px, 50vh, 500px)' }
    : { height: 'clamp(280px, 38vh, 450px)' }

  const isReady = stars.length > 0

  return (
    <div 
      className="relative w-full constellation-container"
      style={heightStyle}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
      >
        {isReady && (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="w-full h-full rounded-xl"
            preserveAspectRatio="xMidYMid meet"
          >
        {/* Constellation lines - use CSS variable for accent color */}
        <g className="constellation-lines">
          {lines.map((line, i) => (
            <motion.line
              key={`line-${i}`}
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              className={line.isComplete ? 'stroke-accent' : line.isUnlocked ? 'stroke-accent/60' : 'stroke-accent/15'}
              strokeWidth={line.isComplete ? 3 : line.isUnlocked ? 3 : 3}
              strokeDasharray={line.isComplete ? '0' : '4 4'}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: i * 0.03 }}
            />
          ))}
        </g>

        {/* Stars */}
        <g className="constellation-stars">
          {stars.map((star, i) => {
            const isClickable = star.type === 'kind' || (star.type === 'section' && !star.isLocked)
            // Determine star state for coloring
            const isLocked = star.type === 'kind' ? !star.hasUnlockedSections : star.isLocked
            const isUnlocked = !isLocked && !star.isComplete
            
            // Stroke class: complete=foreground, unlocked=accent, locked=muted
            const strokeClass = star.isComplete 
              ? 'stroke-accent' 
              : isUnlocked 
                ? 'stroke-accent' 
                : 'stroke-muted'
            
            // Stroke opacity based on state (only for incomplete stars)
            const strokeOpacity = isLocked ? 0.4 : 1
            
            return (
              <g key={star.id}>
                {/* Glow effect for unlocked incomplete stars */}
                {isUnlocked && (
                  <motion.circle
                    cx={star.x}
                    cy={star.y}
                    r={star.size * 2}
                    className="fill-accent"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.15, 1],
                      opacity: 0.15
                    }}
                    transition={{ 
                      scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                      opacity: { duration: 0.5, delay: i * 0.02 }
                    }}
                  />
                )}
                
                {/* Star core */}
                <motion.circle
                  cx={star.x}
                  cy={star.y}
                  r={star.size}
                  className={cn(
                    isClickable && 'cursor-pointer',
                    // Complete: colored fill (foreground), no stroke
                    // Incomplete: background fill with colored stroke
                    star.isComplete ? 'fill-accent' : 'fill-background',
                    !star.isComplete && strokeClass
                  )}
                  style={{ pointerEvents: 'all' }}
                  strokeWidth={!star.isComplete ? 3 : 0}
                  strokeOpacity={!star.isComplete ? strokeOpacity : 1}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.02 }}
                  whileHover={isClickable ? { scale: 1.4 } : undefined}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleMouseEnter(star)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Ring for Kind containing the "Next" section */}
                {star.type === 'kind' && star.hasNextSection && (
                  <motion.circle
                    cx={star.x}
                    cy={star.y}
                    r={star.size + 5}
                    fill="none"
                    className="stroke-accent"
                    strokeWidth={2}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.1, 1], opacity: 0.6 }}
                    transition={{ 
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                      opacity: { duration: 0.5, delay: 0.3 }
                    }}
                  />
                )}
                
                {/* Available pulse ring */}
                {star.isAvailable && !isLocked && !star.isComplete && (
                  <motion.circle
                    cx={star.x}
                    cy={star.y}
                    r={star.size + 2}
                    fill="none"
                    className="stroke-accent/50"
                    strokeWidth={1.5}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </g>
            )
          })}
        </g>
          </svg>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 pointer-events-none',
              'px-3 py-2 rounded-lg',
              'bg-card-bg/95 backdrop-blur-sm',
              'border border-border/50 shadow-lg',
              'text-sm'
            )}
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-medium text-foreground">
              {tooltip.star.icon} {tooltip.star.name}
            </div>
            {tooltip.star.type === 'kind' ? (
              <div className="text-xs text-muted mt-0.5">
                {tooltip.star.isComplete 
                  ? '✓ Complete' 
                  : tooltip.star.hasUnlockedSections
                    ? `${tooltip.star.progress}% complete · Click to view`
                    : 'Locked'}
              </div>
            ) : (
              <div className="text-xs text-muted mt-0.5">
                {tooltip.star.isComplete 
                  ? '✓ Complete'
                  : tooltip.star.isLocked
                    ? '🔒 Locked'
                    : tooltip.star.isAvailable
                      ? 'Available · Click to start'
                      : `${tooltip.star.progress}% complete`}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessible hidden buttons for screen readers */}
      <div className="sr-only">
        {stars.filter(s => s.type === 'section' && !s.isLocked).map(star => (
          <button
            key={star.id}
            onClick={() => handleStarClick(star)}
          >
            {star.name} section{star.isComplete ? ' (complete)' : star.isAvailable ? ' (available)' : ''}
          </button>
        ))}
      </div>
    </div>
  )
}
