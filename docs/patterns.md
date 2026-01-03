# Code Patterns & Conventions

> **Version:** 2.0  
> **Status:** Specification  
> **Created:** 2026-01-02

This document defines the code patterns, conventions, and best practices for The Dream Census v3.

---

## File Organization

### Naming Conventions

```
components/
├── ui/
│   ├── Button.tsx           # PascalCase for components
│   ├── Button.test.tsx      # Co-located tests
│   └── index.ts             # Barrel export
│
├── morning/
│   ├── MorningMode.tsx      # Main component
│   ├── use-voice.ts         # Hooks: lowercase with "use-" prefix
│   ├── voice-utils.ts       # Utilities: lowercase with hyphens
│   └── types.ts             # Types: lowercase
│
lib/
├── encryption.ts            # Modules: lowercase
├── use-offline.ts           # Hooks anywhere start with "use-"
└── constants.ts             # Constants: lowercase

app/
├── (app)/
│   └── today/
│       ├── page.tsx         # Route pages: page.tsx
│       ├── loading.tsx      # Loading UI
│       ├── error.tsx        # Error boundary
│       └── actions.ts       # Server Actions: actions.ts
```

### Import Order

```typescript
// 1. React/Next.js
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { motion } from 'motion/react'
import { z } from 'zod'

// 3. Internal aliases (@/)
import { Button, Card } from '@/components/ui'
import { db } from '@/lib/db'

// 4. Relative imports
import { VoiceCapture } from './VoiceCapture'
import type { MorningStep } from './types'

// 5. Types (type-only imports)
import type { DreamEntry } from '@/generated/prisma'
```

---

## Component Patterns

### Server Components (Default)

```tsx
// app/(app)/journal/page.tsx
import { getSession } from '@/lib/auth'
import { getDreams } from '@/lib/journal'
import { JournalList } from '@/components/journal'

export default async function JournalPage() {
  const session = await getSession()
  const dreams = await getDreams(session.userId)
  
  return (
    <main>
      <JournalList dreams={dreams} />
    </main>
  )
}
```

### Client Components

```tsx
// components/morning/VoiceCapture.tsx
'use client'

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui'

interface VoiceCaptureProps {
  onComplete: (transcript: string) => void
  onCancel: () => void
}

export function VoiceCapture({ onComplete, onCancel }: VoiceCaptureProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [transcript, setTranscript] = useState('')
  
  const handleStart = useCallback(() => {
    setState('recording')
    // Start recording logic
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ... */}
    </motion.div>
  )
}
```

### Compound Components

```tsx
// components/census/SectionRunner.tsx
import { createContext, useContext } from 'react'

interface SectionContext {
  currentIndex: number
  total: number
  goNext: () => void
  goBack: () => void
}

const SectionCtx = createContext<SectionContext | null>(null)

function useSectionContext() {
  const ctx = useContext(SectionCtx)
  if (!ctx) throw new Error('Must be used within SectionRunner')
  return ctx
}

// Main component
export function SectionRunner({ children, ...props }: SectionRunnerProps) {
  // ... state management
  return (
    <SectionCtx.Provider value={contextValue}>
      {children}
    </SectionCtx.Provider>
  )
}

// Sub-components
SectionRunner.Question = function Question({ children }: { children: ReactNode }) {
  const { currentIndex } = useSectionContext()
  return <div data-index={currentIndex}>{children}</div>
}

SectionRunner.Navigation = function Navigation() {
  const { goNext, goBack } = useSectionContext()
  return (
    <div>
      <Button onClick={goBack}>Back</Button>
      <Button onClick={goNext}>Next</Button>
    </div>
  )
}
```

### Render Props (When Needed)

```tsx
// components/common/ConditionalWrap.tsx
interface ConditionalWrapProps {
  condition: boolean
  wrap: (children: ReactNode) => ReactNode
  children: ReactNode
}

export function ConditionalWrap({ condition, wrap, children }: ConditionalWrapProps) {
  return condition ? wrap(children) : children
}

// Usage
<ConditionalWrap
  condition={isModal}
  wrap={(children) => <Modal>{children}</Modal>}
>
  <Form />
</ConditionalWrap>
```

