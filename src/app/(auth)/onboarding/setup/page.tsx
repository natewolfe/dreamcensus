'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Card, Button, Switch, Input } from '@/components/ui'
import { updateProfile } from '@/app/(app)/profile/actions'

type OnboardingStep = 'name' | 'privacy' | 'rhythm' | 'first_moment' | 'complete'
type Direction = 'forward' | 'back'

interface PrivacySelections {
  insights: boolean
  commons: boolean
  studies: boolean
}

interface RhythmSettings {
  bedtime: string
  wakeTime: string
  reminders: {
    preSleep: boolean
    morning: boolean
  }
}

const slideVariants = {
  enter: (direction: Direction) => ({
    x: direction === 'forward' ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: Direction) => ({
    x: direction === 'forward' ? -100 : 100,
    opacity: 0,
  }),
}

const slideTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
}

export default function OnboardingSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>('name')
  const [direction, setDirection] = useState<Direction>('forward')
  const [displayName, setDisplayName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)

  const [privacy, setPrivacy] = useState<PrivacySelections>({
    insights: true,
    commons: false,
    studies: false,
  })

  const [rhythm, setRhythm] = useState<RhythmSettings>({
    bedtime: '22:00',
    wakeTime: '07:00',
    reminders: {
      preSleep: false,
      morning: true,
    },
  })

  const goTo = (nextStep: OnboardingStep, dir: Direction = 'forward') => {
    setDirection(dir)
    setStep(nextStep)
  }

  const handleNameContinue = async () => {
    if (!displayName.trim()) {
      // Allow skipping name, just continue
      goTo('privacy', 'forward')
      return
    }

    setIsSavingName(true)
    try {
      await updateProfile({ displayName: displayName.trim() })
      goTo('privacy', 'forward')
    } catch (error) {
      console.error('Failed to save name:', error)
      // Continue anyway - can set name later
      goTo('privacy', 'forward')
    } finally {
      setIsSavingName(false)
    }
  }

  const handleComplete = (action: 'morning' | 'census' | 'prompts' | 'skip') => {
    goTo('complete')

    // Show completion animation briefly, then redirect
    setTimeout(() => {
      switch (action) {
        case 'morning':
          router.push('/today/morning')
          break
        case 'census':
          router.push('/census')
          break
        case 'prompts':
          router.push('/prompts')
          break
        default:
          router.push('/today')
      }
    }, 2000)
  }

  // Progress indicator (4 steps now: name, privacy, rhythm, first_moment)
  const stepIndex = ['name', 'privacy', 'rhythm', 'first_moment'].indexOf(step)
  const progress = step === 'complete' ? 100 : ((stepIndex + 1) / 4) * 100

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-40 dream-mist-layer" />
      </div>

      {/* Progress bar */}
      {step !== 'complete' && (
        <div className="relative z-10 px-6 pt-4">
          <div className="max-w-2xl mx-auto">
            <div className="h-1 bg-subtle/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-special-start to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-subtle mt-2">
              Step {stepIndex + 1} of 4
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 'name' && (
            <motion.div
              key="name"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full max-w-xl"
            >
              <NameScreen
                value={displayName}
                onChange={setDisplayName}
                onContinue={handleNameContinue}
                isLoading={isSavingName}
              />
            </motion.div>
          )}

          {step === 'privacy' && (
            <motion.div
              key="privacy"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full max-w-xl"
            >
              <PrivacyScreen
                selections={privacy}
                onChange={setPrivacy}
                onContinue={() => goTo('rhythm', 'forward')}
                onBack={() => goTo('name', 'back')}
              />
            </motion.div>
          )}

          {step === 'rhythm' && (
            <motion.div
              key="rhythm"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full max-w-xl"
            >
              <RhythmScreen
                settings={rhythm}
                onChange={setRhythm}
                onBack={() => goTo('privacy', 'back')}
                onContinue={() => goTo('first_moment', 'forward')}
              />
            </motion.div>
          )}

          {step === 'first_moment' && (
            <motion.div
              key="first_moment"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full max-w-xl"
            >
              <FirstMomentScreen
                onBack={() => goTo('rhythm', 'back')}
                onComplete={handleComplete}
              />
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl"
            >
              <CompletionScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Name Screen Component
function NameScreen({
  value,
  onChange,
  onContinue,
  isLoading,
}: {
  value: string
  onChange: (name: string) => void
  onContinue: () => void
  isLoading: boolean
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onContinue()
    }
  }

  return (
    <Card className="bg-card-bg/80 backdrop-blur-sm border-border" padding="lg">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-4">👋</div>
        <h1 className="text-2xl font-bold mb-2">What should we call you?</h1>
        <p className="text-muted">Your first name is perfect</p>
      </div>

      <div className="mb-8">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your name"
          className="text-center text-lg h-14"
          maxLength={50}
          autoFocus
          autoComplete="given-name"
        />
        <p className="text-xs text-subtle text-center mt-3">
          This will be shown on your profile. You can change it later.
        </p>
      </div>

      <div className="space-y-3">
        <Button 
          fullWidth 
          onClick={onContinue} 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
        
        {!value.trim() && (
          <p className="text-xs text-subtle text-center">
            You can skip this and set your name later
          </p>
        )}
      </div>
    </Card>
  )
}

// Privacy Screen Component
function PrivacyScreen({
  selections,
  onChange,
  onContinue,
  onBack,
}: {
  selections: PrivacySelections
  onChange: (s: PrivacySelections) => void
  onContinue: () => void
  onBack: () => void
}) {
  return (
    <Card className="bg-card-bg/80 backdrop-blur-sm border-border" padding="lg">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Your privacy choices</h1>
        <p className="text-muted">You can change these anytime in settings</p>
      </div>

      <div className="space-y-3 mb-8">
        {/* Base tier - always on */}
        <div className="rounded-xl border border-border p-4 bg-card-bg/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15">
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <h3 className="font-semibold">Private Journal</h3>
                <p className="text-sm text-muted">
                  Your dreams, encrypted and yours alone
                </p>
              </div>
            </div>
            <span className="text-xs text-accent font-medium px-2 py-1 rounded-full bg-accent/10">
              Always on
            </span>
          </div>
        </div>

        {/* Insights tier */}
        <button
          onClick={() => onChange({ ...selections, insights: !selections.insights })}
          className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
            selections.insights
              ? 'border-accent/50 bg-accent/5'
              : 'border-border bg-card-bg/50 hover:border-subtle'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                selections.insights ? 'bg-accent/20' : 'bg-subtle/30'
              }`}>
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="font-semibold">Personal Insights</h3>
                <p className="text-sm text-muted">
                  AI analyzes your dreams for patterns
                </p>
              </div>
            </div>
            <Switch
              checked={selections.insights}
              onChange={(checked) => onChange({ ...selections, insights: checked })}
              aria-label="Enable personal insights"
            />
          </div>
        </button>

        {/* Commons tier */}
        <button
          onClick={() =>
            selections.insights &&
            onChange({ ...selections, commons: !selections.commons })
          }
          disabled={!selections.insights}
          className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
            !selections.insights
              ? 'border-border bg-background/50 opacity-50 cursor-not-allowed'
              : selections.commons
                ? 'border-accent/50 bg-accent/5'
                : 'border-border bg-card-bg/50 hover:border-subtle'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                selections.commons ? 'bg-accent/20' : 'bg-subtle/30'
              }`}>
                <span className="text-xl">🌍</span>
              </div>
              <div>
                <h3 className="font-semibold">Dream Weather</h3>
                <p className="text-sm text-muted">
                  Contribute to collective patterns
                </p>
                {!selections.insights && (
                  <p className="text-xs text-accent mt-1">
                    Requires Personal Insights
                  </p>
                )}
              </div>
            </div>
            <Switch
              checked={selections.commons}
              onChange={(checked) => selections.insights && onChange({ ...selections, commons: checked })}
              disabled={!selections.insights}
              aria-label="Enable dream weather"
            />
          </div>
        </button>

        {/* Studies tier */}
        <button
          onClick={() =>
            selections.commons &&
            onChange({ ...selections, studies: !selections.studies })
          }
          disabled={!selections.commons}
          className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
            !selections.commons
              ? 'border-border bg-background/50 opacity-50 cursor-not-allowed'
              : selections.studies
                ? 'border-accent/50 bg-accent/5'
                : 'border-border bg-card-bg/50 hover:border-subtle'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                selections.studies ? 'bg-accent/20' : 'bg-subtle/30'
              }`}>
                <span className="text-xl">🔬</span>
              </div>
              <div>
                <h3 className="font-semibold">Research Studies</h3>
                <p className="text-sm text-muted">
                  Join time-limited research projects
                </p>
                {!selections.commons && (
                  <p className="text-xs text-accent mt-1">
                    Requires Dream Weather
                  </p>
                )}
              </div>
            </div>
            <Switch
              checked={selections.studies}
              onChange={(checked) => selections.commons && onChange({ ...selections, studies: checked })}
              disabled={!selections.commons}
              aria-label="Enable research studies"
            />
          </div>
        </button>
      </div>

      <Button fullWidth onClick={onContinue} size="lg">
        Continue
      </Button>
    </Card>
  )
}

// Rhythm Screen Component
function RhythmScreen({
  settings,
  onChange,
  onBack,
  onContinue,
}: {
  settings: RhythmSettings
  onChange: (s: RhythmSettings) => void
  onBack: () => void
  onContinue: () => void
}) {
  const bedtimePresets = ['21:00', '22:00', '23:00', '00:00']
  const wakeTimePresets = ['06:00', '07:00', '08:00', '09:00']

  const formatTime = (time: string) => {
    const parts = time.split(':').map(Number)
    const hours = parts[0] ?? 0
    const minutes = parts[1] ?? 0
    const h = hours % 12 || 12
    const ampm = hours < 12 ? 'AM' : 'PM'
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  return (
    <Card className="bg-card-bg/80 backdrop-blur-sm border-border" padding="lg">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Your daily rhythm</h1>
        <p className="text-muted">We'll adapt the app to your sleep schedule</p>
      </div>

      <div className="space-y-8 mb-8">
        {/* Bedtime selection */}
        <div>
          <h3 className="text-center text-lg mb-4 flex items-center justify-center gap-2">
            <span>🌙</span> Bedtime
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {bedtimePresets.map((time) => (
              <button
                key={time}
                onClick={() => onChange({ ...settings, bedtime: time })}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  settings.bedtime === time
                    ? 'bg-accent text-background'
                    : 'bg-card-bg border border-border hover:border-subtle text-muted'
                }`}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        </div>

        {/* Wake time selection */}
        <div>
          <h3 className="text-center text-lg mb-4 flex items-center justify-center gap-2">
            <span>🌅</span> Wake time
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {wakeTimePresets.map((time) => (
              <button
                key={time}
                onClick={() => onChange({ ...settings, wakeTime: time })}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  settings.wakeTime === time
                    ? 'bg-accent text-background'
                    : 'bg-card-bg border border-border hover:border-subtle text-muted'
                }`}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders */}
        <div className="border-t border-border pt-6">
          <h3 className="text-center text-lg mb-4">Reminders</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-4 p-4 rounded-xl bg-card-bg/50 cursor-pointer hover:bg-card-bg transition-colors border border-transparent hover:border-border">
              <input
                type="checkbox"
                checked={settings.reminders.preSleep}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    reminders: { ...settings.reminders, preSleep: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded border-subtle bg-background accent-accent"
              />
              <div>
                <p className="font-medium">Pre-sleep check-in</p>
                <p className="text-xs text-muted">30 min before bed</p>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 rounded-xl bg-card-bg/50 cursor-pointer hover:bg-card-bg transition-colors border border-transparent hover:border-border">
              <input
                type="checkbox"
                checked={settings.reminders.morning}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    reminders: { ...settings.reminders, morning: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded border-subtle bg-background accent-accent"
              />
              <div>
                <p className="font-medium">Morning capture</p>
                <p className="text-xs text-muted">At wake time</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <Button fullWidth onClick={onContinue} size="lg">
        Continue
      </Button>
    </Card>
  )
}

// First Moment Screen Component
function FirstMomentScreen({
  onBack,
  onComplete,
}: {
  onBack: () => void
  onComplete: (action: 'morning' | 'census' | 'prompts' | 'skip') => void
}) {
  return (
    <Card className="bg-card-bg/80 backdrop-blur-sm border-border" padding="lg">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-8 text-center">
        <div className="text-4xl mb-4">✨</div>
        <h1 className="text-2xl font-bold mb-2">You&apos;re all set</h1>
        <p className="text-muted">What would you like to do first?</p>
      </div>

      <div className="space-y-3 mb-6">
        <button
          onClick={() => onComplete('morning')}
          className="w-full rounded-xl border border-border p-5 text-left hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-special-start/15 group-hover:bg-special-start/25 transition-colors">
              <span className="text-2xl">🌅</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-0.5">Try Morning Capture</h3>
              <p className="text-sm text-muted">See how dream logging works</p>
            </div>
            <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">~30s</span>
          </div>
        </button>

        <button
          onClick={() => onComplete('census')}
          className="w-full rounded-xl border border-border p-5 text-left hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-constellation-node/15 group-hover:bg-constellation-node/25 transition-colors">
              <span className="text-2xl">📋</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-0.5">Start the Census</h3>
              <p className="text-sm text-muted">Tell us about your sleep patterns</p>
            </div>
            <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">~3min</span>
          </div>
        </button>

        <button
          onClick={() => onComplete('prompts')}
          className="w-full rounded-xl border border-border p-5 text-left hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 group-hover:bg-accent/25 transition-colors">
              <span className="text-2xl">💭</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-0.5">Explore Prompts</h3>
              <p className="text-sm text-muted">Browse reflection questions</p>
            </div>
            <span className="text-xs text-subtle bg-subtle/30 px-2 py-1 rounded-full">No limit</span>
          </div>
        </button>
      </div>

      <button
        onClick={() => onComplete('skip')}
        className="w-full text-center text-sm text-muted hover:text-accent transition-colors py-2"
      >
        Skip to Today →
      </button>
    </Card>
  )
}

// Completion Screen Component
function CompletionScreen() {
  return (
    <div className="text-center">
      {/* Animated constellation effect */}
      <div className="relative mb-8 h-40 w-40 mx-auto">
        {/* Central glow */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="w-24 h-24 rounded-full bg-accent/30"
            style={{
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
              opacity: 0.3,
            }}
          />
        </motion.div>
        
        {/* Sparkle */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span className="text-5xl">✨</span>
        </motion.div>
        
        {/* Orbiting stars */}
        {[...Array(7)].map((_, i) => {
          const angle = (i / 7) * Math.PI * 2
          const radius = 60
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-accent rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0, 
                opacity: 0 
              }}
              animate={{ 
                x, 
                y, 
                scale: 1, 
                opacity: [0, 1, 0.6, 1],
              }}
              transition={{
                delay: 0.3 + i * 0.1,
                duration: 0.4,
                opacity: {
                  delay: 0.3 + i * 0.1,
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            />
          )
        })}
      </div>

      <motion.h1 
        className="text-2xl font-bold mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        You&apos;re set
      </motion.h1>
      
      <motion.p 
        className="text-muted mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Your dream journey is ready to begin
      </motion.p>

      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </motion.div>
    </div>
  )
}
