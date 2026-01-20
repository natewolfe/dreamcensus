'use client'

import { useState } from 'react'
import { FlowCard } from '@/components/ui'
import { DatePicker } from '@/components/ui/DatePicker'
import { cn } from '@/lib/utils'
import type { DateSelectProps, DateSelectType } from './types'

const QUICK_OPTIONS: { value: DateSelectType; label: string; icon: string }[] = [
  { value: 'last-night', label: 'Last Night', icon: '🌙' },
  { value: 'childhood', label: 'Childhood', icon: '👶' },
  { value: 'not-sure', label: 'Not sure', icon: '🤷' },
]

export function DateSelect({
  globalStep,
  totalSteps,
  initialData,
  onComplete,
}: DateSelectProps) {
  const [specificDate, setSpecificDate] = useState<string>(initialData?.date ?? '')
  const [selectedQuickOption, setSelectedQuickOption] = useState<DateSelectType | null>(
    initialData?.type && initialData.type !== 'specific' ? initialData.type : null
  )

  // When a specific date is selected, clear quick option
  const handleDateChange = (date: string) => {
    setSpecificDate(date)
    setSelectedQuickOption(null)
  }

  // When a quick option is selected, clear the date
  const handleQuickOptionSelect = (option: DateSelectType) => {
    setSelectedQuickOption(option)
    setSpecificDate('')
  }

  const handleContinue = () => {
    if (specificDate) {
      onComplete({ type: 'specific', date: new Date(specificDate) })
    } else if (selectedQuickOption === 'last-night') {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      onComplete({ type: 'last-night', date: yesterday })
    } else if (selectedQuickOption === 'childhood') {
      onComplete({ type: 'childhood', approximateValue: 'childhood' })
    } else if (selectedQuickOption === 'not-sure') {
      onComplete({ type: 'not-sure', approximateValue: 'unknown' })
    }
  }

  // Skip = complete with "Not sure"
  const handleSkip = () => {
    onComplete({ type: 'not-sure', approximateValue: 'unknown' })
  }

  const isValid = !!specificDate || !!selectedQuickOption
  const today = new Date().toISOString().split('T')[0]

  return (
    <FlowCard
      currentStep={globalStep}
      totalSteps={totalSteps}
      direction="forward"
      title="When did you have this dream?"
      subtitle="Select a date or choose an option below"
      isValid={isValid}
      skipBehavior="optional"
      onNext={handleContinue}
      onBack={() => {}}
      onSkip={handleSkip}
      canGoBack={false}
      stepKey="date-select"
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Date Picker */}
        <div className="space-y-2">
          <DatePicker
            value={specificDate}
            onChange={handleDateChange}
            maxDate={today}
            className={cn(
              'transition-all',
              specificDate && 'ring-2 ring-muted rounded-lg'
            )}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Quick Options */}
        <div className="flex gap-2">
          {QUICK_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleQuickOptionSelect(option.value)}
              className={cn(
                'flex-1 rounded-xl p-3 flex flex-col items-center gap-2 transition-all',
                selectedQuickOption === option.value
                  ? 'bg-muted/20 border-2 border-muted'
                  : 'bg-card-bg border border-border hover:border-accent/50'
              )}
            >
              <span className="text-xl">{option.icon}</span>
              <span className={cn(
                'text-sm font-medium',
                selectedQuickOption === option.value ? 'text-foreground' : 'text-muted'
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </FlowCard>
  )
}
