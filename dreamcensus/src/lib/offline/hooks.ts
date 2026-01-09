'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPendingCount, processQueue } from './sync'

/**
 * Hook to monitor online/offline status
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Hook to monitor sync queue status
 */
export function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const isOnline = useOffline()

  const checkPending = useCallback(async () => {
    const count = await getPendingCount()
    setPendingCount(count)
  }, [])

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      await processQueue()
      await checkPending()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, checkPending])

  // Check pending on mount and when coming online
  useEffect(() => {
    checkPending()
  }, [checkPending])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      sync()
    }
  }, [isOnline, pendingCount, isSyncing, sync])

  // Poll for pending items
  useEffect(() => {
    const interval = setInterval(checkPending, 5000)
    return () => clearInterval(interval)
  }, [checkPending])

  return {
    isOnline,
    pendingCount,
    isSyncing,
    sync,
  }
}

