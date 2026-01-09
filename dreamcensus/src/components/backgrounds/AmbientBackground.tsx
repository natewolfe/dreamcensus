'use client'

import { useTheme } from '@/hooks/use-theme'
import { StarField } from './StarField'
import { DreamMist } from './DreamMist'

export function AmbientBackground() {
  const { resolved } = useTheme()

  return (
    <>
      {(resolved === 'night' || resolved === 'dusk') && <StarField />}
      <DreamMist intensity={resolved === 'night' ? 'medium' : 'subtle'} />
    </>
  )
}
