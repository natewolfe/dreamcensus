'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface OfflineBannerProps {
  pendingCount?: number
  onSync?: () => void
}

export function OfflineBanner({ pendingCount = 0, onSync }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Initialize with current status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Hide banner after a short delay when coming back online
      setTimeout(() => setShowBanner(false), 2000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Show banner if offline or if there are pending items
  useEffect(() => {
    if (!isOnline || pendingCount > 0) {
      setShowBanner(true)
    }
  }, [isOnline, pendingCount])

  if (!showBanner) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'border-b px-4 py-3',
        'animate-[slide-down_0.3s_ease-out]',
        isOnline
          ? 'bg-green-900/90 border-green-700 text-green-100'
          : 'bg-yellow-900/90 border-yellow-700 text-yellow-100'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                Back online
                {pendingCount > 0 && ` · ${pendingCount} item${pendingCount === 1 ? '' : 's'} syncing`}
              </span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">
                You're offline
                {pendingCount > 0 && ` · ${pendingCount} item${pendingCount === 1 ? '' : 's'} waiting to sync`}
              </span>
            </>
          )}
        </div>

        {isOnline && pendingCount > 0 && onSync && (
          <button
            onClick={onSync}
            className="rounded-md bg-green-800 px-3 py-1 text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Sync Now
          </button>
        )}
      </div>
    </div>
  )
}

