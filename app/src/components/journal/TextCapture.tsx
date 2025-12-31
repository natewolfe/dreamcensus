'use client'

import { useState, useEffect } from 'react'

interface TextCaptureProps {
  initialValue: string
  onComplete: (text: string) => void
  onBack: () => void
}

export function TextCapture({ initialValue, onComplete, onBack }: TextCaptureProps) {
  const [text, setText] = useState(initialValue)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }, [text])

  const handleContinue = () => {
    if (text.trim().length === 0) {
      alert('Please write something about your dream')
      return
    }
    onComplete(text)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-medium mb-2">What did you dream?</h2>
        <p className="text-sm text-[var(--foreground-subtle)]">
          Write as much or as little as you remember
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I dreamed that..."
        className="w-full min-h-[300px] p-6 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl text-lg focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none"
        autoFocus
        style={{ fontFamily: 'var(--font-family-body)' }}
      />

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-[var(--foreground-subtle)]">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </div>
        <button
          onClick={handleContinue}
          className="btn btn-primary"
          disabled={text.trim().length === 0}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

