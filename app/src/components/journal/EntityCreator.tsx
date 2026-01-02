'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui'

export interface EntityCreatorProps {
  selectedText: string
  onClose: () => void
  onCreate: (entity: {
    name: string
    type: 'person' | 'place' | 'thing'
    label?: string
  }) => void
  position?: { x: number; y: number }
}

export function EntityCreator({
  selectedText,
  onClose,
  onCreate,
  position,
}: EntityCreatorProps) {
  const [type, setType] = useState<'person' | 'place' | 'thing'>('person')
  const [label, setLabel] = useState('')

  const handleCreate = () => {
    onCreate({
      name: selectedText,
      type,
      label: label || undefined,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          className="bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl shadow-2xl p-6 max-w-md w-full"
          style={position ? {
            position: 'absolute',
            top: position.y,
            left: position.x,
            transform: 'translate(-50%, -50%)',
          } : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-medium mb-4">Create Entity</h3>

          {/* Selected text preview */}
          <div className="mb-4 p-3 bg-[var(--background-subtle)] rounded-lg">
            <div className="text-sm text-[var(--foreground-muted)] mb-1">Selected text:</div>
            <div className="font-medium">"{selectedText}"</div>
          </div>

          {/* Type selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-[var(--foreground-muted)] mb-2 block">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['person', 'place', 'thing'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                    type === t
                      ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--foreground)]'
                      : 'border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--foreground-subtle)]'
                  }`}
                >
                  {t === 'person' && '👤'} {t === 'place' && '📍'} {t === 'thing' && '🔷'}
                  <span className="ml-1">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional label */}
          <div className="mb-6">
            <label className="text-sm font-medium text-[var(--foreground-muted)] mb-2 block">
              Label (optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={
                type === 'person' ? 'e.g., Friend, Family, Coworker'
                : type === 'place' ? 'e.g., Home, Work, Vacation spot'
                : 'e.g., Object, Symbol'
              }
              className="w-full px-3 py-2 bg-[var(--background-subtle)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] outline-none transition-colors"
            />
            <div className="text-xs text-[var(--foreground-subtle)] mt-1">
              Add a category to help organize your entities
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} fullWidth>
              Create
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

