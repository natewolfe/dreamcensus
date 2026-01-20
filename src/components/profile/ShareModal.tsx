'use client'

import { useState, useEffect } from 'react'
import { Modal, Button, Card } from '@/components/ui'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  totalDreams: number
  journalStreak: number
  memberSince: Date
}

export function ShareModal({
  isOpen,
  onClose,
  totalDreams,
  journalStreak,
  memberSince,
}: ShareModalProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [hasNativeShare, setHasNativeShare] = useState(false)

  // Check for native share API on client only
  useEffect(() => {
    setHasNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const memberSinceText = new Date(memberSince).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const shareText = `I've recorded ${totalDreams} dreams on Dream Census! Current streak: ${journalStreak} days 🌙✨`

  const handleShare = async () => {
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        })
        onClose()
        return
      } catch (error) {
        // User cancelled or share failed, fall through to clipboard
        console.log('Share cancelled or failed:', error)
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      setCopySuccess(true)
      setTimeout(() => {
        setCopySuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Your Progress"
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleShare}>
            {copySuccess ? 'Copied!' : hasNativeShare ? 'Share' : 'Copy'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Share your dream journaling progress with others
        </p>

        {/* Preview card */}
        <Card padding="md" variant="outlined">
          <div className="space-y-2 text-center">
            <div className="text-3xl mb-2">🌙</div>
            <div className="text-xl font-medium text-foreground">
              {totalDreams} Dreams Recorded
            </div>
            <div className="text-sm text-muted">
              {journalStreak} day streak
            </div>
            <div className="text-xs text-muted/70 mt-2">
              Member since {memberSinceText}
            </div>
          </div>
        </Card>

        <p className="text-xs text-muted/70 text-center">
          No sensitive data will be shared
        </p>
      </div>
    </Modal>
  )
}
