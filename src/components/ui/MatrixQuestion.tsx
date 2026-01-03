'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface MatrixRow {
  id: string
  label: string
}

export interface MatrixColumn {
  value: number
  label: string
}

export interface MatrixQuestionProps {
  rows: MatrixRow[]
  columns: MatrixColumn[]
  values: Record<string, number | null> // rowId -> selected column value
  onChange: (rowId: string, value: number) => void
  disabled?: boolean
  className?: string
}

export function MatrixQuestion({
  rows,
  columns,
  values,
  onChange,
  disabled = false,
  className,
}: MatrixQuestionProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSelect = (rowId: string, columnValue: number) => {
    if (disabled) return
    onChange(rowId, columnValue)
    // Auto-collapse on mobile after selection
    if (isMobile) {
      setExpandedRow(null)
    }
  }

  const toggleRow = (rowId: string) => {
    setExpandedRow(expandedRow === rowId ? null : rowId)
  }

  const allRowsAnswered = rows.every((row) => values[row.id] !== null && values[row.id] !== undefined)

  // Mobile: Collapsible cards
  if (isMobile) {
    return (
      <div className={cn('space-y-3', className)}>
        {rows.map((row, rowIndex) => {
          const isExpanded = expandedRow === row.id
          const selectedValue = values[row.id]
          const isAnswered = selectedValue !== null && selectedValue !== undefined
          const selectedColumn = columns.find((col) => col.value === selectedValue)

          return (
            <div
              key={row.id}
              className={cn(
                'rounded-lg border-2 overflow-hidden transition-colors',
                isAnswered ? 'border-accent/50 bg-accent/5' : 'border-border bg-card-bg'
              )}
            >
              {/* Row header - clickable */}
              <button
                type="button"
                onClick={() => toggleRow(row.id)}
                disabled={disabled}
                className="w-full px-4 py-3 text-left flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Q{rowIndex + 1}</span>
                    <span className="font-medium">{row.label}</span>
                  </div>
                  {isAnswered && selectedColumn && (
                    <div className="text-sm text-accent mt-1">{selectedColumn.label}</div>
                  )}
                </div>
                <svg
                  className={cn(
                    'w-5 h-5 text-muted transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Options - expandable */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-3 space-y-2">
                    {columns.map((column) => {
                      const isSelected = selectedValue === column.value

                      return (
                        <motion.button
                          key={column.value}
                          type="button"
                          onClick={() => handleSelect(row.id, column.value)}
                          disabled={disabled}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'w-full px-4 py-3 rounded-lg text-left transition-all',
                            'border-2',
                            isSelected
                              ? 'bg-accent border-accent text-white'
                              : 'bg-background border-border hover:border-accent/50'
                          )}
                        >
                          {column.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          )
        })}

        {/* Progress indicator */}
        <div className="text-center text-sm text-muted pt-2">
          {rows.filter((row) => values[row.id] !== null && values[row.id] !== undefined).length} of {rows.length} answered
        </div>
      </div>
    )
  }

  // Desktop: Table grid
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse" role="table" aria-label="Matrix question table">
        <thead>
          <tr>
            <th className="text-left p-3 border-b-2 border-border font-medium" scope="col">
              {/* Empty corner cell */}
            </th>
            {columns.map((column) => (
              <th
                key={column.value}
                className="text-center p-3 border-b-2 border-border text-sm font-medium text-muted"
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const selectedValue = values[row.id]
            const isAnswered = selectedValue !== null && selectedValue !== undefined

            return (
              <tr
                key={row.id}
                className={cn(
                  'transition-colors',
                  isAnswered ? 'bg-accent/5' : 'hover:bg-subtle/10'
                )}
              >
                <th
                  scope="row"
                  className="text-left p-3 border-b border-border font-normal"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Q{rowIndex + 1}</span>
                    <span>{row.label}</span>
                  </div>
                </th>
                {columns.map((column) => {
                  const isSelected = selectedValue === column.value

                  return (
                    <td key={column.value} className="text-center p-3 border-b border-border">
                      <motion.button
                        type="button"
                        onClick={() => handleSelect(row.id, column.value)}
                        disabled={disabled}
                        whileHover={!disabled ? { scale: 1.1 } : undefined}
                        whileTap={!disabled ? { scale: 0.9 } : undefined}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all',
                          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
                          isSelected
                            ? 'bg-accent border-accent shadow-md'
                            : 'bg-card-bg border-border hover:border-accent/50',
                          disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        aria-label={`${row.label}: ${column.label}`}
                        aria-pressed={isSelected}
                        role="radio"
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-full h-full rounded-full bg-white"
                            style={{ transform: 'scale(0.4)' }}
                          />
                        )}
                      </motion.button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Progress indicator */}
      {allRowsAnswered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-accent font-medium mt-4"
        >
          ✓ All questions answered
        </motion.div>
      )}
    </div>
  )
}

