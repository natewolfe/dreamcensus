'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button } from '@/components/ui'

type OnboardingStep = 'privacy' | 'rhythm' | 'first_moment' | 'complete'

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

export default function OnboardingSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>('privacy')

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

  const handleComplete = (action: 'morning' | 'census' | 'prompts' | 'skip') => {
    setStep('complete')

    // Show completion animation briefly, then redirect
    setTimeout(() => {
      switch (action) {
        case 'morning':
          router.push('/today?mode=morning')
          break
        case 'census':
          router.push('/census')
          break
        case 'prompts':
          router.push('/today?mode=prompts')
          break
        default:
          router.push('/today')
      }
    }, 1500)
  }

  if (step === 'complete') {
    return <CompletionScreen />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl" padding="lg">
        {step === 'privacy' && (
          <PrivacyScreen
            selections={privacy}
            onChange={setPrivacy}
            onContinue={() => setStep('rhythm')}
          />
        )}

        {step === 'rhythm' && (
          <RhythmScreen
            settings={rhythm}
            onChange={setRhythm}
            onBack={() => setStep('privacy')}
            onContinue={() => setStep('first_moment')}
          />
        )}

        {step === 'first_moment' && (
          <FirstMomentScreen
            onBack={() => setStep('rhythm')}
            onComplete={handleComplete}
          />
        )}
      </Card>
    </div>
  )
}