---

## Server Action Patterns

### Basic Pattern

```typescript
// app/(app)/journal/actions.ts
'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { emitEvent } from '@/lib/events'
import { revalidatePath } from 'next/cache'

// 1. Define schema
const CreateDreamSchema = z.object({
  ciphertext: z.instanceof(Uint8Array),
  iv: z.instanceof(Uint8Array),
  keyVersion: z.number(),
  emotions: z.array(z.string()).max(10),
  vividness: z.number().min(0).max(100).optional(),
  lucidity: z.enum(['no', 'maybe', 'yes']).optional(),
})

// 2. Action type for return
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

// 3. Action implementation
export async function createDreamEntry(
  input: z.infer<typeof CreateDreamSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    // Auth
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Validate
    const data = CreateDreamSchema.parse(input)
    
    // Emit event (not direct mutation)
    const event = await emitEvent({
      type: 'journal.entry.created',
      userId: session.userId,
      payload: data,
    })
    
    // Revalidate
    revalidatePath('/journal')
    
    return { success: true, data: { id: event.aggregateId! } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    console.error('createDreamEntry error:', error)
    return { success: false, error: 'Failed to save dream' }
  }
}
```

### Form Action Pattern

```tsx
// components/journal/DreamEditor.tsx
'use client'

import { useActionState } from 'react'
import { updateDreamEntry } from '@/app/(app)/journal/actions'

export function DreamEditor({ dreamId }: { dreamId: string }) {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await updateDreamEntry(dreamId, {
        title: formData.get('title') as string,
      })
      return result
    },
    { success: false, error: null }
  )
  
  return (
    <form action={action}>
      <input name="title" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  )
}
```

---

## Event Sourcing Patterns

### Event Emission

```typescript
// lib/events.ts
import { db } from './db'
import type { Event } from '@/generated/prisma'

type EventType =
  | 'journal.entry.created'
  | 'journal.entry.updated'
  | 'journal.entry.deleted'
  | 'census.answer.submitted'
  | 'consent.granted'
  | 'consent.revoked'

interface EmitEventInput {
  type: EventType
  userId: string
  payload: Record<string, unknown>
  aggregateId?: string
  aggregateType?: string
}

export async function emitEvent(input: EmitEventInput): Promise<Event> {
  const event = await db.event.create({
    data: {
      type: input.type,
      userId: input.userId,
      payload: input.payload,
      aggregateId: input.aggregateId,
      aggregateType: input.aggregateType,
    },
  })
  
  // Dispatch to handlers (async, non-blocking)
  dispatchEventHandlers(event).catch(console.error)
  
  return event
}
```

### Event Handlers

```typescript
// lib/events/handlers.ts
import { db } from '../db'
import type { Event } from '@/generated/prisma'

type EventHandler = (event: Event) => Promise<void>

const handlers: Record<string, EventHandler[]> = {
  'journal.entry.created': [
    // Build projection
    async (event) => {
      await db.dreamEntry.create({
        data: {
          id: event.aggregateId!,
          userId: event.userId,
          ...event.payload as any,
        },
      })
    },
    // Queue AI extraction (if consent)
    async (event) => {
      const consent = await getConsent(event.userId, 'insights')
      if (consent) {
        await queueJob('ai.extract', { dreamId: event.aggregateId })
      }
    },
  ],
}

export async function dispatchEventHandlers(event: Event) {
  const eventHandlers = handlers[event.type] ?? []
  await Promise.all(eventHandlers.map(h => h(event)))
}
```

---

## Data Fetching Patterns

### Server Component Fetching

```tsx
// Best: Direct data fetching in Server Components
export default async function JournalPage() {
  const session = await getSession()
  const dreams = await db.dreamEntry.findMany({
    where: { userId: session.userId },
    orderBy: { capturedAt: 'desc' },
    take: 20,
  })
  
  return <JournalList dreams={dreams} />
}
```

