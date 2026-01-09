'use client'

import { AnimatePresence, motion } from 'motion/react'

export interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function LoadingOverlay({
  isVisible,
  message = 'Saving...',
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
        >
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">✨</div>
            <p className="text-muted">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