// Privacy Screen Component
function PrivacyScreen({
  selections,
  onChange,
  onContinue,
}: {
  selections: PrivacySelections
  onChange: (s: PrivacySelections) => void
  onContinue: () => void
}) {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Your privacy choices</h1>
        <p className="text-muted">You can change these anytime in settings</p>
      </div>

      <div className="space-y-3 mb-6">
        {/* Base tier - always on */}
        <div className="rounded-lg border border-border p-4 bg-surface/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold">Private Journal</h3>
                <p className="text-sm text-muted">
                  Your dreams, encrypted and yours alone
                </p>
              </div>
            </div>
            <span className="text-xs text-accent font-medium">Always on ✓</span>
          </div>
        </div>

        {/* Insights tier */}
        <button
          onClick={() => onChange({ ...selections, insights: !selections.insights })}
          className={`w-full rounded-lg border p-4 text-left transition-colors ${
            selections.insights
              ? 'border-accent bg-accent/5'
              : 'border-border bg-surface/50 hover:border-muted'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-semibold">Personal Insights</h3>
                <p className="text-sm text-muted">
                  AI analyzes your dreams for patterns
                </p>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                selections.insights ? 'bg-accent' : 'bg-muted/30'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  selections.insights ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </button>

        {/* Commons tier */}
        <button
          onClick={() =>
            selections.insights &&
            onChange({ ...selections, commons: !selections.commons })
          }
          disabled={!selections.insights}
          className={`w-full rounded-lg border p-4 text-left transition-colors ${
            !selections.insights
              ? 'border-border bg-surface/30 opacity-50 cursor-not-allowed'
              : selections.commons
                ? 'border-accent bg-accent/5'
                : 'border-border bg-surface/50 hover:border-muted'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
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
            <div
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                selections.commons ? 'bg-accent' : 'bg-muted/30'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  selections.commons ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </button>

        {/* Studies tier */}
        <button
          onClick={() =>
            selections.commons &&
            onChange({ ...selections, studies: !selections.studies })
          }
          disabled={!selections.commons}
          className={`w-full rounded-lg border p-4 text-left transition-colors ${
            !selections.commons
              ? 'border-border bg-surface/30 opacity-50 cursor-not-allowed'
              : selections.studies
                ? 'border-accent bg-accent/5'
                : 'border-border bg-surface/50 hover:border-muted'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔬</span>
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
            <div
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                selections.studies ? 'bg-accent' : 'bg-muted/30'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  selections.studies ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </button>
      </div>

      <Button fullWidth onClick={onContinue}>
        Continue →
      </Button>
    </>
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
    <>
      <button
        onClick={onBack}
        className="mb-4 text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Back
      </button>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Your daily rhythm</h1>
        <p className="text-muted">We&apos;ll adapt the app to your sleep schedule</p>
      </div>

      <div className="space-y-6 mb-6">
        {/* Bedtime selection */}
        <div>
          <h3 className="text-center text-lg mb-3">🌙 Bedtime</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {bedtimePresets.map((time) => (
              <button
                key={time}
                onClick={() => onChange({ ...settings, bedtime: time })}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  settings.bedtime === time
                    ? 'bg-accent text-foreground'
                    : 'bg-surface hover:bg-muted/20 border border-border'
                }`}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        </div>

        {/* Wake time selection */}
        <div>
          <h3 className="text-center text-lg mb-3">🌅 Wake time</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {wakeTimePresets.map((time) => (
              <button
                key={time}
                onClick={() => onChange({ ...settings, wakeTime: time })}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  settings.wakeTime === time
                    ? 'bg-accent text-foreground'
                    : 'bg-surface hover:bg-muted/20 border border-border'
                }`}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders */}
        <div className="border-t border-border pt-4">
          <h3 className="text-center text-lg mb-3">Reminders</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 cursor-pointer hover:bg-surface">
              <input
                type="checkbox"
                checked={settings.reminders.preSleep}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    reminders: { ...settings.reminders, preSleep: e.target.checked },
                  })
                }
                className="w-5 h-5 accent-accent"
              />
              <div>
                <p className="font-medium">Pre-sleep check-in</p>
                <p className="text-xs text-muted">30 min before bed</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 cursor-pointer hover:bg-surface">
              <input
                type="checkbox"
                checked={settings.reminders.morning}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    reminders: { ...settings.reminders, morning: e.target.checked },
                  })
                }
                className="w-5 h-5 accent-accent"
              />
              <div>
                <p className="font-medium">Morning capture</p>
                <p className="text-xs text-muted">At wake time</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <Button fullWidth onClick={onContinue}>
        Continue →
      </Button>
    </>
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
    <>
      <button
        onClick={onBack}
        className="mb-4 text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Back
      </button>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">You&apos;re all set!</h1>
        <p className="text-muted">What would you like to do first?</p>
      </div>

      <div className="space-y-3 mb-6">
        <button
          onClick={() => onComplete('morning')}
          className="w-full rounded-lg border border-border p-4 text-left hover:border-accent hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌅</span>
            <div>
              <h3 className="font-semibold">Try Morning Capture</h3>
              <p className="text-sm text-muted">See how dream logging works</p>
              <p className="text-xs text-accent mt-1">~30 seconds</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onComplete('census')}
          className="w-full rounded-lg border border-border p-4 text-left hover:border-accent hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h3 className="font-semibold">Start the Census</h3>
              <p className="text-sm text-muted">Tell us about your sleep patterns</p>
              <p className="text-xs text-accent mt-1">~3 minutes</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onComplete('prompts')}
          className="w-full rounded-lg border border-border p-4 text-left hover:border-accent hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">💭</span>
            <div>
              <h3 className="font-semibold">Explore Prompts</h3>
              <p className="text-sm text-muted">Browse reflection questions</p>
              <p className="text-xs text-accent mt-1">No time limit</p>
            </div>
          </div>
        </button>
      </div>

      <button
        onClick={() => onComplete('skip')}
        className="w-full text-center text-sm text-muted hover:text-foreground transition-colors"
      >
        Skip to Today →
      </button>
    </>
  )
}

// Completion Screen Component
function CompletionScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* Animated constellation effect */}
        <div className="relative mb-6 h-32 w-32 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl animate-pulse">✨</div>
          </div>
          {/* Animated stars */}
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-accent rounded-full animate-ping"
              style={{
                top: `${20 + Math.sin(i * 0.9) * 40}%`,
                left: `${20 + Math.cos(i * 0.9) * 40}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-2">You&apos;re set</h1>
        <p className="text-muted">Your dream journey is ready to begin</p>

        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    </div>
  )
}

