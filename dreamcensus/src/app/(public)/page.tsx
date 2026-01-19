'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button, Modal } from '@/components/ui'

export default function LandingPage() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const heroCtaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (heroCtaRef.current) {
        const ctaRect = heroCtaRef.current.getBoundingClientRect()
        // Show sticky header when CTA buttons scroll out of view (past top of viewport)
        setShowStickyHeader(ctaRect.bottom < 0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#040508] text-[#e8eaf6] overflow-hidden">
      {/* Animated background layers */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Dream Mist gradient layer */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(149, 117, 205, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(121, 134, 203, 0.12) 0%, transparent 45%)',
          }}
        />
        
        {/* Constellation dots */}
        <ConstellationBackground />
      </div>

      {/* Sticky Header - appears when scrolled past hero CTA */}
      <motion.header 
        initial={false}
        animate={{ 
          y: showStickyHeader ? 0 : -60,
          opacity: showStickyHeader ? 1 : 0,
        }}
        transition={{ 
          duration: 0.4, 
          delay: 0,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={`fixed top-0 left-0 right-0 z-50 bg-[#040508]/90 backdrop-blur-md border-b border-white/5 ${
          showStickyHeader ? '' : 'pointer-events-none'
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#9575cd] to-[#5c6bc0] opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-xs font-bold text-white">DC</span>
            </div>
            <span className="text-base font-semibold tracking-tight">Dreamer</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-[#7986cb] hover:text-[#e8eaf6] transition-colors"
            >
              Sign In
            </Link>
            <Button size="sm" href="/onboarding">Get Started</Button>
          </nav>
        </div>
      </motion.header>

      {/* Static Header - visible at top of page, fades out when sticky appears */}
      <motion.header 
        initial={false}
        animate={{ opacity: showStickyHeader ? 0 : 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 border-b border-white/5"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#9575cd] to-[#5c6bc0] opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-sm font-bold text-white">DC</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Dreamer</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button size="sm" variant="secondary" href="/login">Sign In</Button>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-md font-medium text-[#b093ff] mb-4 tracking-wide"
            >
              A ritual for your inner life
            </motion.p>
            
            {/* Main headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
            >
              Capture your dreams
              <br />
              <span className="text-[#7986cb]">before they fade</span>
            </motion.h1>
            
            {/* Subhead */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-[#9fa8da] leading-relaxed mb-8 mt-6 max-w-2xl"
            >
              A private dream journal designed for the fragile moments after waking. 
              Voice-first capture, personal insights, and open dream research.
            </motion.div>

            {/* CTAs */}
            <motion.div 
              ref={heroCtaRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-6"
            >
              <Button size="lg" href="/onboarding" className="min-w-[180px]">
                Start Your Practice
              </Button>
              <Button size="lg" variant="secondary" href="/login" className="min-w-[140px]">
                Sign In
              </Button>
            </motion.div>

            {/* Trust badge */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowPrivacyModal(true)}
              className="inline-flex items-center gap-2 text-sm text-[#7986cb] hover:text-[#b093ff] transition-colors group"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>End-to-end encrypted. You control everything.</span>
              <span className="text-[#b093ff] group-hover:translate-x-0.5 transition-transform">→</span>
            </motion.button>
          </div>
        </section>

        {/* Feature Showcase */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              delay={0.5}
              icon={<SunriseIcon />}
              title="Morning Mode"
              description="Wake up gently, speak your dream, done. Built for when you're still half-asleep."
              accent="#d4a574"
            />
            <FeatureCard
              delay={0.6}
              icon={<MoonIcon />}
              title="Night Ritual"
              description="Wind down with breathing exercises and prepare your mind for meaningful sleep."
              accent="#7ec8c8"
            />
            <FeatureCard
              delay={0.7}
              icon={<ConstellationIcon />}
              title="Dream Weather"
              description="Track patterns over time. Discover personal insights and xplore the collective unconscious."
              accent="#b093ff"
            />
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-3xl font-bold mb-6"
                >
                  Your daily dream ritual.
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-[#9fa8da] leading-relaxed mb-6"
                >
                  <b>Dreamer</b> isn't about productivity or data collection. It's about creating mindfulness around your dream life. 
                  No streaks that punish you. No notifications that nag. Just a quiet space that's there when you need it.
                </motion.p>
                <motion.ul 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  {[
                    'Skip any step—Dreamer doesn\'t judge',
                    'Auto-save everywhere—nothing gets lost',
                    'Works offline—your dreams, your device',
                    'Delete anytime—no hidden copies',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#c5cae9]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#b093ff]/20 text-[#b093ff]">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </motion.ul>
              </div>
              
              {/* Preview mockup */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-2xl border border-white/10 bg-[#0c0e1a] p-6 shadow-2xl">
                  {/* Mock morning mode screen */}
                  <div className="text-center mb-6">
                    <span className="block text-lg text-[#7986cb] mb-1">Good morning</span>
                    <p className="text-xl font-medium">Anything you remember?</p>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1c2e] border border-white/5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b093ff]/20">
                        <svg className="w-5 h-5 text-[#b093ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <span className="block font-medium text-xl">Record</span>
                        <span className="text-sm text-[#7986cb]">Tap and speak your dream</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#13152a] border border-white/5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7986cb]/20">
                        <svg className="w-5 h-5 text-[#7986cb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <span className="block font-medium text-[#9fa8da] text-xl">Type</span>
                        <span className="text-sm text-[#5c6bc0]">Write at your own pace</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className="block text-center text-sm text-[#5c6bc0]">
                    I only have a feeling →
                  </span>
                </div>
                
                {/* Decorative glow */}
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-[#9575cd]/20 via-transparent to-[#7986cb]/20 blur-2xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="border-t border-white/5 bg-[#0a0c14]">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold mb-4"
              >
                Privacy you can trust
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-[#9fa8da]"
              >
                Your dreams are encrypted on your device before they ever reach our servers. 
                We literally cannot read them.
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              {[
                { icon: '🔒', title: 'Private Journal', desc: 'Always encrypted, always yours' },
                { icon: '✨', title: 'Personal Insights', desc: 'Opt-in AI pattern analysis' },
                { icon: '🌍', title: 'Dream Weather', desc: 'Anonymous collective patterns' },
                { icon: '🔬', title: 'Research Studies', desc: 'Time-limited, fully optional' },
              ].map((tier, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl bg-[#13152a] border border-white/5"
                >
                  <span className="text-2xl mb-3 block">{tier.icon}</span>
                  <h3 className="font-semibold mb-1">{tier.title}</h3>
                  <p className="text-sm text-[#7986cb]">{tier.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-white/5">
          <div className="w-full mx-auto max-w-6xl px-6 py-20 md:py-28 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to remember?
            </motion.h2>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="block text-[#9fa8da] mb-8 max-w-lg mx-auto text-lg"
            >
              Start your dream journal today. Takes 60 seconds to set up, 
              and your first capture is just one tap away.
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button size="lg" href="/onboarding">
                Begin Your Practice →
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#5c6bc0]">
            <p>© 2026 Dream Census. All rights reserved.</p>
            <div className="flex gap-6">
              <button onClick={() => setShowPrivacyModal(true)} className="hover:text-[#9fa8da] transition-colors">
                Privacy
              </button>
              <Link href="/login" className="hover:text-[#9fa8da] transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Modal */}
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  )
}

// Constellation background component
function ConstellationBackground() {
  const stars = [
    { x: 10, y: 15, size: 2, delay: 0 },
    { x: 25, y: 8, size: 1.5, delay: 0.5 },
    { x: 40, y: 20, size: 2.5, delay: 1 },
    { x: 55, y: 5, size: 1, delay: 0.3 },
    { x: 70, y: 18, size: 2, delay: 0.8 },
    { x: 85, y: 10, size: 1.5, delay: 0.2 },
    { x: 15, y: 35, size: 1, delay: 0.6 },
    { x: 30, y: 45, size: 2, delay: 1.2 },
    { x: 60, y: 40, size: 1.5, delay: 0.4 },
    { x: 80, y: 35, size: 2, delay: 0.9 },
    { x: 92, y: 50, size: 1, delay: 0.1 },
    { x: 5, y: 60, size: 2, delay: 0.7 },
    { x: 45, y: 65, size: 1.5, delay: 1.1 },
    { x: 75, y: 70, size: 2, delay: 0.5 },
    { x: 20, y: 80, size: 1, delay: 0.3 },
    { x: 50, y: 85, size: 2.5, delay: 0.8 },
    { x: 88, y: 78, size: 1.5, delay: 0.2 },
  ]

  return (
    <div className="absolute inset-0">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#b093ff]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: 3 + star.delay,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Feature card component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  accent, 
  delay 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  accent: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative p-6 rounded-2xl bg-[#0c0e1a] border border-white/5 hover:border-white/10 transition-colors"
    >
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accent}10, transparent 70%)` }}
      />
      <div className="relative">
        <div 
          className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
          style={{ backgroundColor: `${accent}20` }}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-[#7986cb] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// Icons
function SunriseIcon() {
  return (
    <svg className="w-6 h-6 text-[#d4a574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-6 h-6 text-[#7ec8c8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

function ConstellationIcon() {
  return (
    <svg className="w-6 h-6 text-[#b093ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

// Privacy modal component
function PrivacyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
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
  )
}
