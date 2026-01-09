import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'dream-census'
const DB_VERSION = 2

export interface DreamDraft {
  id: string
  userId: string
  step: string
  narrative?: string
  audioUrl?: string
  emotions: string[]
  vividness: number
  lucidity: string | null
  tags: string[]
  title?: string
  wakingLifeLink?: string
  startedAt: string
  lastUpdatedAt: string
}

export interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  payload: unknown
  status: 'pending' | 'processing' | 'failed'
  attempts: number
  createdAt: string
  errorMessage?: string
}

export interface AlarmRuntimeState {
  nextAlarmAtISO: string | null
  isRinging: boolean
  ringStartedAtISO: string | null
  snoozeUntilISO: string | null
  snoozeCount: number
  lastComputedAtISO: string
  source: 'schedule' | 'override' | null
  sourceDate: string | null
}

export interface DreamCensusDB {
  drafts: {
    key: string
    value: DreamDraft
    indexes: { 'by-user': string; 'by-updated': string }
  }
  syncQueue: {
    key: string
    value: SyncQueueItem
    indexes: { 'by-status': string; 'by-resource': string }
  }
  metadata: {
    key: string
    value: unknown
  }
  alarmState: {
    key: 'current'
    value: AlarmRuntimeState
  }
}

let dbPromise: Promise<IDBPDatabase<DreamCensusDB>> | null = null

/**
 * Get or create IndexedDB instance
 */
export function getDB(): Promise<IDBPDatabase<DreamCensusDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DreamCensusDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Drafts store
        if (!db.objectStoreNames.contains('drafts')) {
          const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' })
          draftsStore.createIndex('by-user', 'userId')
          draftsStore.createIndex('by-updated', 'lastUpdatedAt')
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncStore.createIndex('by-status', 'status')
          syncStore.createIndex('by-resource', 'resource')
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata')
        }

        // Alarm state store (singleton)
        if (!db.objectStoreNames.contains('alarmState')) {
          db.createObjectStore('alarmState')
        }
      },
      blocked() {
        console.warn('IndexedDB upgrade blocked')
      },
      blocking() {
        console.warn('IndexedDB blocking')
      },
      terminated() {
        console.error('IndexedDB terminated unexpectedly')
        dbPromise = null
      },
    })
  }

  return dbPromise
}

/**
 * Clear all data (for testing or logout)
 */
export async function clearDB(): Promise<void> {
  const db = await getDB()
  
  const tx = db.transaction(['drafts', 'syncQueue', 'metadata', 'alarmState'], 'readwrite')
  
  await Promise.all([
    tx.objectStore('drafts').clear(),
    tx.objectStore('syncQueue').clear(),
    tx.objectStore('metadata').clear(),
    tx.objectStore('alarmState').clear(),
  ])
  
  await tx.done
}

/**
 * Get database size estimate
 */
export async function getDBSize(): Promise<{ usage: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
    }
  }
  return null
}

