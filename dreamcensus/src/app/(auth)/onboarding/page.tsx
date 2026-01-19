'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Button, Modal } from '@/components/ui'
import { createPrivateSession } from '@/app/(auth)/actions'

export default function OnboardingPage() {
  const router = useRouter()
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  const handleStartPrivate = async () => {
    setIsCreatingSession(true)
    try {
      // Create a local-only session (no email required)
      const result = await createPrivateSession()
      if (result.success) {
        router.push('/onboarding/setup')
      }
    } catch (error) {
      console.error('Failed to create private session:', error)
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleSignIn = () => {
    // Redirect to auth flow for email-based account
    router.push('/login?returnTo=/onboarding/setup')
  }

  return (
    <div className="min-h-screen bg-[#040508] text-[#e8eaf6] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(149, 117, 205, 0.2) 0%, transparent 60%)',
          }}
        />
        <ConstellationAnimation />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Logo animation */}
          <motion.div 
            className="relative mb-8 mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative w-20 h-20 mx-auto">
              {/* Glow ring */}
              <motion.div 
                className="absolute inset-0 rounded-2xl"
                style={{ 
                  background: 'radial-gradient(circle, rgba(176, 147, 255, 0.3) 0%, transparent 70%)',
                }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
              />
              {/* Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9575cd] to-[#5c6bc0]">
                  <span className="text-2xl font-bold text-white">DC</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-3xl font-bold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Dreamer
          </motion.h1>

          {/* Tagline */}
          <motion.p 
            className="text-lg text-[#9fa8da] mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            A ritual for understanding your dreams
          </motion.p>

          {/* Action buttons */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              fullWidth 
              size="lg"
              onClick={handleStartPrivate}
              disabled={isCreatingSession}
            >
              {isCreatingSession ? 'Setting up...' : 'Start Private'}
            </Button>
            
            <p className="text-xs text-[#5c6bc0] px-4">
              Your dreams stay on this device only. No account needed.
            </p>
            
            <div className="py-2">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#262942]" />
                <span className="text-xs text-[#5c6bc0]">or</span>
                <div className="h-px flex-1 bg-[#262942]" />
              </div>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              variant="secondary"
              onClick={handleSignIn}
            >
              Sign in for sync
            </Button>
            
            <p className="text-xs text-[#5c6bc0] px-4">
              Create an account to sync across devices and enable backups.
            </p>
          </motion.div>

          {/* Privacy link */}
          <motion.button
            className="mt-8 text-sm text-[#7986cb] hover:text-[#b093ff] transition-colors flex items-center gap-2 mx-auto"
            onClick={() => setShowPrivacyModal(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>How privacy works →</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Privacy Modal */}
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  )
}

// Animated constellation for the welcome screen
function ConstellationAnimation() {
  const stars = [
    { x: 15, y: 20, size: 3 },
    { x: 30, y: 12, size: 2 },
    { x: 45, y: 25, size: 4 },
    { x: 60, y: 15, size: 2 },
    { x: 75, y: 22, size: 3 },
    { x: 85, y: 35, size: 2 },
    { x: 20, y: 45, size: 2 },
    { x: 35, y: 55, size: 3 },
    { x: 55, y: 48, size: 2 },
    { x: 70, y: 58, size: 4 },
    { x: 25, y: 70, size: 3 },
    { x: 50, y: 75, size: 2 },
    { x: 80, y: 72, size: 3 },
  ]

  // Define constellation lines (pairs of star indices)
  const lines: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [6, 7], [7, 8], [8, 9],
    [10, 11], [11, 12],
    [2, 7], [4, 9],
  ]

  return (
    <svg className="absolute inset-0 w-full h-full">
      {/* Draw lines first */}
      {lines.map(([from, to], i) => {
        const fromStar = stars[from]
        const toStar = stars[to]
        if (!fromStar || !toStar) return null
        
        return (
          <motion.line
            key={`line-${i}`}
            x1={`${fromStar.x}%`}
            y1={`${fromStar.y}%`}
            x2={`${toStar.x}%`}
            y2={`${toStar.y}%`}
            stroke="rgba(176, 147, 255, 0.15)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
              delay: 0.8 + i * 0.1, 
              duration: 0.5,
              ease: 'easeOut'
            }}
          />
        )
      })}
      
      {/* Draw stars */}
      {stars.map((star, i) => (
        <motion.circle
          key={`star-${i}`}
          cx={`${star.x}%`}
          cy={`${star.y}%`}
          r={star.size}
          fill="#b093ff"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            scale: { delay: 0.5 + i * 0.05, duration: 0.3 },
            opacity: { 
              delay: 0.5 + i * 0.05,
              duration: 2 + Math.random() * 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            },
          }}
        />
      ))}
    </svg>
  )
}

// Privacy modal
function PrivacyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="How Your Data Stays Safe">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#b093ff]/20">
                <svg className="w-5 h-5 text-[#b093ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">End-to-End Encrypted</h3>
                <p className="text-sm text-muted">
                  Your dream journal is encrypted on your device before it leaves. 
                  We never see the content—only you can read it.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#7986cb]/20">
                <svg className="w-5 h-5 text-[#7986cb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">You Control Everything</h3>
                <p className="text-sm text-muted">
                  Choose what stays private, what gets analyzed for insights, 
                  and what contributes to research. Change your mind anytime.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4a574]/20">
                <svg className="w-5 h-5 text-[#d4a574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Deletable Forever</h3>
                <p className="text-sm text-muted">
                  Export or delete your data at any time. When you delete, 
                  it's gone—no hidden copies, no backups we keep.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button fullWidth onClick={onClose}>Got it</Button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  )
}
