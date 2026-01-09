'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DreamDetail, DreamEditor, type Dream } from '@/components/journal'
import { deleteDream, updateDreamMetadata } from '../actions'

interface DreamDetailClientProps {
  dream: Dream & {
    ciphertext?: string
    iv?: string
    keyVersion: number
    wakingLifeLink?: string
  }
}

export function DreamDetailClient({ dream }: DreamDetailClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = async (updates: Partial<Dream>) => {
    const result = await updateDreamMetadata(dream.id, {
      title: updates.title,
      tags: updates.tags,
      wakingLifeLink: updates.wakingLifeLink,
    })

    if (result.success) {
      setIsEditing(false)
      router.refresh()
    } else {
      throw new Error(result.error)
    }
  }

  const handleDelete = async () => {
    const result = await deleteDream(dream.id)
    
    if (result.success) {
      router.push('/journal')
      router.refresh()
    } else {
      throw new Error(result.error)
    }
  }

  if (isEditing) {
    return (
      <DreamEditor
        dream={dream}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
    )
  }

  return (
    <DreamDetail
      dream={dream}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}

