'use client'

import { motion, type HTMLMotionProps } from 'motion/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { DreamSchoolTopic } from './types'

// ============================================================================
// Types (exported for reuse)
// ============================================================================

export type LearnCardSize = 'sm' | 'md' | 'lg' | 'xl'
export type LearnCardVariant = 'card' | 'ghost' | 'plain'
export type LearnCardAlign = 'left' | 'center'
export type LearnCardIconPosition = 'top' | 'left' | 'none'

export interface LearnCardProps {
  topic: DreamSchoolTopic
  size?: LearnCardSize
  variant?: LearnCardVariant
  align?: LearnCardAlign
  iconPosition?: LearnCardIconPosition
  actionLabel?: string
  onDismiss?: () => void
  animate?: boolean
  showGradient?: boolean
  /** Wide cards get extra horizontal padding and vertical centering */
  wide?: boolean
  /** Show the subtitle (default true) */
  showSubtitle?: boolean
  /** Hide subtitle on mobile via CSS (default false) */
  hideSubtitleOnMobile?: boolean
  className?: string
}

// ============================================================================
// Size Configuration
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    icon: 'text-lg',
    title: 'text-sm',
    subtitle: 'text-[12px]',
    height: 'h-auto',
    padding: 'p-2 pb-4',
    gap: 'gap-1',
  },
  md: {
    icon: 'text-xl',
    title: 'text-md',
    subtitle: 'text-xs',
    height: 'h-full md:min-h-[100px]',
    padding: 'p-3 pb-5',
    gap: 'gap-1',
  },
  lg: {
    icon: 'text-2xl',
    title: 'text-lg',
    subtitle: 'text-sm',
    height: 'h-full md:min-h-[120px]',
    padding: 'p-4 pb-6',
    gap: 'gap-2',
  },
  xl: {
    icon: 'text-3xl',
    title: 'text-lg',
    subtitle: 'text-base',
    height: 'h-full md:min-h-[150px]',
    padding: 'p-6 pb-8',
    gap: 'gap-3',
  },
} as const

type SizeConfig = typeof SIZE_CONFIG[LearnCardSize]

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extracts a subtle border color from a gradient class string.
 * Uses a predefined mapping to ensure Tailwind JIT includes these classes.
 * E.g., "from-violet-500/20 to-purple-600/10" -> "border-violet-500/30"
 */
function extractBorderColor(gradientClass: string): string {
  // Map gradient colors to border classes (must be complete strings for Tailwind JIT)
  const colorMap: Record<string, string> = {
    'from-violet-500': 'border-violet-500/30',
    'from-purple-500': 'border-purple-500/30',
    'from-cyan-500': 'border-cyan-500/30',
    'from-teal-500': 'border-teal-500/30',
    'from-blue-500': 'border-blue-500/30',
    'from-indigo-500': 'border-indigo-500/30',
    'from-amber-500': 'border-amber-500/30',
    'from-orange-500': 'border-orange-500/30',
    'from-pink-500': 'border-pink-500/30',
    'from-rose-500': 'border-rose-500/30',
    'from-emerald-500': 'border-emerald-500/30',
    'from-green-500': 'border-green-500/30',
  }

  // Extract the "from-color-shade" part
  const match = gradientClass.match(/from-\w+-\d+/)
  if (match && match[0]) {
    const borderColor = colorMap[match[0]]
    if (borderColor) return borderColor
  }
  return 'border-accent/30'
}

/**
 * Extracts hover border color with increased opacity.
 * E.g., "from-violet-500/20 to-purple-600/10" -> "hover:border-violet-500/50"
 */
function extractHoverBorderColor(gradientClass: string): string {
  const hoverColorMap: Record<string, string> = {
    'from-violet-500': 'hover:border-violet-500/50',
    'from-purple-500': 'hover:border-purple-500/50',
    'from-cyan-500': 'hover:border-cyan-500/50',
    'from-teal-500': 'hover:border-teal-500/50',
    'from-blue-500': 'hover:border-blue-500/50',
    'from-indigo-500': 'hover:border-indigo-500/50',
    'from-amber-500': 'hover:border-amber-500/50',
    'from-orange-500': 'hover:border-orange-500/50',
    'from-pink-500': 'hover:border-pink-500/50',
    'from-rose-500': 'hover:border-rose-500/50',
    'from-emerald-500': 'hover:border-emerald-500/50',
    'from-green-500': 'hover:border-green-500/50',
  }

  const match = gradientClass.match(/from-\w+-\d+/)
  if (match && match[0]) {
    const hoverColor = hoverColorMap[match[0]]
    if (hoverColor) return hoverColor
  }
  return 'hover:border-accent/50'
}

// ============================================================================
// Icon Components (DRY)
// ============================================================================

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ============================================================================
// Shared Content Component (DRY)
// ============================================================================

interface LearnCardContentProps {
  topic: DreamSchoolTopic
  config: SizeConfig
  iconOnTop: boolean
  iconOnLeft: boolean
  showIcon: boolean
  isCenter: boolean
  actionLabel?: string
  hasActionWrapper?: boolean // If true, content is wrapped for justify-between
  showSubtitle?: boolean
  hideSubtitleOnMobile?: boolean
}

