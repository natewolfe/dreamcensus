'use client'

import { useState } from 'react'
import { Button, Card, Modal } from '@/components/ui'
import { TagPill } from './TagPill'
import type { DreamDetailProps } from './types'

export function DreamDetail({ dream, onEdit, onDelete }: DreamDetailProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getVividnessLabel = (vividness?: number) => {
    if (vividness === undefined) return 'Not specified'
    if (vividness < 25) return 'Faint'
    if (vividness < 50) return 'Hazy'
    if (vividness < 75) return 'Clear'
    return 'Crystal clear'
  }

  const getLucidityLabel = (lucidity?: 'no' | 'maybe' | 'yes' | null) => {
    if (!lucidity || lucidity === 'no') return 'Not lucid'
    if (lucidity === 'maybe') return 'Maybe lucid'
    return 'Lucid'
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete()
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Failed to delete dream:', error)
      // TODO: Show error toast
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {dream.title && (
            <h1 className="text-2xl font-medium text-foreground mb-2">
              "{dream.title}"
            </h1>
          )}
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>{formatDate(dream.capturedAt)}</span>
            <span>·</span>
            <span>{formatTime(dream.capturedAt)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Card padding="lg">
        <div className="space-y-6">
          {/* Narrative - would be decrypted on client */}
          {dream.ciphertext ? (
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed">
                [Encrypted content - decryption happens on client]
              </p>
            </div>
          ) : (
            <p className="text-muted italic">
              No narrative captured
            </p>
          )}

          {/* Waking life connection */}
          {dream.wakingLifeLink && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-muted mb-2">
                Waking Life Connection
              </h3>
              <p className="text-foreground text-sm">
                {dream.wakingLifeLink}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Metadata */}
      <Card padding="lg">
        <div className="space-y-4">
          {/* Emotions */}
          {dream.emotions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">
                Emotions
              </h3>
              <div className="flex flex-wrap gap-2">
                {dream.emotions.map((emotion) => (
                  <span
                    key={emotion}
                    className="rounded-full bg-accent/20 px-3 py-1 text-sm text-accent"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vividness & Lucidity */}
          <div className="grid grid-cols-2 gap-4">
            {dream.vividness !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-muted mb-1">
                  Vividness
                </h3>
                <p className="text-foreground">{getVividnessLabel(dream.vividness)}</p>
                <div className="mt-2 h-1.5 rounded-full bg-subtle overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${dream.vividness}%` }}
                  />
                </div>
              </div>
            )}

            {dream.lucidity && (
              <div>
                <h3 className="text-sm font-medium text-muted mb-1">
                  Lucidity
                </h3>
                <p className="text-foreground">{getLucidityLabel(dream.lucidity)}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {dream.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {dream.tags.map((tag) => (
                  <TagPill
                    key={tag}
                    label={tag}
                    source="user"
                    readonly
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Dream?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete this dream? This action cannot be undone.
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

