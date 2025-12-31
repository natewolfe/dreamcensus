'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

interface SectionTransitionProps {
  chapterName: string
  chapterIcon: string
  completedQuestions: number
  totalQuestions: number
  onContinue: () => void
}

export function SectionTransition({
  chapterName,
  chapterIcon,
  completedQuestions,
  totalQuestions,
  onContinue,
}: SectionTransitionProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    setShow(true)
    
    // Auto-continue after 3 seconds
    const timer = setTimeout(onContinue, 3000)
    return () => clearTimeout(timer)
  }, [onContinue])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)] px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center max-w-2xl">
        {/* Animated Icon */}
        <motion.div
          className="text-8xl mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
        >
          {chapterIcon}
        </motion.div>

        {/* Chapter Complete Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Chapter Complete!
          </h2>
          <p className="text-xl text-[var(--foreground-muted)] mb-8">
            {chapterName}
          </p>
        </motion.div>

        {/* Progress Stats */}
        <motion.div
          className="inline-block p-6 bg-[var(--background-elevated)] rounded-xl border border-[var(--border)] mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-4xl font-bold text-[var(--accent)] mb-2">
            {completedQuestions} / {totalQuestions}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            questions answered
          </div>
        </motion.div>

        {/* Breathing Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[var(--accent)] rounded-full opacity-30"
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                delay: 0.8 + i * 0.05,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Continue Button */}
        <motion.button
          onClick={onContinue}
          className="btn btn-primary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Continue →
        </motion.button>

        {/* Auto-continue hint */}
        <motion.p
          className="text-sm text-[var(--foreground-subtle)] mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Continuing automatically...
        </motion.p>
      </div>
    </motion.div>
  )
}

