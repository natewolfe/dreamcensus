'use client'

import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useRef } from 'react'

interface StreamCardProps {
  question: {
    id: string
    text: string
    category: string
  }
  onNo: () => void
  onYes: () => void
  onWrite: () => void
  onSkip: () => void
  style?: React.CSSProperties
  isTop?: boolean
  isDesktop?: boolean
}

export function StreamCard({ 
  question, 
  onNo,
  onYes,
  onWrite,
  onSkip,
  style, 
  isTop = false,
  isDesktop = false 
}: StreamCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const isDragging = useRef(false)
  const dragDistance = useRef(0)
  
  const rotation = useTransform(x, [-300, 0, 300], [-15, 0, 15])
  
  // Swipe indicators (only for mobile)
  const yesOpacity = useTransform(x, [0, 150], [0, 1])
  const noOpacity = useTransform(x, [-150, 0], [1, 0])
  const skipOpacity = useTransform(y, [-150, 0], [1, 0])

  const handleDragStart = () => {
    isDragging.current = true
    dragDistance.current = 0
  }

  const handleDrag = (_: any, info: any) => {
    // Track the total drag distance
    dragDistance.current = Math.max(
      dragDistance.current,
      Math.abs(info.offset.x) + Math.abs(info.offset.y)
    )
  }

  const handleDragEnd = (_: any, info: any) => {
    if (isDesktop) return // Disable swipe on desktop
    
    const swipeThreshold = 100
    
    // Check for upward swipe (skip)
    if (info.offset.y < -swipeThreshold) {
      onSkip()
    }
    // Check for horizontal swipes (yes/no)
    else if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        onYes()
      } else {
        onNo()
      }
    } else {
      // Snap back to origin with spring animation if swipe wasn't completed
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }
    
    // Reset dragging state after a brief delay to prevent click from firing
    setTimeout(() => {
      isDragging.current = false
    }, 50)
  }

  const handleClick = () => {
    // Only trigger modal if this was a genuine tap/click with minimal drag
    // Threshold of 10px to account for small unintentional movements
    if (!isDragging.current || dragDistance.current < 10) {
      onWrite()
    }
  }

  // Desktop: Dragging is disabled
  const canDrag = isTop && !isDesktop

  return (
    <motion.div
      drag={canDrag}
      dragConstraints={{ left: -300, right: 300, top: -200, bottom: 50 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 ${canDrag ? 'cursor-grab active:cursor-grabbing' : isTop ? '' : 'pointer-events-none'}`}
      style={{
        ...style,
        x: canDrag ? x : 0,
        y: canDrag ? y : 0,
        rotate: canDrag ? rotation : 0,
      }}
      whileTap={canDrag ? { scale: 1.02 } : undefined}
    >
      {/* The Card */}
      <div 
        className="h-full w-full bg-[var(--background-elevated)] rounded-3xl border-2 border-[var(--border)] shadow-2xl flex flex-col relative overflow-hidden"
        onClick={isTop && !isDesktop ? handleClick : undefined}
      >
        {/* Category Tag */}
        <div className="p-8 pb-0">
          <div className="p-6 w-full text-xs font-medium text-[var(--accent)]/60 uppercase tracking-widest absolute top-0 left-0">
            {question.category}
          </div>
        </div>

        {/* Skip Link */}
        {isTop && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSkip()
            }}
            className="p-3 absolute top-2 right-5 text-md text-[var(--foreground-muted)]/50 hover:text-[var(--foreground-muted)] transition-colors z-10"
          >
            Skip
          </button>
        )}

        {/* Question */}
        <div className="flex-1 flex items-center justify-center px-8">
          <h2 className="text-2xl md:text-3xl font-medium text-center leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Mobile: Swipe hint */}
        {!isDesktop && (
          <div className="text-center text-sm text-[var(--foreground-muted)] pb-6 px-8">
            Tap to expand · Swipe to answer or skip
          </div>
        )}

        {/* Desktop: Edge-to-edge action buttons */}
        {isDesktop && isTop && (
          <div className="flex text-xl border-t border-[rgba(176,147,255,0.15)]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNo()
              }}
              className="flex-1 max-w-[40%] py-5 px-6 text-[var(--foreground-muted)] hover:text-[var(--error)] hover:bg-[rgba(255,82,82,0.08)] transition-all border-r border-[rgba(176,147,255,0.15)] font-medium"
            >
              No
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onWrite()
              }}
              className="w-full max-w-[40%] py-5 px-8 text-[var(--foreground-muted)] hover:text-[var(--accent)] hover:bg-[rgba(176,147,255,0.08)] transition-all border-r border-[rgba(176,147,255,0.15)] font-medium"
            >
              Write
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onYes()
              }}
              className="flex-1 max-w-[40%] py-5 px-6 text-[var(--foreground-muted)] hover:text-[var(--success)] hover:bg-[rgba(105,240,174,0.08)] transition-all font-medium"
            >
              Yes
            </button>
          </div>
        )}

        {/* Mobile: YES indicator */}
        {!isDesktop && (
          <motion.div
            className="absolute top-12 right-12 text-6xl font-bold text-green-500 rotate-12 pointer-events-none"
            style={{ opacity: yesOpacity }}
          >
            YES
          </motion.div>
        )}

        {/* Mobile: NO indicator */}
        {!isDesktop && (
          <motion.div
            className="absolute top-12 left-12 text-6xl font-bold text-red-500 -rotate-12 pointer-events-none"
            style={{ opacity: noOpacity }}
          >
            NO
          </motion.div>
        )}

        {/* Mobile: SKIP indicator */}
        {!isDesktop && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-[var(--foreground-muted)] pointer-events-none"
            style={{ opacity: skipOpacity }}
          >
            SKIP
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
