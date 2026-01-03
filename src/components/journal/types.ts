// Journal Component Types

export interface Dream {
  id: string
  userId: string
  title?: string
  ciphertext?: string
  iv?: string
  keyVersion: number
  emotions: string[]
  vividness?: number
  lucidity?: 'no' | 'maybe' | 'yes' | null
  tags: string[]
  wakingLifeLink?: string
  capturedAt: Date
  updatedAt: Date
}

export interface DreamCardProps {
  dream: Dream
  variant?: 'compact' | 'expanded'
  onClick?: () => void
}

export interface JournalListProps {
  dreams: Dream[]
  onSearch?: (query: string) => void
}

export interface DreamDetailProps {
  dream: Dream
  onEdit?: () => void
  onDelete?: () => void
}

export interface DreamEditorProps {
  dream: Dream
  onSave: (updates: Partial<Dream>) => Promise<void>
  onCancel: () => void
}

export interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  max?: number
}

export interface TagPillProps {
  label: string
  source: 'user' | 'ai_suggested' | 'ai_auto'
  confidence?: number
  onAccept?: () => void
  onDismiss?: () => void
  onEdit?: () => void
  readonly?: boolean
}

export interface DecryptedContentProps {
  ciphertext: string
  iv: string
  keyVersion: number
  fallback?: React.ReactNode
}

