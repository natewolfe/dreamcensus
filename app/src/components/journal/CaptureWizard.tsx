'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createDreamEntry } from '@/app/journal/actions'
import { TextCapture } from './TextCapture'
import { QuickRating } from './QuickRating'
import { DreamTypeToggles } from './DreamTypeToggles'
import { SleepContext } from './SleepContext'

type Step = 'method' | 'capture' | 'feelings' | 'type' | 'sleep' | 'complete'

interface DreamData {
  textRaw: string
  captureMode: 'text' | 'voice' | 'drawing'
  clarity?: number
  lucidity?: number
  emotional?: number
  isNightmare: boolean
  isRecurring: boolean
  sleepDuration?: number
  sleepQuality?: number
}

export function CaptureWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('method')
  const [data, setData] = useState<DreamData>({
    textRaw: '',
    captureMode: 'text',
    isNightmare: false,
    isRecurring: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  const updateData = useCallback((updates: Partial<DreamData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleMethodSelect = (mode: 'text' | 'voice' | 'drawing') => {
    updateData({ captureMode: mode })
    setStep('capture')
  }

  const handleCaptureComplete = async (text: string) => {
    updateData({ textRaw: text })
    setStep('feelings')
  }

  const handleSkipToSave = async () => {
    if (data.textRaw.trim().length === 0) {
      alert('Please write something about your dream first')
      return
    }
    await saveDream()
  }

  const saveDream = async () => {
    setIsSaving(true)
    try {
      const result = await createDreamEntry(data)
      if (result.success && result.dreamId) {
        setStep('complete')
        // Redirect after a moment
        setTimeout(() => {
          router.push(`/journal/${result.dreamId}`)
        }, 1500)
      } else {
        alert(result.error || 'Failed to save dream')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save dream. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-12">
      {/* Step 1: Method Selection */}
      {step === 'method' && (
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl font-medium mb-8" style={{ fontFamily: 'var(--font-family-display)' }}>
            What did you dream?
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleMethodSelect('text')}
              className="p-8 rounded-2xl bg-[var(--background-elevated)] border-2 border-[var(--border)] hover:border-[var(--accent)] transition-all"
            >
              <div className="text-5xl mb-4">✏️</div>
              <div className="text-xl font-medium mb-2">Write</div>
              <div className="text-sm text-[var(--foreground-subtle)]">Type your dream</div>
            </button>
            <button
              onClick={() => handleMethodSelect('voice')}
              className="p-8 rounded-2xl bg-[var(--background-elevated)] border-2 border-[var(--border)] hover:border-[var(--accent)] transition-all"
              disabled
            >
              <div className="text-5xl mb-4 opacity-50">🎙️</div>
              <div className="text-xl font-medium mb-2">Voice</div>
              <div className="text-sm text-[var(--foreground-subtle)]">Coming soon</div>
            </button>
            <button
              onClick={() => handleMethodSelect('drawing')}
              className="p-8 rounded-2xl bg-[var(--background-elevated)] border-2 border-[var(--border)] hover:border-[var(--accent)] transition-all"
              disabled
            >
              <div className="text-5xl mb-4 opacity-50">🎨</div>
              <div className="text-xl font-medium mb-2">Draw</div>
              <div className="text-sm text-[var(--foreground-subtle)]">Coming soon</div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Capture (Text) */}
      {step === 'capture' && (
        <TextCapture
          initialValue={data.textRaw}
          onComplete={handleCaptureComplete}
          onBack={() => setStep('method')}
        />
      )}

      {/* Step 3: Quick Feelings */}
      {step === 'feelings' && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium mb-2">How vivid was this dream?</h2>
            <p className="text-sm text-[var(--foreground-subtle)]">Optional - you can skip this</p>
          </div>
          <QuickRating
            value={data.clarity}
            onChange={(value) => updateData({ clarity: value })}
            label="Clarity"
          />
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSkipToSave}
              className="flex-1 btn btn-secondary"
            >
              Skip & Save
            </button>
            <button
              onClick={() => setStep('type')}
              className="flex-1 btn btn-primary"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Dream Type */}
      {step === 'type' && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium mb-2">Was this dream...</h2>
            <p className="text-sm text-[var(--foreground-subtle)]">Select all that apply</p>
          </div>
          <DreamTypeToggles
            lucid={data.lucidity !== undefined}
            nightmare={data.isNightmare}
            recurring={data.isRecurring}
            onToggleLucid={(value) => updateData({ lucidity: value ? 3 : undefined })}
            onToggleNightmare={(value) => updateData({ isNightmare: value })}
            onToggleRecurring={(value) => updateData({ isRecurring: value })}
          />
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSkipToSave}
              className="flex-1 btn btn-secondary"
            >
              Skip & Save
            </button>
            <button
              onClick={() => setStep('sleep')}
              className="flex-1 btn btn-primary"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Sleep Context */}
      {step === 'sleep' && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium mb-2">About your sleep...</h2>
            <p className="text-sm text-[var(--foreground-subtle)]">Optional sleep details</p>
          </div>
          <SleepContext
            sleepDuration={data.sleepDuration}
            sleepQuality={data.sleepQuality}
            onChangeDuration={(value) => updateData({ sleepDuration: value })}
            onChangeQuality={(value) => updateData({ sleepQuality: value })}
          />
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSkipToSave}
              className="flex-1 btn btn-secondary"
            >
              Skip & Save
            </button>
            <button
              onClick={saveDream}
              className="flex-1 btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Dream'}
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Complete */}
      {step === 'complete' && (
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-3xl font-medium mb-3">Dream Captured</h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            Your dream has been saved to your journal
          </p>
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto" />
        </div>
      )}
    </div>
  )
}

