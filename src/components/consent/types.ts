// Consent Component Types

export type ConsentTier = 'insights' | 'commons' | 'studies'

export interface ConsentState {
  insights: boolean
  commons: boolean
  studies: boolean
}

export interface ConsentReceipt {
  id: string
  scope: ConsentTier
  granted: boolean
  grantedAt: Date
  version: number
  receiptHash: string
}

export interface ConsentSettingsProps {
  currentState: ConsentState
  onUpdate: (tier: ConsentTier, granted: boolean) => Promise<void>
}

export interface TierToggleProps {
  tier: ConsentTier
  enabled: boolean
  locked?: boolean
  onToggle: (enabled: boolean) => void
  onLearnMore: () => void
}

export interface ReceiptHistoryProps {
  receipts: ConsentReceipt[]
}

