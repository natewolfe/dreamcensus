'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { TagInput } from './TagInput'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { DreamEditorProps } from './types'

export function DreamEditor({ dream, onSave, onCancel }: DreamEditorProps) {
  const [title, setTitle] = useState(dream.title ?? '')
  const [wakingLifeLink, setWakingLifeLink] = useState(dream.wakingLifeLink ?? '')
  const [tags, setTags] = useState(dream.tags)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        title: title.trim() || undefined,
        wakingLifeLink: wakingLifeLink.trim() || undefined,
        tags,
      })
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    title !== (dream.title ?? '') ||
    wakingLifeLink !== (dream.wakingLifeLink ?? '') ||
    JSON.stringify(tags) !== JSON.stringify(dream.tags)

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Title
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="The Endless Hallway..."
          maxLength={200}
        />
      </div>

      {/* Waking Life Link */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Waking Life Connection
        </label>
        <textarea
          value={wakingLifeLink}
          onChange={(e) => setWakingLifeLink(e.target.value)}
          placeholder="Anything from your day that might connect?"
          rows={3}
          maxLength={2000}
          className={cn(
            'w-full rounded-xl px-4 py-3 resize-none',
            'bg-card-bg border border-border text-foreground',
            'placeholder:text-subtle',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
            'transition-colors'
          )}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Tags
        </label>
        <TagInput
          value={tags}
          onChange={setTags}
          suggestions={['recurring', 'nightmare', 'flying', 'water', 'childhood']}
          max={20}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!hasChanges}
          loading={isSaving}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}

