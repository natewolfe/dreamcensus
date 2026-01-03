import { getDB, type DreamDraft } from './store'

/**
 * Save or update a draft
 */
export async function saveDraft(draft: DreamDraft): Promise<void> {
  const db = await getDB()
  await db.put('drafts', {
    ...draft,
    lastUpdatedAt: new Date().toISOString(),
  })
}

/**
 * Get a draft by ID
 */
export async function getDraft(id: string): Promise<DreamDraft | undefined> {
  const db = await getDB()
  return db.get('drafts', id)
}

/**
 * Get all drafts for a user
 */
export async function getUserDrafts(userId: string): Promise<DreamDraft[]> {
  const db = await getDB()
  return db.getAllFromIndex('drafts', 'by-user', userId)
}

/**
 * Get most recent draft for a user
 */
export async function getRecentDraft(userId: string): Promise<DreamDraft | undefined> {
  const drafts = await getUserDrafts(userId)
  
  if (drafts.length === 0) return undefined
  
  // Sort by lastUpdatedAt descending
  drafts.sort((a, b) => {
    return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
  })
  
  return drafts[0]
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('drafts', id)
}

/**
 * Delete all drafts for a user
 */
export async function deleteUserDrafts(userId: string): Promise<void> {
  const drafts = await getUserDrafts(userId)
  const db = await getDB()
  
  const tx = db.transaction('drafts', 'readwrite')
  await Promise.all(drafts.map((draft) => tx.store.delete(draft.id)))
  await tx.done
}

/**
 * Clean up old drafts (older than N days)
 */
export async function cleanupOldDrafts(daysOld: number = 7): Promise<number> {
  const db = await getDB()
  const allDrafts = await db.getAll('drafts')
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const oldDrafts = allDrafts.filter((draft) => {
    return new Date(draft.lastUpdatedAt) < cutoffDate
  })
  
  if (oldDrafts.length > 0) {
    const tx = db.transaction('drafts', 'readwrite')
    await Promise.all(oldDrafts.map((draft) => tx.store.delete(draft.id)))
    await tx.done
  }
  
  return oldDrafts.length
}

