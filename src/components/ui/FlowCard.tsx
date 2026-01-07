'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './Button'
import { getButtonState, type SkipBehavior } from '@/lib/flow-navigation'

export interface FlowCardProps {
  /** Direction of navigation for animation */
  direction: 'forward' | 'back'
  /** Main question/prompt heading */
  title?: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Step content */
  children: ReactNode
  /** Whether current step has valid input */
  isValid?: boolean
  /** How skipping is handled */
  skipBehavior?: SkipBehavior
  /** Whether this is the last step */
  isLastStep?: boolean
  /** Callback for next/complete action */
  onNext: () => void
  /** Callback for going back */
  onBack: () => void
  /** Optional skip handler */
  onSkip?: () => void
  /** Whether back navigation is allowed */
  canGoBack?: boolean
  /** Whether forward navigation is allowed */
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
  
  // Use skip button if not valid and skippable
  const shouldShowSkip = !isValid && (skipBehavior === 'optional' || skipBehavior === 'skippable') && onSkip

  return (
    <div className="space-y-6">
      {/* Navigation buttons without step counter */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="p-2 text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous step"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div />
        
        {!isLastStep ? (
          <button
            onClick={onNext}
            disabled={!canGoForward || buttonState.disabled}
            className="p-2 text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next step"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-9" /> 
        )}
      </div>
      
      {/* Question/content with animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={stepKey}
          custom={direction}
          initial={{ opacity: 0, x: direction === 'forward' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 'forward' ? -50 : 50 }}
          transition={{ duration: 0.3 }}
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
          <div className="flex justify-center">
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
