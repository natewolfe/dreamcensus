'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { Confetti } from '@/components/ui/Confetti'

export default function CompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-[var(--space-page)]">
      {/* Confetti celebration */}
      <Confetti particleCount={100} duration={4000} />
      
      <motion.div 
        className="max-w-xl text-center relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Decorative element */}
        <motion.div 
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-glow)] flex items-center justify-center shadow-glow"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.4 }}
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-medium mb-6" style={{ fontFamily: 'var(--font-family-display)' }}>
          And that&apos;s it.<br />You&apos;re done!
        </h1>

        <p className="text-xl text-[var(--foreground-muted)] mb-8">
          Thank you for participating in the Dream Census! Your responses help us explore 
          our collective relationship with dreams and build a more communal, informed dream life.
        </p>

        {/* Achievement summary */}
        <div className="bg-[var(--background-elevated)] rounded-2xl p-6 mb-8 text-left">
          <h3 className="text-sm font-medium text-[var(--accent)] mb-4">
            Your Dream Profile is Complete
          </h3>
          <ul className="space-y-3 text-[var(--foreground-muted)]">
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent)]">✦</span>
              <span>All 8 chapters explored</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent)]">✦</span>
              <span>Your insights are now available in your profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent)]">✦</span>
              <span>Compare your dream life with others in the Data section</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/profile" className="btn btn-primary">
            View Your Profile →
          </Link>
          <Link href="/data" className="btn btn-secondary">
            Explore Collective Data
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
            Return Home
          </Link>
          <Link href="/journal" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
            Start Dream Journal
          </Link>
        </div>

        <p className="mt-12 text-sm text-[var(--foreground-subtle)]">
          Follow us on social media to stay informed about how this data is being turned into art.
        </p>
      </motion.div>
    </div>
  )
}
