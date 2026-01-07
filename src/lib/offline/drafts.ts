import { getDB, type DreamDraft } from './store'

/**
 * Save a draft to IndexedDB
 */
export async function saveDraft(draft: DreamDraft): Promise<void> {
  const db = await getDB()
  await db.put('drafts', draft)
}

/**
 * Get a draft by ID
 */
export async function getDraft(id: string): Promise<DreamDraft | undefined> {
  const db = await getDB()
  return db.get('drafts', id)
}

/**
 * Get today's draft for a user (if any)
 * Useful for restoring in-progress draft
 */
export async function getTodaysDraft(userId: string): Promise<DreamDraft | undefined> {
  const db = await getDB()
  const today = new Date().toISOString().split('T')[0]
  if (!today) return undefined
  
  const all = await db.getAllFromIndex('drafts', 'by-user', userId)
  return all.find(d => d.startedAt.startsWith(today))
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('drafts', id)
}

/**
 * Get all drafts for a user
 */
export async function getUserDrafts(userId: string): Promise<DreamDraft[]> {
  const db = await getDB()
  return db.getAllFromIndex('drafts', 'by-user', userId)
}

/**
 * Clear old drafts (older than 7 days)
 */
export async function clearOldDrafts(): Promise<void> {
  const db = await getDB()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  
  const all = await db.getAll('drafts')
  const toDelete = all.filter(d => {
    const draftDate = new Date(d.lastUpdatedAt)
    return draftDate < cutoff
  })
  
  for (const draft of toDelete) {
    await db.delete('drafts', draft.id)
  }
}
