'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'

interface ProfileHeaderProps {
  displayName: string | null
  avatarEmoji: string
  avatarBgColor: string
  memberSince: Date
  onAvatarEdit: () => void
  onShare: () => void
  onNameChange: (name: string) => void
}

export function ProfileHeader({
  displayName,
  avatarEmoji,
  avatarBgColor,
  memberSince,
  onAvatarEdit,
  onShare,
  onNameChange,
}: ProfileHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(displayName ?? '')

  const handleNameSave = () => {
    if (editedName.trim() !== displayName) {
      onNameChange(editedName.trim())
    }
    setIsEditingName(false)
  }

  const handleNameCancel = () => {
    setEditedName(displayName ?? '')
    setIsEditingName(false)
  }

  const memberSinceText = new Date(memberSince).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Share button - top right */}
      <Button
        variant="ghost"
        size="md"
        onClick={onShare}
        className="absolute right-0 top-0 text-accent px-2 py-1 md:px-3 md:py-1 gap-1 rounded-md"
      >
        <svg
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share
      </Button>

      {/* Avatar with edit overlay - centered */}
      <button
        onClick={onAvatarEdit}
        className="group relative h-24 w-24 rounded-full transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: avatarBgColor }}
        aria-label="Edit avatar"
      >
        <div className="flex h-full w-full items-center justify-center text-5xl">
          {avatarEmoji}
        </div>
        {/* Edit overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
      </button>

      {/* Name and member since - centered below avatar */}
      <div className="flex flex-col items-center gap-1 text-center">
        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSave()
              if (e.key === 'Escape') handleNameCancel()
            }}
            onBlur={handleNameSave}
            className="max-w-[200px] py-1 text-center text-xl"
            autoFocus
            placeholder="Your name"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-2xl font-semibold text-foreground hover:text-accent transition-colors mb-1"
          >
            {displayName || 'Set your name'}
          </button>
        )}
        <p className="text-sm text-subtle">Member since {memberSinceText}</p>
      </div>

    </div>
  )
}
