'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number
  onDismiss: (id: string) => void
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-green-500/10 text-green-600 border-green-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
}

const variantIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export function Toast({
  id,
  message,
  variant = 'info',
  duration = 5000,
  onDismiss,
}: ToastProps) {
  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(() => onDismiss(id), duration)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn(
        'flex items-center justify-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm',
        'min-w-[320px] max-w-md',
        variantStyles[variant]
      )}
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">
        {variantIcons[variant]}
      </span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  )
}

