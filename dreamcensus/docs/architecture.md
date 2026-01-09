# Architecture Specification

> **Version:** 2.1  
> **Status:** Specification  
> **Updated:** 2026-01-02

This document defines the system architecture for The Dream Census v3, built from the ground up for ritual-based UX, privacy-first data handling, and research-grade data collection.

**Related documentation:**
- [`ux-enhancements.md`](./ux-enhancements.md) — Visual design, interaction primitives, engagement system
- [`components.md`](./components.md) — Component specifications and UI primitives
- [`patterns.md`](./patterns.md) — Code patterns and CSS conventions
- [`flows/onboarding.md`](./flows/onboarding.md) — 4-screen onboarding specification
- [`flows/morning-mode.md`](./flows/morning-mode.md) — Morning capture flow
- [`flows/night-mode.md`](./flows/night-mode.md) — Pre-sleep ritual flow

---

## Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                    │
├────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │  Morning Mode │  │   Day Loop    │  │  Night Mode   │               │
│  │  (Voice/Text) │  │   (Prompts)   │  │  (Check-in)   │               │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘               │
│          │                  │                  │                       │
│          └──────────────────┼──────────────────┘                       │
│                             │                                          │
│  ┌──────────────────────────┴──────────────────────────┐               │
│  │                   Offline Layer                     │               │
│  │  • IndexedDB draft storage                          │               │
│  │  • Sync queue                                       │               │
│  │  • Encryption/decryption                            │               │
│  └──────────────────────────┬──────────────────────────┘               │
│                             │                                          │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │
                              │ HTTPS (encrypted in transit)
                              │
┌─────────────────────────────┼──────────────────────────────────────────┐
│                             │            SERVER                        │
├─────────────────────────────┴──────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    Next.js App Router                         │     │
│  │  • Server Components (data fetching)                          │     │
│  │  • Server Actions (mutations)                                 │     │
│  │  • API Routes (webhooks, external)                            │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                              │                                         │
│  ┌───────────────────────────┴───────────────────────────────────┐     │
│  │                      Event Bus                                │     │
│  │  • Append-only event log                                      │     │
│  │  • Event handlers                                             │     │
│  │  • Projection builders                                        │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                             │                                          │
│  ┌───────────────┐  ┌───────┴───────┐  ┌───────────────┐               │
│  │   PostgreSQL  │  │   Job Queue   │  │  Object Store │               │
│  │  • Events     │  │  • AI extract │  │  • Audio      │               │
│  │  • Projections│  │  • Aggregates │  │  • Images     │               │
│  │  • Aggregates │  │  • Exports    │  │               │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Core Principles

### 1. Server Components by Default

```tsx
// Pages are async Server Components
export default async function TodayPage() {
  const session = await getSession()
  const dreams = await getDreams(session.userId)
  
  return (
    <TodayHub>
      <MorningTile dreams={dreams} />
      <PromptTile />
      <WeatherTile />
    </TodayHub>
  )
}
```

Client Components only for:
- Interactive widgets (voice capture, sliders)
- Real-time updates (sync status)
- Offline-capable forms

### 2. Event Sourcing

All state changes are recorded as immutable events:

```typescript
// Instead of direct mutations
await db.dreamEntry.create({ data: {...} })

// We emit events
await emitEvent({
  type: 'journal.entry.created',
  payload: { ... },
  userId: session.userId,
})

// Events build projections
// Projections are the "current state" views
```

Benefits:
- Complete audit trail
- Reproducible projections
- Easy debugging
- Research-grade data lineage

### 3. Privacy by Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Client Device                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  User Key (derived from passphrase or device key)   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Encrypt: plaintext → ciphertext + IV               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│                     Server                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stores: ciphertext + IV + keyVersion               │   │
│  │  NEVER sees: plaintext, user key                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Derived features (emotions, themes, etc.)          │   │
│  │  Only computed with Insights tier consent           │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 4. Offline-First Journaling

