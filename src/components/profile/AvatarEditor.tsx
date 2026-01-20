'use client'

import { useState } from 'react'
import { Modal, Button } from '@/components/ui'
import { AVATAR_COLORS, DREAM_EMOJIS } from '@/lib/profile'

interface AvatarEditorProps {
  isOpen: boolean
  onClose: () => void
  currentEmoji: string
  currentColor: string
  onSave: (emoji: string, color: string) => void
}

export function AvatarEditor({
  isOpen,
  onClose,
  currentEmoji,
  currentColor,
  onSave,
}: AvatarEditorProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji)
  const [selectedColor, setSelectedColor] = useState(currentColor)

  const handleSave = () => {
    onSave(selectedEmoji, selectedColor)
    onClose()
  }

  const handleCancel = () => {
    setSelectedEmoji(currentEmoji)
    setSelectedColor(currentColor)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Avatar"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Live preview */}
        <div className="flex justify-center">
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center text-4xl transition-all duration-200"
            style={{ backgroundColor: selectedColor }}
          >
            {selectedEmoji}
          </div>
        </div>

        {/* Emoji grid */}
        <div>
          <div className="text-sm font-medium text-foreground mb-2">Choose Emoji</div>
          <div className="grid grid-cols-8 gap-2 p-2">
            {DREAM_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`h-10 w-10 rounded-lg flex items-center justify-center text-2xl transition-all duration-150 hover:scale-110 ${
                  selectedEmoji === emoji
                    ? 'bg-accent shadow-md ring-2 ring-accent'
                    : 'bg-subtle/30 hover:bg-subtle'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color row */}
        <div>
          <div className="text-sm font-medium text-foreground mb-2">Choose Color</div>
          <div className="flex gap-2 overflow-x-auto p-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.value)}
                className={`h-10 w-10 rounded-full flex-shrink-0 transition-all duration-150 hover:scale-110 ${
                  selectedColor === color.value
                    ? 'ring-4 ring-accent shadow-lg'
                    : 'ring-2 ring-border/30'
                }`}
                style={{ backgroundColor: color.value }}
                aria-label={color.label}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
