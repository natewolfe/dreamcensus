'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FlowCard } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TextCaptureProps } from './types'

export function TextCapture({ 
  globalStep, 
  totalSteps, 
  initialValue = '', 
  onComplete, 
  onCancel,
  onSkip,
}: TextCaptureProps) {
  const [text, setText] = useState(initialValue)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Auto-save with debounce
  const debouncedSave = useCallback((value: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    setSaveStatus('saving')
    
    saveTimeoutRef.current = setTimeout(() => {
      // In real implementation, this would save to IndexedDB
      localStorage.setItem('morning-draft-text', value)
      setSaveStatus('saved')
      
      // Reset to idle after a moment
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }, [])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setText(value)
    if (value.trim()) {
      debouncedSave(value)
    }
  }

  const handleDone = () => {
    if (text.trim()) {
      onComplete(text.trim())
    } else if (onSkip) {
      onSkip()
    }
  }

  const handleSkip = () => {
    onSkip?.() ?? onComplete('')
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const canSubmit = text.trim().length > 0

  // Dynamic subtitle with save status
  const getSubtitle = () => {
    if (saveStatus === 'saving') return 'Saving...'
    if (saveStatus === 'saved') return 'Auto-saved ✓'
    if (canSubmit) return `${text.trim().split(/\s+/).length} words`
    return 'Fragments are perfect'
  }

  return (
    <FlowCard
      currentStep={globalStep}
      totalSteps={totalSteps}
      direction="forward"
      title="Write your dream"
      subtitle={getSubtitle()}
      stepKey="text-capture"
      isValid={canSubmit}
      skipBehavior="optional"
      isLastStep={false}
      onNext={handleDone}
      onBack={onCancel}
      onSkip={handleSkip}
      canGoBack={true}
      canGoForward={true}
    >
      <div className="w-full">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Write whatever you remember..."
          rows={8}
          className={cn(
            'w-full resize-none',
            'bg-subtle/30 border border-border rounded-xl p-4',
            'text-foreground placeholder:text-subtle',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
            'transition-colors duration-200'
          )}
          aria-label="Dream narrative"
        />
      </div>
    </FlowCard>
  )
}
