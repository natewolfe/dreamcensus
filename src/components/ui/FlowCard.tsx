'use client'

import { type ReactNode, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './Button'
import { FlowNavHeader } from './FlowNavHeader'
import { getButtonState, type SkipBehavior } from '@/lib/flow-navigation'
import { slideVariants, slideTransition } from '@/lib/motion'
import type { FlowDirection } from '@/lib/flow/types'

/**
 * Props for FlowCard component
 * 
 * Note: FlowCard does NOT handle progress display (currentStep/totalSteps).
 * For progress tracking, wrap with NavProgress component or use SectionRunner.
 */
export interface FlowCardProps {
  /** Direction of navigation for animation */
  direction: FlowDirection
  /** Main question/prompt heading */
  title?: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Step content */
  children: ReactNode
  /** Whether current step has valid input (default: true) */
  isValid?: boolean
  /** How skipping is handled (default: 'optional') */
  skipBehavior?: SkipBehavior
  /** Whether this is the last step (default: false) */
  isLastStep?: boolean
  /** Callback for next/complete action */
  onNext: () => void
  /** Callback for going back */
  onBack: () => void
  /** Optional skip handler (required if skipBehavior is 'optional' or 'skippable') */
  onSkip?: () => void
  /** Whether back navigation is allowed (default: true) */
  canGoBack?: boolean
  /** Whether forward navigation is allowed (default: true) */
  canGoForward?: boolean
  /** Unique key for animation (use step id or index) */
  stepKey: string
}

/**
 * Flow card component matching SectionRunner layout
 * Used for Morning/Night mode steps
 */
export function FlowCard({
  direction,
  title,
  subtitle,
  children,
  isValid = true,
  skipBehavior = 'optional',
  isLastStep = false,
  onNext,
  onBack,
  onSkip,
  canGoBack = true,
  canGoForward = true,
  stepKey,
}: FlowCardProps) {
  const buttonState = getButtonState(isValid, skipBehavior, isLastStep)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Auto-focus first focusable element after step transition
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const firstFocusable = contentRef.current.querySelector<HTMLElement>(
          'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]:not([disabled])'
        )
        // Only focus if it's an input/textarea (not buttons, to avoid visual jarring)
        if (firstFocusable && (firstFocusable.tagName === 'INPUT' || firstFocusable.tagName === 'TEXTAREA')) {
          firstFocusable.focus()
        }
      }
    }, 350) // After slide animation completes
    
    return () => clearTimeout(timer)
  }, [stepKey])
  
  // Use skip button if not valid and skippable
  const shouldShowSkip = !isValid && (skipBehavior === 'optional' || skipBehavior === 'skippable') && onSkip

  return (
    <div className="space-y-6">
      {/* Navigation buttons without step counter */}
      <FlowNavHeader
        onBack={onBack}
        onForward={!isLastStep ? onNext : undefined}
        canGoBack={canGoBack}
        canGoForward={canGoForward && !buttonState.disabled}
        showForward={!isLastStep}
        backLabel="Previous step"
        forwardLabel="Next step"
      />
      
      {/* Question/content with animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={stepKey}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="space-y-6"
        >
          {/* Title and subtitle */}
          {(title || subtitle) && (
            <div className="text-center">
              {title && (
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-muted">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Step content */}
          <div ref={contentRef} className="flex justify-center">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Bottom action button */}
      <div className="pt-4 space-y-4">
        <Button
          variant={buttonState.variant}
          onClick={shouldShowSkip ? onSkip : onNext}
          disabled={buttonState.disabled}
          fullWidth
        >
          {buttonState.text} →
        </Button>
        
        {/* Show skip link for skippable items that have some input */}
        {shouldShowSkip && skipBehavior === 'skippable' && (
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-muted hover:text-foreground transition-colors text-sm"
            >
              Skip →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