```typescript
// Capture workflow
async function captureDream(data: DreamData) {
  // 1. Save to IndexedDB immediately
  const draft = await offlineStore.saveDraft(data)
  
  // 2. Encrypt on device
  const encrypted = await encrypt(data.narrative, userKey)
  
  // 3. Queue for sync
  await syncQueue.enqueue({
    type: 'dream.create',
    payload: { ...data, ciphertext: encrypted },
  })
  
  // 4. Attempt sync if online
  if (navigator.onLine) {
    await syncQueue.flush()
  }
  
  return draft
}
```

---

## Data Architecture

### Event Store

All mutations flow through the event store:

```typescript
interface Event {
  id: string
  type: EventType
  userId: string
  payload: JsonValue
  timestamp: Date
  sequence: bigint  // Ordering guarantee
}

type EventType =
  // Journal
  | 'journal.entry.created'
  | 'journal.entry.updated'
  | 'journal.entry.deleted'
  | 'journal.facts.extracted'
  
  // Census
  | 'census.answer.submitted'
  | 'census.section.completed'
  
  // Prompts
  | 'prompt.shown'
  | 'prompt.responded'
  | 'prompt.skipped'
  
  // Consent
  | 'consent.granted'
  | 'consent.revoked'
  
  // Auth
  | 'user.created'
  | 'user.key.rotated'
```

### Projections (Materialized Views)

Events are projected into queryable tables:

```
Events → Projections

journal.entry.created  ─┬─→ DreamEntry (current state)
journal.entry.updated  ─┤
journal.entry.deleted  ─┘

journal.facts.extracted ──→ JournalFact (with provenance)

census.answer.submitted ──→ CensusAnswer + CensusProgress

consent.granted ─┬─→ Consent (current state)
consent.revoked ─┘
```

### Aggregates (Privacy-Safe)

```typescript
interface WeatherAggregate {
  metric: string      // "emotion_joy", "theme_flying"
  period: string      // "daily", "weekly"
  periodStart: Date
  
  value: JsonValue    // Aggregated data
  sampleN: number     // Contribution count
  
  // Privacy parameters
  dpEpsilon?: number  // Differential privacy
  dpDelta?: number
  minNThreshold: number
  
  // Provenance
  methodVersion: number
  computedAt: Date
}
```

---

## Component Architecture

### Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Pages                                │
│  /today, /journal, /census, /weather, /insights             │
│  (Server Components - data fetching)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Feature Components                      │
│  MorningMode, JournalList, CensusSection, WeatherDashboard  │
│  (Mix of Server and Client)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                          │
│  Button, Card, Modal, Slider, Chips                         │
│  (Client Components - presentation)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Libraries                            │
│  encryption, events, offline, consent, auth, db             │
│  (Utilities and services)                                   │
└─────────────────────────────────────────────────────────────┘
```

### File Naming Conventions

```
components/
├── ui/                    # Primitives
│   ├── Button.tsx         # PascalCase component files
│   ├── Card.tsx
│   └── index.ts           # Barrel exports
│
├── morning/               # Feature components
│   ├── MorningMode.tsx    # Main container
│   ├── VoiceCapture.tsx   # Sub-component
│   ├── EmotionChips.tsx
│   └── use-voice.ts       # Hooks (lowercase)
│
lib/
├── encryption.ts          # Lowercase utility files
├── events.ts
└── use-offline.ts         # Hooks start with "use-"
```

---

## Authentication & Session

### Session Model

```typescript
interface Session {
  userId: string
  sessionId: string
  expiresAt: Date
  
  // Key management
  keyVersion: number
  
  // Device binding (optional)
  deviceId?: string
}
```

### Key Derivation

```typescript
// Option 1: Passphrase-based
async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 600000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

// Option 2: Device-bound (no passphrase)
// Key stored in device keychain/secure storage
```

---

## API Design

### Server Actions (Primary)

```typescript
// Server Actions for all mutations
'use server'