function LearnCardContent({
  topic,
  config,
  iconOnTop,
  iconOnLeft,
  showIcon,
  isCenter,
  actionLabel,
  hasActionWrapper = false,
  showSubtitle = true,
  hideSubtitleOnMobile = false,
}: LearnCardContentProps) {
  const content = (
    <>
      {/* Element 1: Icon (or Icon + Title inline) */}
      {showIcon && iconOnTop && <span className={config.icon}>{topic.icon}</span>}
      {showIcon && iconOnLeft && (
        <div className="flex items-center gap-2">
          <span className={config.icon}>{topic.icon}</span>
          <h3 className={cn(config.title, 'font-semibold text-foreground leading-tight')}>
            {topic.title}
          </h3>
        </div>
      )}
      
      {/* Element 2: Title (only if icon not inline) */}
      {(!showIcon || iconOnTop) && (
        <h3 className={cn(config.title, 'font-semibold text-foreground leading-tight')}>
          {topic.title}
        </h3>
      )}
      
      {/* Element 3: Subtitle */}
      {showSubtitle && (
        <span className={cn(config.subtitle, 'text-muted', hideSubtitleOnMobile && 'hidden md:inline')}>
          {topic.subtitle}
        </span>
      )}
    </>
  )

  const actionCTA = actionLabel && (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent group-hover:gap-2 transition-all">
      {actionLabel}
      <ChevronRightIcon className="w-3 h-3" />
    </span>
  )

  // For card variant with action, wrap content for justify-between layout
  if (hasActionWrapper) {
    return (
      <>
        <div className={cn('flex flex-col', config.gap, isCenter ? 'items-center' : 'items-start')}>
          {content}
        </div>
        {actionCTA}
      </>
    )
  }

  // For plain variant, render inline
  return (
    <>
      {content}
      {actionCTA}
    </>
  )
}

// ============================================================================
// Dismiss Button Component
// ============================================================================

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onDismiss()
      }}
      className="absolute top-2 right-2 z-20 w-6 h-6 flex items-center justify-center rounded-full bg-card-bg/80 hover:bg-card-bg text-muted hover:text-foreground transition-colors"
      aria-label="Dismiss"
    >
      <CloseIcon className="w-3 h-3" />
    </button>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function LearnCard({
  topic,
  size = 'md',
  variant = 'card',
  align = 'center',
  iconPosition = 'top',
  actionLabel,
  onDismiss,
  animate = true,
  showGradient = true,
  wide = false,
  showSubtitle = true,
  hideSubtitleOnMobile = false,
  className,
}: LearnCardProps) {
  const config = SIZE_CONFIG[size]
  const isCenter = align === 'center'
  const iconOnTop = iconPosition === 'top'
  const iconOnLeft = iconPosition === 'left'
  const showIcon = iconPosition !== 'none'

  // Animation wrapper props
  const motionProps: HTMLMotionProps<'div'> = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {}

  const contentProps = {
    topic,
    config,
    iconOnTop,
    iconOnLeft,
    showIcon,
    isCenter,
    actionLabel,
    showSubtitle,
    hideSubtitleOnMobile,
  }

  // Plain variant: minimal styling
  if (variant === 'plain') {
    return (
      <motion.div {...motionProps} className={cn('relative', className)}>
        {onDismiss && <DismissButton onDismiss={onDismiss} />}
        <Link href={topic.href} className="block h-full">
          <div
            className={cn(
              'group flex flex-col justify-center p-2 h-full',
              'hover:opacity-80 transition-opacity',
              config.gap,
              isCenter ? 'items-center text-center' : 'items-start'
            )}
          >
            <LearnCardContent {...contentProps} />
          </div>
        </Link>
      </motion.div>
    )
  }

  // Card or Ghost variant: full card with optional gradient
  const isGhost = variant === 'ghost'
  const borderColorClass = !isGhost ? extractBorderColor(topic.color) : ''
  const hoverBorderColorClass = !isGhost ? extractHoverBorderColor(topic.color) : ''
  
  return (
    <motion.div {...motionProps} className={cn('relative flex flex-col h-full', className)}>
      <Link href={topic.href} className="block h-full">
        <div
          className={cn(
            'group relative h-full overflow-hidden rounded-xl',
            'flex justify-center',
            'transition-all duration-300',
            config.height,
            config.padding,
            wide && 'px-6', // Extra horizontal padding for wide cards
            iconOnTop && 'flex-col justify-center',
            iconOnLeft && (wide ? 'gap-4 items-center' : 'gap-3 items-start'),
            isCenter ? 'items-center text-center' : 'items-start',
            isGhost 
              ? 'bg-card-bg/50 border-0 hover:bg-card-bg/60' 
              : cn('bg-card-bg border', borderColorClass, hoverBorderColorClass, 'hover:shadow-lg')
          )}
        >
          {/* Optional gradient background (hidden for ghost variant) */}
          {showGradient && !isGhost && (
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-65 pointer-events-none transition-opacity duration-300',
                topic.color
              )}
            />
          )}
          
          {/* Optional dismiss button */}
          {onDismiss && <DismissButton onDismiss={onDismiss} />}

          {/* Content */}
          <div className={cn(
            'relative z-10 flex flex-col w-full h-full',
            actionLabel ? 'justify-between' : '',
            config.gap,
            isCenter ? 'items-center justify-center' : 'items-start justify-center'
          )}>
            <LearnCardContent {...contentProps} hasActionWrapper={!!actionLabel} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