### Cached Fetching

```typescript
// lib/cache.ts
import { unstable_cache, revalidateTag } from 'next/cache'
import { db } from './db'

export const getUserDreams = unstable_cache(
  async (userId: string) => {
    return db.dreamEntry.findMany({
      where: { userId },
      orderBy: { capturedAt: 'desc' },
    })
  },
  ['user-dreams'],
  {
    tags: ['dreams'],
    revalidate: 60, // 60 seconds
  }
)

// Invalidate on mutation
export function invalidateDreamsCache(userId: string) {
  revalidateTag('dreams')
  revalidateTag(`user:${userId}:dreams`)
}
```

### Client-Side Fetching (When Needed)

```tsx
// Only for real-time or user-specific dynamic data
'use client'

import { useState, useEffect } from 'react'

export function SyncStatus() {
  const [pending, setPending] = useState(0)
  
  useEffect(() => {
    // Poll sync status
    const interval = setInterval(async () => {
      const count = await getPendingSyncCount()
      setPending(count)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  return pending > 0 ? <Badge>{pending} pending</Badge> : null
}
```

---

## Encryption Patterns

### Encrypt on Client

```typescript
// lib/encryption.ts
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  )
  
  return {
    ciphertext: new Uint8Array(ciphertext),
    iv,
  }
}

export async function decrypt(
  ciphertext: Uint8Array,
  iv: Uint8Array,
  key: CryptoKey
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  
  return new TextDecoder().decode(decrypted)
}
```

### Hook Usage

```tsx
// components/journal/DecryptedDream.tsx
'use client'

import { useState, useEffect } from 'react'
import { useEncryptionKey } from '@/lib/use-encryption-key'
import { decrypt } from '@/lib/encryption'

interface DecryptedDreamProps {
  ciphertext: Uint8Array
  iv: Uint8Array
  keyVersion: number
}

export function DecryptedDream({ ciphertext, iv, keyVersion }: DecryptedDreamProps) {
  const { key, isLoading } = useEncryptionKey(keyVersion)
  const [narrative, setNarrative] = useState<string | null>(null)
  
  useEffect(() => {
    if (key) {
      decrypt(ciphertext, iv, key).then(setNarrative)
    }
  }, [key, ciphertext, iv])
  
  if (isLoading) return <Skeleton />
  if (!narrative) return <LockedContent />
  
  return <p>{narrative}</p>
}
```

---

## Offline Patterns

### IndexedDB Store

```typescript
// lib/offline/store.ts
import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'dreamcensus'
const DB_VERSION = 1

interface DreamCensusDB {
  drafts: {
    key: string
    value: DreamDraft
    indexes: { 'by-user': string }
  }
  syncQueue: {
    key: string
    value: SyncItem
    indexes: { 'by-status': string }
  }
}

let dbPromise: Promise<IDBPDatabase<DreamCensusDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DreamCensusDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Drafts store
        const drafts = db.createObjectStore('drafts', { keyPath: 'id' })
        drafts.createIndex('by-user', 'userId')
        
        // Sync queue store
        const sync = db.createObjectStore('syncQueue', { keyPath: 'id' })
        sync.createIndex('by-status', 'status')
      },
    })
  }
  return dbPromise
}
```

### Draft Management

```typescript
// lib/offline/drafts.ts
import { getDB } from './store'

export async function saveDraft(draft: DreamDraft) {
  const db = await getDB()
  await db.put('drafts', draft)
}

export async function getDraft(id: string) {
  const db = await getDB()
  return db.get('drafts', id)
}

export async function deleteDraft(id: string) {
  const db = await getDB()
  await db.delete('drafts', id)
}
```

### Sync Queue