export async function createDreamEntry(formData: FormData) {
  const session = await getSession()
  
  // Validate
  const data = DreamEntrySchema.parse(...)
  
  // Emit event (not direct mutation)
  await emitEvent({
    type: 'journal.entry.created',
    userId: session.userId,
    payload: data,
  })
  
  // Revalidate
  revalidatePath('/journal')
  
  return { success: true }
}
```

### API Routes (External)

```typescript
// For webhooks, external integrations
// /api/webhooks/[provider]/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get('x-signature')
  // Verify + process
}
```

---

## Job System

### Job Types

```typescript
type JobType =
  | 'ai.extract'         // Extract facts from dream
  | 'aggregate.compute'  // Compute weather aggregates
  | 'export.generate'    // Generate data export
  | 'consent.cleanup'    // Clean up on consent revocation
```

### Job Processing

```typescript
// Using Inngest or similar
import { inngest } from '@/lib/inngest'

export const extractFacts = inngest.createFunction(
  { id: 'extract-facts' },
  { event: 'journal.entry.created' },
  async ({ event, step }) => {
    const { dreamId } = event.data
    
    // Step 1: Get dream text
    const dream = await step.run('get-dream', async () => {
      return db.dreamEntry.findUnique({ where: { id: dreamId } })
    })
    
    // Step 2: Extract with AI
    const facts = await step.run('extract', async () => {
      return extractWithVerification(dream.narrative)
    })
    
    // Step 3: Save facts
    await step.run('save-facts', async () => {
      return saveFacts(dreamId, facts)
    })
  }
)
```

---

## Caching Strategy

### Cache Tags

```typescript
const CacheTags = {
  // User-specific
  USER_PROFILE: (userId: string) => `user:${userId}`,
  USER_JOURNAL: (userId: string) => `journal:${userId}`,
  USER_INSIGHTS: (userId: string) => `insights:${userId}`,
  
  // Census
  CENSUS_SECTIONS: 'census:sections',
  CENSUS_PROGRESS: (userId: string) => `census:progress:${userId}`,
  
  // Aggregates
  WEATHER_METRIC: (metric: string) => `weather:${metric}`,
  WEATHER_COLLECTIVE: 'weather:collective',
}
```

### Invalidation

```typescript
// After mutations
await emitEvent({ type: 'journal.entry.created', ... })

// Invalidate related caches
revalidateTag(CacheTags.USER_JOURNAL(userId))
revalidateTag(CacheTags.USER_INSIGHTS(userId))
```

---

## Security

### Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

### Input Validation

All inputs validated with Zod:

```typescript
const DreamEntrySchema = z.object({
  narrative: z.string().max(50000),
  emotions: z.array(z.enum(EMOTIONS)).max(10),
  vividness: z.number().min(0).max(100),
  lucidity: z.enum(['no', 'maybe', 'yes']),
})
```

### AI Safety

```typescript
// Strict output schemas
const FactExtractionSchema = z.object({
  emotions: z.array(EmotionFactSchema).max(10),
  themes: z.array(ThemeFactSchema).max(5),
  symbols: z.array(SymbolFactSchema).max(10),
})

// Verification loop
async function extractWithVerification(text: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await callLLM(text)
    const result = FactExtractionSchema.safeParse(raw)
    if (result.success) return result.data
  }
  return { emotions: [], themes: [], symbols: [] }
}
```

---

## Observability

### Metrics

```typescript
// Web Vitals
export function reportWebVitals(metric: Metric) {
  switch (metric.name) {
    case 'LCP':
    case 'INP':
    case 'CLS':
      track('web_vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      })
      break
  }
}
```

### Traces

```typescript
// Server Action tracing
export async function createDreamEntry(formData: FormData) {
  const span = trace.startSpan('createDreamEntry')
  try {
    // ... action logic
  } finally {
    span.end()
  }
}
```

### Error Tracking

```typescript
// Sentry or similar
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  })
}
```

---

## Deployment

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
ENCRYPTION_KEY_SALT=base64-encoded-salt

# Optional
OPENAI_API_KEY=sk-...
SENTRY_DSN=https://...
```

### Infrastructure

```
┌───────────────────────────────────────────────────────────┐
│                        Render.com                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Next.js App (Serverless Functions)                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                │
│                          ▼                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Edge Functions (Auth, Headers)                     │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ PostgreSQL      │  │  Inngest      │  │  Cloudflare   │  │
│  │ (Render.com)    │  │  (Job Queue)  │  │  R2 (Blobs)   │  │
│  └─────────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

