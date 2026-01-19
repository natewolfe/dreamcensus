'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'motion/react'
import { DateSelect } from './DateSelect'
import { MorningStart } from './MorningStart'
import { QuickFacts } from './QuickFacts'
import { VoiceCapture } from './VoiceCapture'
import { TextCapture } from './TextCapture'
import { MicroStructure } from './MicroStructure'
import { FastTags } from './FastTags'
import { CloseRitual } from './CloseRitual'
import { DreamComplete } from './DreamComplete'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { getTotalSteps, getStepOffset, getPathFromRecall, type MorningPath, type CaptureMethod } from './stepConfig'
import { createDreamEntry, getTagSuggestions } from '@/app/(app)/today/actions'
import { useEncryptionKey } from '@/hooks/use-encryption-key'
import { useToast } from '@/hooks/use-toast'
import { encrypt, encodeBase64 } from '@/lib/encryption'
import { saveDraft, getTodaysDraft, deleteDraft } from '@/lib/offline/drafts'
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
  mode = 'morning',
  onComplete,
  onCancel,
  onCaptureAnother,
  onHasDataChange,
  onCompletionVisible,
  userId,
  lastNightIntention,
  alarmContext,
}: MorningModeProps) {
  // Determine actual initial step based on mode
  const actualInitialStep: MorningStep = mode === 'journal' ? 'date-select' : initialStep
  const [step, setStep] = useState<MorningStep>(actualInitialStep)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [draft, setDraft] = useState<MorningDraft>({
    ...INITIAL_DRAFT,
    id: crypto.randomUUID(),
    step: actualInitialStep,
    startedAt: new Date(),
    lastUpdatedAt: new Date(),
  })
  const [savedDreamId, setSavedDreamId] = useState<string | null>(null)
  const [savedDreamNumber, setSavedDreamNumber] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [tagSuggestions, setTagSuggestions] = useState<{ suggestions: string[]; lexicon: string[] }>({
    suggestions: [],
    lexicon: [],
  })
  
  // Get encryption key and toast
  const { key: encryptionKey } = useEncryptionKey(1)
  const { toast } = useToast()
  
  // Calculate path from recall level (determined in QuickFacts)
  const path: MorningPath = useMemo(() => getPathFromRecall(draft.recallLevel), [draft.recallLevel])
  const captureMethod: CaptureMethod = draft.captureMethod === 'voice' ? 'voice' 
    : draft.captureMethod === 'text' ? 'text' 
    : null
  
  const totalSteps = useMemo(() => getTotalSteps(path, captureMethod), [path, captureMethod])
  const stepOffset = useMemo(() => getStepOffset(step, path, captureMethod), [step, path, captureMethod])

  // Check if draft has meaningful data
  const hasData = useMemo(() => {
    return !!(
      draft.narrative ||
      draft.emotions.length > 0 ||
      draft.recallLevel ||
      draft.vividness !== 50 ||  // Changed from default
      draft.lucidity !== null ||
      draft.dreamDate ||
      draft.tags.length > 0 ||
      draft.title ||
      draft.wakingLifeLink
    )
  }, [draft])

  // Notify parent when hasData changes
  useEffect(() => {
    onHasDataChange?.(hasData)
  }, [hasData, onHasDataChange])

  // Notify parent when completion screen is visible
  useEffect(() => {
    onCompletionVisible?.(step === 'complete')
  }, [step, onCompletionVisible])

  // Update draft helper with debounced save
  const updateDraft = useCallback((updates: Partial<MorningDraft>) => {
    setDraft(prev => {
      const updated = {
        ...prev,
        ...updates,
        lastUpdatedAt: new Date(),
      }
      
      // Save to IndexedDB (debounced) - only if userId available
      if ((updated.narrative || updated.emotions.length > 0) && userId) {
        saveDraft({
          ...updated,
          userId,
          startedAt: updated.startedAt.toISOString(),
          lastUpdatedAt: updated.lastUpdatedAt.toISOString(),
        }).catch(err => {
          console.error('Failed to save draft:', err)
        })
      }
      
      return updated
    })
  }, [])

  // Load draft on mount
  useEffect(() => {
    let mounted = true
    
    // Try to load from IndexedDB first
    const loadDraft = async () => {
      try {
        // Only attempt to load draft if userId is provided
        if (!userId) return
        
        const todayDraft = await getTodaysDraft(userId)
        if (mounted && todayDraft && todayDraft.narrative) {
          setDraft({
            ...todayDraft,
            startedAt: new Date(todayDraft.startedAt),
            lastUpdatedAt: new Date(todayDraft.lastUpdatedAt),
          })
          // Resume from where they left off
          if (todayDraft.narrative) {
            setStep('structure')
          }
        } else {
                  // Fallback: Try localStorage migration (only if userId available)
          if (userId) {
            const savedDraft = localStorage.getItem('morning-draft')
            if (savedDraft) {
              try {
                const parsed = JSON.parse(savedDraft)
                const savedDate = new Date(parsed.startedAt).toDateString()
                const today = new Date().toDateString()
                if (savedDate === today && parsed.narrative) {
                  const migratedDraft = {
                    ...parsed,
                    startedAt: new Date(parsed.startedAt),
                    lastUpdatedAt: new Date(parsed.lastUpdatedAt),
                  }
                  if (mounted) {
                    setDraft(migratedDraft)
                    // Save to IndexedDB
                    await saveDraft({
                      ...migratedDraft,
                      userId,
                      startedAt: migratedDraft.startedAt.toISOString(),
                      lastUpdatedAt: migratedDraft.lastUpdatedAt.toISOString(),
                    })
                    // Clear localStorage
                    localStorage.removeItem('morning-draft')
                    if (parsed.narrative) {
                      setStep('structure')
                    }
                  }
                }
              } catch (err) {
                console.error('Failed to migrate draft:', err)
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load draft:', err)
      }
    }
    
    loadDraft()
    
    return () => {
      mounted = false
    }
  }, [userId])

  // Handle date selection (journal mode)
  const handleDateSelectComplete = (data: {
    type: string
    date?: Date
    approximateValue?: string
  }) => {
    const selectedDate = data.date ?? new Date()
    updateDraft({
      dreamDate: data.date,
      approximateDate: data.type !== 'last-night' && data.type !== 'specific'
        ? { type: data.type as any, value: data.approximateValue }
        : undefined,
      startedAt: selectedDate,
    })
    setDirection('forward')
    setStep('start')
  }

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
  const handleCaptureComplete = async (transcript: string) => {
    updateDraft({ narrative: transcript })
    
    // Fetch tag suggestions based on narrative
    if (transcript.trim()) {
      const result = await getTagSuggestions(transcript)
      if (result.success) {
        setTagSuggestions(result.data)
      }
    }
    
    setDirection('forward')
    setStep('structure')
  }

  // Handle micro-structure
  const handleStructureComplete = (data: MicroStructureData) => {
    updateDraft({
      vividness: data.vividness,
      lucidity: data.lucidity,
    })
    handleStructureToNext()
  }

  const handleSaveAndExit = async (data: MicroStructureData) => {
    updateDraft({
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
        // Alarm metadata if triggered by alarm
        alarmTriggered: !!alarmContext,
        alarmScheduledTime: alarmContext?.scheduledTime,
        alarmStopTime: alarmContext?.actualStopTime,
        alarmSnoozeCount: alarmContext?.snoozeCount,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Clear the draft from IndexedDB
      await deleteDraft(draft.id).catch(err => {
        console.error('Failed to delete draft:', err)
      })
      
      // Also clear localStorage for any legacy drafts
      localStorage.removeItem('morning-draft')
      
      setSavedDreamId(result.data.id)
      setSavedDreamNumber(result.data.dreamNumber)
      setStep('complete')
      toast.success('Dream saved successfully!')
    } catch (error) {
      console.error('Failed to save dream:', error)
      toast.error('Failed to save dream. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle completion
  const handleContinue = () => {
    onComplete(savedDreamId!)
  }

  // Handle capture another dream
  const handleCaptureAnother = () => {
    // Reset draft state
    setDraft({
      ...INITIAL_DRAFT,
      id: crypto.randomUUID(),
      startedAt: new Date(),
      lastUpdatedAt: new Date(),
    })
    setSavedDreamId(null)
    setSavedDreamNumber(null)
    setDirection('forward')
    // Go back to start (or date-select in journal mode)
    setStep(mode === 'journal' ? 'date-select' : 'start')
    
    // Notify parent if provided
    onCaptureAnother?.()
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
        {step === 'date-select' && mode === 'journal' && (
          <DateSelect
            key="date-select"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            onComplete={handleDateSelectComplete}
          />
        )}

        {step === 'start' && (
          <MorningStart
            key="start"
            globalStep={stepOffset}
            totalSteps={totalSteps}
            onVoice={handleSelectVoice}
            onText={handleSelectText}
            onEmotionOnly={handleSelectMinimal}
            onSkip={onCancel}
            lastNightIntention={lastNightIntention}
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
            suggestions={tagSuggestions.suggestions}
            userLexicon={tagSuggestions.lexicon}
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
              dreamNumber: savedDreamNumber ?? undefined,
            }}
            insight={mockInsight}
            onContinue={handleContinue}
            onViewInsights={() => {
              // Navigate to insights
              handleContinue()
            }}
            onCaptureAnother={handleCaptureAnother}
          />
        )}
      </AnimatePresence>

      <LoadingOverlay isVisible={isSaving} message="Saving your dream..." />
    </>
  )
}

