'use client'

import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { BINARY_VARIANT_CONFIG, type BinaryValue } from '@/lib/flow/types'
import type { PromptQuestion } from './usePromptState'

interface PromptCardProps {
  question: PromptQuestion
  onResponse: (response: BinaryValue) => void
  onSkip: () => void
  onExpand: () => void
  style?: React.CSSProperties
  isTop?: boolean
  isDesktop?: boolean
}

export function PromptCard({ 
  question, 
  onResponse,
  onSkip,
  onExpand,
  style, 
  isTop = false,
  isDesktop = false 
}: PromptCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const isDragging = useRef(false)
  const dragDistance = useRef(0)
  
  const rotation = useTransform(x, [-300, 0, 300], [-15, 0, 15])
  
  // Swipe indicators (only for mobile)
  const yesOpacity = useTransform(x, [0, 150], [0, 1])
  const noOpacity = useTransform(x, [-150, 0], [1, 0])
  const skipOpacity = useTransform(y, [-150, 0], [1, 0])

  // Get response values from shared config (uppercase for card UI)
  const config = BINARY_VARIANT_CONFIG[question.variant]
  const responseValues = {
    left: config.left,
    right: config.right,
    leftLabel: config.leftLabel.toUpperCase(),
    rightLabel: config.rightLabel.toUpperCase(),
  }

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
        onResponse(responseValues.right)
      } else {
        onResponse(responseValues.left)
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
    // Only trigger expand if this was a genuine tap/click with minimal drag
    if (!isDragging.current || dragDistance.current < 10) {
      onExpand()
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
      className={cn(
        'absolute inset-0',
        canDrag && 'cursor-grab active:cursor-grabbing',
        !canDrag && !isTop && 'pointer-events-none'
      )}
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
        className="h-full w-full bg-card-bg rounded-3xl border-2 border-border shadow-2xl flex flex-col relative overflow-hidden"
        onClick={isTop && !isDesktop ? handleClick : undefined}
      >
        {/* Category Tag - absolutely positioned */}
        <div className="absolute top-0 left-0 p-6 text-xs font-medium text-accent uppercase tracking-widest">
          {question.category}
        </div>

        {/* Skip Link */}
        {isTop && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSkip()
            }}
            className="p-3 absolute top-2 right-5 text-md text-muted hover:text-foreground transition-colors z-10 opacity-30 hover:opacity-100"
          >
            Skip
          </button>
        )}

        {/* Question - click to expand on desktop */}
        <div 
          className={cn(
            "flex-1 flex items-center justify-center pt-6 px-8 md:px-10",
            isDesktop && isTop && "cursor-pointer hover:bg-accent/5 transition-colors"
          )}
          onClick={isDesktop && isTop ? onExpand : undefined}
        >
          <h2 className="text-2xl md:text-3xl font-medium text-center leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Mobile: Swipe hint */}
        {!isDesktop && (
          <div className="text-center text-sm text-muted pb-6 px-8">
            Tap to expand · Swipe to answer or skip
          </div>
        )}

        {/* Desktop: Edge-to-edge action buttons */}
        {isDesktop && isTop && (
          <div className="flex text-xl border-t border-border">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onResponse(responseValues.left)
              }}
              className="flex-1 max-w-[40%] py-5 px-6 text-muted hover:text-[var(--response-no)] hover:bg-[var(--response-no-bg)] transition-all border-r border-border font-medium"
            >
              {responseValues.leftLabel}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onExpand()
              }}
              className="w-full max-w-[40%] py-5 px-8 text-muted hover:text-accent hover:bg-accent/10 transition-all border-r border-border font-medium uppercase"
            >
              More
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onResponse(responseValues.right)
              }}
              className="flex-1 max-w-[40%] py-5 px-6 text-muted hover:text-[var(--response-yes)] hover:bg-[var(--response-yes-bg)] transition-all font-medium"
            >
              {responseValues.rightLabel}
            </button>
          </div>
        )}

        {/* Mobile: Response indicators during swipe */}
        {!isDesktop && (
          <>
            <motion.div
              className="absolute top-12 right-12 text-6xl font-bold text-[var(--response-yes)] rotate-12 pointer-events-none"
              style={{ opacity: yesOpacity }}
            >
              {responseValues.rightLabel}
            </motion.div>

            <motion.div
              className="absolute top-12 left-12 text-6xl font-bold text-[var(--response-no)] -rotate-12 pointer-events-none"
              style={{ opacity: noOpacity }}
            >
              {responseValues.leftLabel}
            </motion.div>

            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-muted pointer-events-none"
              style={{ opacity: skipOpacity }}
            >
              SKIP
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}