```typescript
// lib/offline/sync.ts
import { getDB } from './store'

interface SyncItem {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  payload: unknown
  status: 'pending' | 'processing' | 'failed'
  attempts: number
  createdAt: Date
}

export async function enqueue(item: Omit<SyncItem, 'id' | 'status' | 'attempts' | 'createdAt'>) {
  const db = await getDB()
  await db.add('syncQueue', {
    ...item,
    id: crypto.randomUUID(),
    status: 'pending',
    attempts: 0,
    createdAt: new Date(),
  })
}

export async function processQueue() {
  const db = await getDB()
  const items = await db.getAllFromIndex('syncQueue', 'by-status', 'pending')
  
  for (const item of items) {
    try {
      await db.put('syncQueue', { ...item, status: 'processing' })
      await syncItem(item)
      await db.delete('syncQueue', item.id)
    } catch (error) {
      await db.put('syncQueue', {
        ...item,
        status: item.attempts >= 3 ? 'failed' : 'pending',
        attempts: item.attempts + 1,
      })
    }
  }
}
```

---

## Testing Patterns

### Unit Tests

```typescript
// lib/encryption.test.ts
import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, deriveKey } from './encryption'

describe('encryption', () => {
  it('encrypts and decrypts text', async () => {
    const key = await deriveKey('test-passphrase', new Uint8Array(16))
    const plaintext = 'Hello, World!'
    
    const { ciphertext, iv } = await encrypt(plaintext, key)
    const decrypted = await decrypt(ciphertext, iv, key)
    
    expect(decrypted).toBe(plaintext)
  })
})
```

### Component Tests

```tsx
// components/morning/EmotionChips.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmotionChips } from './EmotionChips'

describe('EmotionChips', () => {
  it('toggles selection on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<EmotionChips selected={[]} onChange={onChange} />)
    
    await user.click(screen.getByRole('button', { name: /joy/i }))
    
    expect(onChange).toHaveBeenCalledWith(['joy'])
  })
  
  it('respects max selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(
      <EmotionChips 
        selected={['joy', 'calm', 'awe']} 
        onChange={onChange}
        max={3}
      />
    )
    
    await user.click(screen.getByRole('button', { name: /fear/i }))
    
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

### Server Action Tests

```typescript
// app/(app)/journal/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDreamEntry } from './actions'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => ({ userId: 'test-user' })),
}))

vi.mock('@/lib/events', () => ({
  emitEvent: vi.fn(() => ({ id: 'event-1', aggregateId: 'dream-1' })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('createDreamEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('creates dream and emits event', async () => {
    const input = {
      ciphertext: new Uint8Array([1, 2, 3]),
      iv: new Uint8Array([4, 5, 6]),
      keyVersion: 1,
      emotions: ['joy'],
    }
    
    const result = await createDreamEntry(input)
    
    expect(result).toEqual({ success: true, data: { id: 'dream-1' } })
  })
})
```

---

## Error Handling Patterns

### Server Action Errors

```typescript
// Return errors, don't throw
export async function updateProfile(data: unknown): Promise<ActionResult<void>> {
  try {
    // ... logic
    return { success: true, data: undefined }
  } catch (error) {
    // Log for debugging
    console.error('updateProfile error:', error)
    
    // Return user-friendly message
    return { 
      success: false, 
      error: 'Unable to update profile. Please try again.' 
    }
  }
}
```

### Error Boundaries

```tsx
// app/(app)/journal/error.tsx
'use client'

import { ErrorDisplay } from '@/components/common'

export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load journal"
      message="We couldn't load your dreams. This might be a temporary issue."
      onRetry={reset}
    />
  )
}
```

---

## TypeScript Patterns

### Strict Types

```typescript
// Always use strict types, never any
interface DreamEntry {
  id: string
  userId: string
  ciphertext: Uint8Array | null
  iv: Uint8Array | null
  keyVersion: number
  emotions: string[]
  vividness: number | null
  lucidity: 'no' | 'maybe' | 'yes' | null
}

