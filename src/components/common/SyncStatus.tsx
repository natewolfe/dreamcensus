'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface SyncStatusProps {
  className?: string
}

type SyncState = 'idle' | 'syncing' | 'success' | 'error'

export function SyncStatus({ className }: SyncStatusProps) {
  const [state] = useState<SyncState>('idle')
  const [pendingCount] = useState(0)

  useEffect(() => {
    // In a real implementation, this would check IndexedDB for pending sync items
    // For now, this is a placeholder that demonstrates the UI states
    
    const checkSyncStatus = async () => {
      // TODO: Implement actual sync queue checking
      // const queue = await getSyncQueue()
      // setPendingCount(queue.filter(item => item.status === 'pending').length)
    }

    checkSyncStatus()
    const interval = setInterval(checkSyncStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  if (pendingCount === 0 && state === 'idle') {
    return null
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs',
        state === 'syncing' && 'bg-blue-500/20 text-blue-400',
        state === 'success' && 'bg-green-500/20 text-green-400',
        state === 'error' && 'bg-red-500/20 text-red-400',
        state === 'idle' && 'bg-subtle text-muted',
        className
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          state === 'syncing' && 'bg-blue-400 animate-pulse',
          state === 'success' && 'bg-green-400',
          state === 'error' && 'bg-red-400',
          state === 'idle' && 'bg-muted'
        )}
      />

      {/* Status text */}
      <span className="font-medium">
        {state === 'syncing' && 'Syncing...'}
        {state === 'success' && 'Synced'}
        {state === 'error' && 'Sync failed'}
        {state === 'idle' && pendingCount > 0 && `${pendingCount} pending`}
      </span>
    </div>
  )
}

