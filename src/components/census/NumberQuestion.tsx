'use client'

import { Input, SearchableDropdown } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { NumberQuestionProps } from './types'

const CHOICE_THRESHOLD = 5    // Button choices for ranges up to 5
const DROPDOWN_THRESHOLD = 20 // Dropdown for ranges up to 20

export function NumberQuestion({
  question,
  value,
  onChange,
}: NumberQuestionProps) {
  const minValue = question.config?.minValue
  const maxValue = question.config?.maxValue
  const unit = question.config?.unit

  // Calculate range size to determine best input type
  const hasRange = minValue !== undefined && maxValue !== undefined
  const rangeSize = hasRange ? maxValue - minValue + 1 : Infinity

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue === '') {
      onChange(0)
    } else {
      const parsed = parseFloat(newValue)
      if (!isNaN(parsed)) {
        onChange(parsed)
      }
    }
  }

  // Generate dropdown options for medium ranges
  const dropdownOptions = hasRange && rangeSize <= DROPDOWN_THRESHOLD
    ? Array.from({ length: rangeSize }, (_, i) => {
        const num = minValue + i
        return { value: String(num), label: unit ? `${num} ${unit}` : String(num) }
      })
    : []

  return (
    <div className="space-y-6">
      {/* Question text - centered */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">
          {question.text}
        </h3>
        {question.description && (
          <p className="text-sm text-muted mt-2">
            {question.description}
          </p>
        )}
      </div>

      {/* Input type based on range size */}
      {hasRange && rangeSize <= CHOICE_THRESHOLD ? (
        // Small range: horizontal button choices
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-2 sm:flex-nowrap">
            {Array.from({ length: rangeSize }, (_, i) => {
              const num = minValue + i
              const isSelected = value === num
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange(num)}
                  className={cn(
                    'w-14 h-14 rounded-lg flex items-center justify-center',
                    'text-lg font-medium transition-all border-2',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
                    isSelected
                      ? 'bg-accent border-accent text-white shadow-lg shadow-accent/30'
                      : 'border-border bg-card-bg text-muted hover:text-foreground hover:border-accent/50'
                  )}
                >
                  {num}
                </button>
              )
            })}
          </div>
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </div>
      ) : hasRange && rangeSize <= DROPDOWN_THRESHOLD ? (
        // Medium range: dropdown
        <div className="max-w-xs mx-auto">
          <SearchableDropdown
            options={dropdownOptions}
            value={value !== null ? String(value) : null}
            onChange={(val) => onChange(Number(val))}
            placeholder={`Select ${unit ?? 'a value'}...`}
          />
        </div>
      ) : (
        // Large/unbounded range: number input
        <>
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={value ?? ''}
                onChange={handleInputChange}
                min={minValue}
                max={maxValue}
                placeholder={question.config?.placeholder}
                className="text-center text-lg w-24"
              />
              {unit && (
                <span className="text-muted text-base">{unit}</span>
              )}
            </div>
          </div>

          {/* Range hint - only for free input */}
          {(minValue !== undefined || maxValue !== undefined) && (
            <p className="text-xs text-muted text-center">
              {minValue !== undefined && maxValue !== undefined
                ? `Valid range: ${minValue} - ${maxValue}`
                : minValue !== undefined
                ? `Minimum: ${minValue}`
                : `Maximum: ${maxValue}`}
            </p>
          )}
        </>
      )}
    </div>
  )
}

