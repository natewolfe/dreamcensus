'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'

interface InviteFlowProps {
  referralCode: string
  clicks: number
  friendsJoined: number
  dreamsShared: number
}

export function InviteFlow({ referralCode, clicks, friendsJoined, dreamsShared }: InviteFlowProps) {
  const [copied, setCopied] = useState(false)
  
  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join/${referralCode}`
    : `https://dreamcensus.app/join/${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Dream Census',
          text: 'Help map the collective unconscious. Take the Dream Census with me!',
          url: inviteUrl,
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Hero */}
      <Card variant="glass" className="border-2 border-[var(--accent)]/30">
        <div className="text-center">
          <div className="text-6xl mb-4">🌙✨</div>
          <h2 className="text-2xl font-medium mb-3">
            Help map the collective unconscious
          </h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            Every dream shared contributes to humanity's understanding of the dreaming mind.
            <br />
            <strong>{(friendsJoined + clicks + 12847).toLocaleString()} dreamers</strong> have joined so far.
          </p>
        </div>
      </Card>

      {/* Invite Link */}
      <Card>
        <div className="mb-4">
          <label className="text-sm font-medium text-[var(--foreground-muted)] block mb-2">
            Your unique invite link:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="flex-1 px-4 py-2 bg-[var(--background-subtle)] border border-[var(--border)] rounded-lg text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" fullWidth onClick={handleShare}>
            📱 Share Link
          </Button>
        </div>
      </Card>

      {/* Your Impact */}
      <Card>
        <h3 className="text-lg font-medium mb-4">Your Impact</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-[var(--background-subtle)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {clicks}
            </div>
            <div className="text-xs text-[var(--foreground-muted)]">
              Link clicks
            </div>
          </div>
          <div className="text-center p-4 bg-[var(--background-subtle)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {friendsJoined}
            </div>
            <div className="text-xs text-[var(--foreground-muted)]">
              Friends joined
            </div>
          </div>
          <div className="text-center p-4 bg-[var(--background-subtle)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {dreamsShared}
            </div>
            <div className="text-xs text-[var(--foreground-muted)]">
              Dreams shared
            </div>
          </div>
        </div>
      </Card>

      {/* Share message templates */}
      <Card>
        <h3 className="text-lg font-medium mb-3">Share Message</h3>
        <p className="text-sm text-[var(--foreground-muted)] mb-3">
          Copy one of these messages to share:
        </p>
        <div className="space-y-2">
          {[
            "I'm helping map the collective unconscious 🌙 Join me in taking the Dream Census!",
            "Curious about dreams? Take the Dream Census with me and help understand what we dream about.",
            "Help science understand dreams better! Join me in the Dream Census 💭",
          ].map((message, idx) => (
            <button
              key={idx}
              onClick={() => {
                navigator.clipboard.writeText(`${message} ${inviteUrl}`)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="w-full text-left p-3 bg-[var(--background-subtle)] hover:bg-[var(--background-elevated)] rounded-lg transition-colors text-sm"
            >
              {message}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