// Use discriminated unions
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Use const assertions
const EMOTIONS = ['joy', 'fear', 'calm'] as const
type Emotion = typeof EMOTIONS[number]
```

### Generic Components

```tsx
interface SelectProps<T extends string> {
  options: T[]
  value: T | null
  onChange: (value: T) => void
  getLabel?: (option: T) => string
}

export function Select<T extends string>({
  options,
  value,
  onChange,
  getLabel = (o) => o,
}: SelectProps<T>) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  )
}
```

---

## CSS Patterns

### CSS Variables for Theming

```css
/* globals.css */
:root {
  /* Colors */
  --background: #0c0e1a;
  --foreground: #e8eaf6;
  --accent: #b093ff;
  --muted: #7986cb;
  --subtle: #3f4774;
  
  /* Morning mode overrides */
  --morning-background: #080a12;
  --morning-foreground: #c5cae9;
  
  /* NEW: Signature gradients */
  --dream-mist: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  --dream-mist-glow: radial-gradient(circle at 50% 50%, rgba(149, 117, 205, 0.15), transparent 70%);
  
  /* NEW: Progress ring */
  --ring-track: #2d2d44;
  --ring-fill: var(--accent);
  --ring-glow: rgba(176, 147, 255, 0.3);
  
  /* NEW: Constellation colors */
  --constellation-node: #b093ff;
  --constellation-edge: rgba(176, 147, 255, 0.3);
  --constellation-pulse: rgba(176, 147, 255, 0.5);
  --constellation-person: #f06292;
  --constellation-place: #4dd0e1;
  --constellation-symbol: #aed581;
  --constellation-theme: #ffb74d;
  --constellation-emotion: #b39ddb;
  
  /* NEW: Breathing guide */
  --breathe-inhale: #9575cd;
  --breathe-hold: #7e57c2;
  --breathe-exhale: #5e35b1;
}

.morning-mode {
  --background: var(--morning-background);
  --foreground: var(--morning-foreground);
}
```

### Enhanced Animation Patterns

```css
/* Breathing animation */
@keyframes breathe-in {
  from { transform: scale(1); opacity: 0.7; }
  to { transform: scale(1.3); opacity: 1; }
}

@keyframes breathe-hold {
  from, to { transform: scale(1.3); opacity: 1; }
}

@keyframes breathe-out {
  from { transform: scale(1.3); opacity: 1; }
  to { transform: scale(1); opacity: 0.7; }
}

/* Constellation node pulse */
@keyframes node-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 var(--constellation-pulse); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 8px transparent; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; }
}

/* Edge draw-in animation */
@keyframes edge-draw {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

/* Dream Mist fade-in for celebratory moments */
@keyframes dream-mist-appear {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Progress ring fill */
@keyframes ring-fill {
  from { stroke-dashoffset: 283; /* 2πr where r=45 */ }
  to { stroke-dashoffset: calc(283 * (1 - var(--progress, 0))); }
}
```

### Ritual Mode Transitions

```css
/* Slower, more ambient for ritual contexts (Night Mode) */
.ritual-enter {
  opacity: 0;
  transform: scale(0.98);
}

.ritual-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 400ms ease-out;
}

.ritual-exit {
  opacity: 1;
}

.ritual-exit-active {
  opacity: 0;
  transition: opacity 300ms ease-in;
}
```

### Tailwind Class Organization

```tsx
// Order: layout → spacing → sizing → typography → colors → effects → states
<button
  className={`
    flex items-center justify-center gap-2
    px-4 py-2
    h-10 min-w-[100px]
    text-sm font-medium
    bg-accent text-white
    rounded-lg shadow-sm
    hover:brightness-110
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all
  `}
>
  Submit
</button>
```

### Component Variants with cn()

```tsx
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
const buttonVariants = {
  primary: 'bg-accent text-white hover:brightness-110',
  secondary: 'bg-subtle text-foreground hover:bg-muted',
  ghost: 'bg-transparent hover:bg-subtle',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg transition-all',
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  )
}
```

