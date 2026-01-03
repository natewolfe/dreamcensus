'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'motion/react'
import { MorningStart } from './MorningStart'
import { QuickFacts } from './QuickFacts'
import { VoiceCapture } from './VoiceCapture'
import { TextCapture } from './TextCapture'
import { MicroStructure } from './MicroStructure'
import { FastTags } from './FastTags'
import { CloseRitual } from './CloseRitual'
import { DreamComplete } from './DreamComplete'
import { getTotalSteps, getStepOffset, getPathFromRecall, type MorningPath, type CaptureMethod } from './stepConfig'
import { createDreamEntry } from '@/app/(app)/today/actions'
import { useEncryptionKey } from '@/hooks/use-encryption-key'
import { encrypt, encodeBase64 } from '@/lib/encryption'
import type {
  MorningModeProps,
  MorningStep,
  MorningDraft,
  QuickFactsData,
  MicroStructureData,
} from './types'

const INITIAL_DRAFT: MorningDraft = {
  id: '',
  step: 'start',
  emotions: [],
  vividness: 50,
  lucidity: null,
  tags: [],
  startedAt: new Date(),
  lastUpdatedAt: new Date(),
}

export function MorningMode({
  initialStep = 'start',
  onComplete,
  onCancel,
}: MorningModeProps) {
  const [step, setStep] = useState<MorningStep>(initialStep)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [draft, setDraft] = useState<MorningDraft>({
    ...INITIAL_DRAFT,
    id: crypto.randomUUID(),
    step: initialStep,
    startedAt: new Date(),
    lastUpdatedAt: new Date(),
  })
  const [savedDreamId, setSavedDreamId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Get encryption key
  const { key: encryptionKey } = useEncryptionKey(1)
  
  // Calculate path from recall level (determined in QuickFacts)
  const path: MorningPath = useMemo(() => getPathFromRecall(draft.recallLevel), [draft.recallLevel])
  const captureMethod: CaptureMethod = draft.captureMethod === 'voice' ? 'voice' 
    : draft.captureMethod === 'text' ? 'text' 
    : null
  
  const totalSteps = useMemo(() => getTotalSteps(path, captureMethod), [path, captureMethod])
  const stepOffset = useMemo(() => getStepOffset(step, path, captureMethod), [step, path, captureMethod])

  // Update draft helper
  const updateDraft = useCallback((updates: Partial<MorningDraft>) => {
    setDraft(prev => ({
      ...prev,
      ...updates,
      lastUpdatedAt: new Date(),
    }))
  }, [])

  // Save draft to localStorage (in production, use IndexedDB)
  useEffect(() => {
    if (draft.narrative || draft.emotions.length > 0) {
      localStorage.setItem('morning-draft', JSON.stringify(draft))
    }
  }, [draft])

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('morning-draft')
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        // Only restore if it's from today
        const savedDate = new Date(parsed.startedAt).toDateString()
        const today = new Date().toDateString()
        if (savedDate === today && parsed.narrative) {
          setDraft({
            ...parsed,
            startedAt: new Date(parsed.startedAt),
            lastUpdatedAt: new Date(parsed.lastUpdatedAt),
          })
          // Resume from where they left off
          if (parsed.narrative) {
            setStep('structure')
          }
        }
      } catch {
        // Ignore invalid draft
      }
    }
  }, [])

  // Handle capture method selection from MorningStart
  const handleSelectVoice = () => {
    updateDraft({ captureMethod: 'voice' })
    setDirection('forward')
    setStep('quick-facts')
  }

  const handleSelectText = () => {
    updateDraft({ captureMethod: 'text' })
    setDirection('forward')
    setStep('quick-facts')
  }

  const handleSelectMinimal = () => {
    // User selected "just emotions" - set recall to nothing and skip to structure
    updateDraft({ captureMethod: undefined, recallLevel: 'nothing' })
    setDirection('forward')
    setStep('structure')
  }

  // Handle quick facts - recall level determines the path
  const handleQuickFactsComplete = (data: QuickFactsData) => {
    updateDraft({
      recallLevel: data.recallLevel,
      quickEmotions: data.emotions,
      isLucid: data.isLucid,
      isNightmare: data.isNightmare,
      isRecurring: data.isRecurring,
      emotions: data.emotions, // Pre-populate emotions
      lucidity: data.isLucid ? 'yes' : null,
    })

    // Go to capture based on capture method
    setDirection('forward')
    if (captureMethod === 'voice') {
      setStep('voice')
    } else if (captureMethod === 'text') {
      setStep('text')
    } else {
      setStep('structure')
    }
  }

  // Handle capture complete
  const handleCaptureComplete = (transcript: string) => {
    updateDraft({ narrative: transcript })
    setDirection('forward')
    setStep('structure')
  }

  // Handle micro-structure
  const handleStructureComplete = (data: MicroStructureData) => {
    updateDraft({
      emotions: data.emotions,
      vividness: data.vividness,
      lucidity: data.lucidity,
    })
    handleStructureToNext()
  }

  const handleSaveAndExit = async (data: MicroStructureData) => {
    updateDraft({
      emotions: data.emotions,
      vividness: data.vividness,
      lucidity: data.lucidity,
    })
    await saveDream()
  }

  // Handle tags (only shown for 'full' path)
  const handleTagsComplete = (tags: string[]) => {
    updateDraft({ tags })
    setDirection('forward')
    setStep('close')
  }

  // Handle structure complete - route based on path
  const handleStructureToNext = () => {
    setDirection('forward')
    // Only show tags for 'full' path
    if (path === 'full') {
      setStep('tags')
    } else {
      setStep('close')
    }
  }

  // Handle close ritual
  const handleCloseComplete = async (data: { title?: string; wakingLife?: string }) => {
    updateDraft({
      title: data.title,
      wakingLifeLink: data.wakingLife,
    })
    await saveDream()
  }

  // Save dream
  const saveDream = async () => {
    setIsSaving(true)
    
    try {
      // Encrypt narrative if present
      let ciphertext: string | undefined
      let iv: string | undefined
      
      if (draft.narrative && encryptionKey) {
        const encrypted = await encrypt(draft.narrative, encryptionKey)
        ciphertext = encodeBase64(encrypted.ciphertext)
        iv = encodeBase64(encrypted.iv)
      }

      // Call server action
      const result = await createDreamEntry({
        ciphertext,
        iv,
        keyVersion: 1,
        recallLevel: draft.recallLevel,
        emotions: draft.emotions,
        vividness: draft.vividness,
        lucidity: draft.lucidity,
        tags: draft.tags,
        title: draft.title,
        wakingLifeLink: draft.wakingLifeLink,
        isLucid: draft.isLucid,
        isNightmare: draft.isNightmare,
        isRecurring: draft.isRecurring,
        captureMethod: draft.captureMethod,
        capturedAt: draft.startedAt.toISOString(),
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Clear the draft
      localStorage.removeItem('morning-draft')
      
      setSavedDreamId(result.data.id)
      setStep('complete')
    } catch (error) {
      console.error('Failed to save dream:', error)
      // TODO: Show error toast to user
    } finally {
      setIsSaving(false)
    }
  }

  // Handle completion
  const handleContinue = () => {
    onComplete(savedDreamId!)
  }

  // Navigation helpers
  const goBack = () => {
    const stepOrder: MorningStep[] = [
      'start',
      'quick-facts',
      draft.captureMethod === 'voice' ? 'voice' : 'text',
      'structure',
      'tags',
      'close',
    ].filter((s): s is MorningStep => s !== undefined)

    const currentIndex = stepOrder.indexOf(step)
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1]
      if (prevStep) {
        setDirection('back')
        setStep(prevStep)
      }
    }
  }

  // Mock suggestions for tags (in production, these come from AI)
  const mockSuggestions = draft.narrative
    ? ['grandmother', 'house', 'hallway', 'childhood']
    : []

  const mockUserLexicon = ['the red door', 'recurring places', 'flying']

  // Mock insight (in production, this comes from analysis)
  const mockInsight = draft.narrative
    ? {
        text: 'You\'ve mentioned "water" 3 times this month.',
        type: 'frequency' as const,
      }
    : undefined

  return (
    <>
      <AnimatePresence mode="wait">
        {step === 'start' && (
          <MorningStart
            key="start"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            onVoice={handleSelectVoice}
            onText={handleSelectText}
            onEmotionOnly={handleSelectMinimal}
            onSkip={onCancel}
          />
        )}

        {step === 'quick-facts' && (
          <QuickFacts
            key="quick-facts"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            direction={direction}
            initialData={{
              recallLevel: draft.recallLevel,
              emotions: draft.quickEmotions,
              isLucid: draft.isLucid,
              isNightmare: draft.isNightmare,
              isRecurring: draft.isRecurring,
            }}
            onComplete={handleQuickFactsComplete}
            onSkip={handleSelectMinimal}
            onBack={() => {
              setDirection('back')
              setStep('start')
            }}
          />
        )}

        {step === 'voice' && (
          <VoiceCapture
            key="voice"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            onComplete={handleCaptureComplete}
            onCancel={() => {
              setDirection('back')
              setStep('quick-facts')
            }}
            onSkip={() => {
              // Skip capture, go to structure
              setDirection('forward')
              setStep('structure')
            }}
          />
        )}

        {step === 'text' && (
          <TextCapture
            key="text"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            initialValue={draft.narrative}
            onComplete={handleCaptureComplete}
            onCancel={() => {
              setDirection('back')
              setStep('quick-facts')
            }}
            onSkip={() => {
              // Skip capture, go to structure
              setDirection('forward')
              setStep('structure')
            }}
          />
        )}

        {step === 'structure' && (
          <MicroStructure
            key="structure"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            direction={direction}
            initialData={{
              emotions: draft.emotions,
              vividness: draft.vividness,
              lucidity: draft.lucidity,
            }}
            onComplete={handleStructureComplete}
            onSaveAndExit={handleSaveAndExit}
            onBack={goBack}
          />
        )}

        {step === 'tags' && path === 'full' && (
          <FastTags
            key="tags"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            direction={direction}
            suggestions={mockSuggestions}
            userLexicon={mockUserLexicon}
            selectedTags={draft.tags}
            onComplete={handleTagsComplete}
            onSkip={() => {
              setDirection('forward')
              setStep('close')
            }}
            onBack={() => {
              setDirection('back')
              setStep('structure')
            }}
          />
        )}

        {step === 'close' && (
          <CloseRitual
            key="close"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            direction={direction}
            suggestedTitle={draft.title}
            onComplete={handleCloseComplete}
            onSkip={() => saveDream()}
            onBack={() => {
              setDirection('back')
              // Only go to tags if path is 'full', otherwise go to structure
              setStep(path === 'full' ? 'tags' : 'structure')
            }}
          />
        )}

        {step === 'complete' && savedDreamId && (
          <DreamComplete
            key="complete"
            dream={{
              id: savedDreamId,
              title: draft.title,
              capturedAt: draft.startedAt,
              emotions: draft.emotions,
              vividness: draft.vividness,
            }}
            insight={mockInsight}
            onContinue={handleContinue}
            onViewInsights={() => {
              // Navigate to insights
              handleContinue()
            }}
          />
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">✨</div>
            <p className="text-muted">Saving your dream...</p>
          </div>
        </div>
      )}
    </>
  )
}

