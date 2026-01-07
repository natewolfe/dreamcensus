'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface RitualCardProps {
  href: string
  variant: 'waking' | 'bedtime'
  title: string
  subtitle: string
  actionLabel: string
  icon: ReactNode
  metadata?: ReactNode
  className?: string
}

const variantStyles = {
  waking: {
    gradient: 'from-amber-500/10 via-orange-400/5 to-transparent',
    accent: 'text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-400/40',
    glow: 'group-hover:shadow-amber-500/10',
  },
  bedtime: {
    gradient: 'from-indigo-500/10 via-purple-400/5 to-transparent',
    accent: 'text-indigo-400',
    border: 'border-indigo-500/20 hover:border-indigo-400/40',
    glow: 'group-hover:shadow-indigo-500/10',
  },
}

export function RitualCard({
  href,
  variant,
  title,
  subtitle,
  actionLabel,
  icon,
  metadata,
  className,
}: RitualCardProps) {
  const styles = variantStyles[variant]

  return (
    <Link href={href} className="block flex-1 min-w-0">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group relative overflow-hidden rounded-2xl',
          'bg-card-bg border-2 transition-all duration-300',
          'p-4 md:p-6 h-full min-h-[180px] flex flex-col justify-between',
          styles.border,
          'hover:shadow-xl',
          styles.glow,
          className
        )}
      >
        {/* Gradient background */}
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-60',
            styles.gradient
          )} 
        />
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className={cn('text-4xl mb-3', styles.accent)}>
            {icon}
          </div>
          <span className="block mb-2 text-2xl md:text-3xl font-semibold text-foreground">{title}</span>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          {metadata && (
            <div className="mt-3 text-xs text-subtle">{metadata}</div>
          )}
        </div>
        
        {/* Action */}
        <div className="relative z-10 mt-4 text-center">
          <span className={cn(
            'inline-flex items-center gap-1 text-sm md:text-md font-medium',
            styles.accent,
            'group-hover:gap-2 transition-all'
          )}>
            {actionLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </motion.div>
    </Link>
  )
}

