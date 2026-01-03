import { getDB, type SyncQueueItem } from './store'

/**
 * Add item to sync queue
 */
export async function enqueue(
  item: Omit<SyncQueueItem, 'id' | 'status' | 'attempts' | 'createdAt'>
): Promise<string> {
  const db = await getDB()
  
  const queueItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    status: 'pending',
    attempts: 0,
    createdAt: new Date().toISOString(),
  }
  
  await db.add('syncQueue', queueItem)
  
  return queueItem.id
}

/**
 * Get all pending sync items
 */
export async function getPendingItems(): Promise<SyncQueueItem[]> {
  const db = await getDB()
  return db.getAllFromIndex('syncQueue', 'by-status', 'pending')
}

/**
 * Get sync item by ID
 */
export async function getSyncItem(id: string): Promise<SyncQueueItem | undefined> {
  const db = await getDB()
  return db.get('syncQueue', id)
}

/**
 * Update sync item status
 */
export async function updateSyncItem(
  id: string,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  const db = await getDB()
  const item = await db.get('syncQueue', id)
  
  if (!item) {
    throw new Error(`Sync item ${id} not found`)
  }
  
  await db.put('syncQueue', {
    ...item,
    ...updates,
  })
}

/**
 * Mark sync item as processing
 */
export async function markProcessing(id: string): Promise<void> {
  await updateSyncItem(id, { status: 'processing' })
}

/**
 * Mark sync item as failed
 */
export async function markFailed(
  id: string,
  errorMessage: string
): Promise<void> {
  const item = await getSyncItem(id)
  
  if (!item) {
    throw new Error(`Sync item ${id} not found`)
  }
  
  await updateSyncItem(id, {
    status: item.attempts >= 2 ? 'failed' : 'pending',
    attempts: item.attempts + 1,
    errorMessage,
  })
}

/**
 * Remove completed sync item
 */
export async function removeSyncItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('syncQueue', id)
}

/**
 * Get count of pending items
 */
export async function getPendingCount(): Promise<number> {
  const items = await getPendingItems()
  return items.length
}

/**
 * Process sync queue (call appropriate sync functions)
 */
export async function processQueue(): Promise<{
  success: number
  failed: number
}> {
  const items = await getPendingItems()
  
  let success = 0
  let failed = 0
  
  for (const item of items) {
    try {
      await markProcessing(item.id)
      
      // Here we would call the appropriate sync function
      // based on item.type and item.resource
      // For now, just simulate success
      
      await removeSyncItem(item.id)
      success++
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      await markFailed(item.id, message)
      failed++
    }
  }
  
  return { success, failed }
}

/**
 * Clear all failed items
 */
export async function clearFailedItems(): Promise<number> {
  const db = await getDB()
  const failedItems = await db.getAllFromIndex('syncQueue', 'by-status', 'failed')
  
  if (failedItems.length > 0) {
    const tx = db.transaction('syncQueue', 'readwrite')
    await Promise.all(failedItems.map((item) => tx.store.delete(item.id)))
    await tx.done
  }
  
  return failedItems.length
}

/**
 * Retry all failed items
 */
export async function retryFailedItems(): Promise<void> {
  const db = await getDB()
  const failedItems = await db.getAllFromIndex('syncQueue', 'by-status', 'failed')
  
  const tx = db.transaction('syncQueue', 'readwrite')
  await Promise.all(
    failedItems.map((item) =>
      tx.store.put({
        ...item,
        status: 'pending',
        attempts: 0,
        errorMessage: undefined,
      })
    )
  )
  await tx.done
}

