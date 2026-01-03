'use client'

import { useState } from 'react'
import { Card, Modal } from '@/components/ui'
import { TierToggle } from './TierToggle'
import { cn } from '@/lib/utils'
import type { ConsentSettingsProps, ConsentTier } from './types'

const TIER_MODALS: Record<ConsentTier, {
  title: string
  content: string[]
  safeguards: string[]
}> = {
  insights: {
    title: "What 'Personal Insights' uses",
    content: [
      'Your dream text (analyzed on our servers)',
      'Emotions, themes, symbols extracted',
      'Patterns identified over time',
    ],
    safeguards: [
      'Never shared with anyone',
      'Never used for advertising',
      'Deletable at any time',
    ],
  },
  commons: {
    title: "What 'Dream Weather' shares",
    content: [
      'Emotion distributions (not raw text)',
      'Theme frequencies (aggregated with others)',
      'Sleep quality patterns',
    ],
    safeguards: [
      'Minimum 50 dreamers per aggregate',
      'Differential privacy noise added',
      'No individual identification possible',
    ],
  },
  studies: {
    title: "What 'Research Studies' shares",
    content: [
      'Only data relevant to specific study',
      'You approve each study individually',
      'Can withdraw from any study',
    ],
    safeguards: [
      'IRB-approved studies only',
      'Explicit consent per study',
      'Results shared back to participants',
    ],
  },
}

export function ConsentSettings({
  currentState,
  onUpdate,
}: ConsentSettingsProps) {
  const [showModal, setShowModal] = useState<ConsentTier | null>(null)

  const handleToggle = async (tier: ConsentTier, granted: boolean) => {
    try {
      await onUpdate(tier, granted)
    } catch (error) {
      console.error('Failed to update consent:', error)
      // TODO: Show error toast
    }
  }

  const isCommonsLocked = !currentState.insights
  const isStudiesLocked = !currentState.commons

  return (
    <div className="space-y-6">
      {/* Privacy Ladder Visualization */}
      <Card padding="md" variant="ghost">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              'bg-accent'
            )} />
            <span className="text-muted">Private</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              currentState.insights ? 'bg-accent' : 'bg-subtle'
            )} />
            <span className="text-muted">Insights</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              currentState.commons ? 'bg-accent' : 'bg-subtle'
            )} />
            <span className="text-muted">Commons</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              currentState.studies ? 'bg-accent' : 'bg-subtle'
            )} />
            <span className="text-muted">Studies</span>
          </div>
        </div>
      </Card>

      {/* Base tier (always on) */}
      <Card padding="md" variant="elevated">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-foreground mb-1">
              Private Journal
            </h3>
            <p className="text-sm text-muted">
              Your dreams, encrypted and yours alone
            </p>
          </div>
          <div className="text-accent text-sm font-medium">
            Always on ✓
          </div>
        </div>
      </Card>

      {/* Tier toggles */}
      <div className="space-y-3">
        <TierToggle
          tier="insights"
          enabled={currentState.insights}
          onToggle={(granted) => handleToggle('insights', granted)}
          onLearnMore={() => setShowModal('insights')}
        />

        <TierToggle
          tier="commons"
          enabled={currentState.commons}
          locked={isCommonsLocked}
          onToggle={(granted) => handleToggle('commons', granted)}
          onLearnMore={() => setShowModal('commons')}
        />

        <TierToggle
          tier="studies"
          enabled={currentState.studies}
          locked={isStudiesLocked}
          onToggle={(granted) => handleToggle('studies', granted)}
          onLearnMore={() => setShowModal('studies')}
        />
      </div>

      {/* Dependency note */}
      {(isCommonsLocked || isStudiesLocked) && (
        <p className="text-xs text-muted text-center">
          Some tiers require enabling previous tiers
        </p>
      )}

      {/* Modals */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(null)}
          title={TIER_MODALS[showModal].title}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">
                What's included:
              </h4>
              <ul className="space-y-1">
                {TIER_MODALS[showModal].content.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-accent">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted mb-2">
                Privacy safeguards:
              </h4>
              <ul className="space-y-1">
                {TIER_MODALS[showModal].safeguards.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

