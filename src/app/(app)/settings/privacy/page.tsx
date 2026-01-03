'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout'
import { ConsentSettings } from '@/components/consent'
import type { ConsentState, ConsentTier } from '@/components/consent/types'

export default function PrivacySettingsPage() {
  const [consentState, setConsentState] = useState<ConsentState>({
    insights: false,
    commons: false,
    studies: false,
  })

  const handleUpdate = async (tier: ConsentTier, granted: boolean) => {
    // In production, call Server Action
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    setConsentState((prev) => {
      const newState = { ...prev, [tier]: granted }
      
      // Enforce dependencies
      if (tier === 'insights' && !granted) {
        newState.commons = false
        newState.studies = false
      }
      if (tier === 'commons' && !granted) {
        newState.studies = false
      }
      
      return newState
    })
  }

  return (
    <div id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        title="Privacy Controls"
        subtitle="Manage what data is processed and shared"
      />

      <ConsentSettings
        currentState={consentState}
        onUpdate={handleUpdate}
      />
    </div>
  )
}

