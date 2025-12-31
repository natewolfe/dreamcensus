'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/auth/actions'

interface OnboardingData {
  displayName?: string
  birthYear?: number
  country?: string
  dreamFrequency?: 'rarely' | 'sometimes' | 'often' | 'always'
}

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({})
  const [isLoading, setIsLoading] = useState(false)

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      const result = await completeOnboarding(data)
      
      if (result.success) {
        router.push('/profile')
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      {/* Step 1: Display Name */}
      {step === 1 && (
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-3xl font-medium mb-4">Welcome!</h2>
          <p className="text-[var(--foreground-muted)] mb-8">
            What should we call you?
          </p>
          <input
            type="text"
            value={data.displayName || ''}
            onChange={(e) => updateData({ displayName: e.target.value })}
            placeholder="Your name (optional)"
            className="w-full px-6 py-4 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl text-lg focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all mb-6"
            autoFocus
          />
          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 btn btn-secondary"
            >
              Skip
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 btn btn-primary"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Dream Frequency */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium mb-2">How often do you remember your dreams?</h2>
          </div>
          <div className="space-y-3">
            {[
              { value: 'rarely' as const, label: 'Rarely', description: 'A few times a year' },
              { value: 'sometimes' as const, label: 'Sometimes', description: 'A few times a month' },
              { value: 'often' as const, label: 'Often', description: 'A few times a week' },
              { value: 'always' as const, label: 'Always', description: 'Every day' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  updateData({ dreamFrequency: option.value })
                  setStep(3)
                }}
                className={`
                  w-full p-6 rounded-xl border-2 text-left transition-all
                  ${
                    data.dreamFrequency === option.value
                      ? 'bg-[var(--accent-muted)] border-[var(--accent)]'
                      : 'bg-[var(--background-elevated)] border-[var(--border)] hover:border-[var(--accent)]'
                  }
                `}
              >
                <div className="font-medium mb-1">{option.label}</div>
                <div className="text-sm text-[var(--foreground-subtle)]">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            className="w-full mt-6 btn btn-secondary"
          >
            Skip
          </button>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-medium mb-4">You're all set!</h2>
          <p className="text-[var(--foreground-muted)] mb-8">
            Your account is ready. Start exploring your dream world.
          </p>
          <button
            onClick={handleComplete}
            className="btn btn-primary text-lg px-8 py-4"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Go to Profile →'}
          </button>
        </div>
      )}
    </div>
  )
}

