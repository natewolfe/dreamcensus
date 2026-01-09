# Day Loop Flow Specification

> **Version:** 2.0  
> **Status:** Specification  
> **Created:** 2026-01-02

The Day Loop is the **daily prompt system** that surfaces one question per day during waking hours. It's designed for **micro-moments of reflection**, not extended sessions.

---

## Philosophy

### Anti-Doomscroll

Unlike social media feeds that maximize engagement through infinite scroll, the Day Loop intentionally limits content:

- **One prompt per day** (not a feed)
- **One primary action** (respond or skip)
- **No notifications for more content**
- **Clear completion state**

### Prompt Types

| Type | Purpose | Example |
|------|---------|---------|
| `reflection` | Personal insight | "What's a dream you still think about years later?" |
| `exploration` | Curiosity expansion | "Have you ever had a dream in a language you don't speak?" |
| `research` | Data collection | "How often do you remember dreams?" |
| `creative` | Expression | "Describe your most vivid dream setting in one sentence." |

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Daily prompt view rate | > 60% | Users engage with feature |
| Response rate | > 40% | Questions feel worth answering |
| Skip rate | < 30% | Questions are relevant |
| Time to respond | < 2 min | Low friction |
| Repeat engagement | > 50% weekly | Habit formation |

---

## State Machine

```typescript
type DayPromptState =
  | 'hidden'      // Before prompt time or already completed
  | 'available'   // Ready to show
  | 'viewing'     // User is looking at prompt
  | 'responding'  // User is composing response
  | 'completed'   // Response submitted
  | 'skipped'     // User skipped for today

type DayPromptEvent =
  | { type: 'PROMPT_AVAILABLE'; prompt: Prompt }
  | { type: 'VIEW' }
  | { type: 'START_RESPONSE' }
  | { type: 'SUBMIT_RESPONSE'; value: ResponseValue }
  | { type: 'SKIP' }
  | { type: 'REMIND_LATER' }
```

---

## Screen Specifications

### Today Hub Integration

The Day Loop appears as a tile on the `/today` hub:

```
┌─────────────────────────────────────────────────────────────┐
│                         Today                               │
│                      January 2, 2026                        │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🌅 Morning                                         │   │
│  │                                                     │   │
│  │  You captured a dream this morning.                │   │
│  │  "The Endless Hallway" · 7:32 AM                   │   │
│  │                                                     │   │
│  │                              [View →]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💭 Daily Prompt                                    │   │
│  │                                                     │   │
│  │  "What's a recurring symbol in your dreams?"       │   │
│  │                                                     │   │
│  │  [Respond →]                        [Skip]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🌙 Tonight                                         │   │
│  │                                                     │   │
│  │  Set an intention for tonight's dreams.            │   │
│  │                                                     │   │
│  │                              [Begin →]              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Prompt Card (Collapsed)

```
┌─────────────────────────────────────────────────────────────┐
│  💭 Daily Prompt                                            │
│                                                             │
│  "What's a recurring symbol in your dreams?"               │
│                                                             │
│  [Respond →]                                   [Skip]       │
└─────────────────────────────────────────────────────────────┘
```

### Prompt Card (Expanded / Response Mode)

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                                        │
│                                                             │
│                💭 Daily Prompt                              │
│                                                             │
│      "What's a recurring symbol in your dreams?"           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │                                                   │     │
│  │  Water appears in my dreams constantly...        │     │
│  │  _                                               │     │
│  │                                                   │     │
│  │                                                   │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│                                                             │
│                        [Submit →]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Response Types

#### Text Response

```tsx
interface TextResponseProps {
  placeholder?: string
  minLength?: number
  maxLength?: number
  value: string
  onChange: (value: string) => void
}
```

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  Share your thoughts...                          │
│  _                                               │
│                                                   │
│                                                   │
└───────────────────────────────────────────────────┘
```

#### Scale Response

```tsx
interface ScaleResponseProps {
  min: number
  max: number
  step?: number
  labels?: { left: string; right: string }
  value: number | null
  onChange: (value: number) => void
}
```

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  Rarely  ○─────────●─────────○  Very often       │
│                                                   │
└───────────────────────────────────────────────────┘
```

#### Choice Response

```tsx
interface ChoiceResponseProps {
  options: Array<{ value: string; label: string }>
  allowMultiple?: boolean
  value: string | string[] | null
  onChange: (value: string | string[]) => void
}
```

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  [● Yes, frequently]                              │
│  [○ Sometimes]                                    │
│  [○ Rarely]                                       │
│  [○ Never]                                        │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Completed State

```
┌─────────────────────────────────────────────────────────────┐
│  💭 Daily Prompt                              ✓ Completed   │
│                                                             │
│  "What's a recurring symbol in your dreams?"               │
│                                                             │
│  Your response: "Water appears in my dreams..."            │
│                                                             │
│  [View →]                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Prompt Selection Algorithm

### Selection Factors

```typescript
interface PromptSelectionInput {
  userId: string
  previousResponses: PromptResponse[]
  currentTime: Date
  userTimezone: string
  consentTier: ConsentTier
}

async function selectDailyPrompt(input: PromptSelectionInput): Promise<Prompt | null> {
  // 1. Filter eligible prompts
  const eligible = await db.prompt.findMany({
    where: {
      isActive: true,
      // Not answered recently
      NOT: {
        responses: {
          some: {
            userId: input.userId,
            respondedAt: { gte: subDays(new Date(), 30) },
          },
        },
      },
    },
  })
  
  // 2. Apply targeting rules
  const targeted = eligible.filter(p => 
    evaluateTargetingRules(p.targetingRules, input)
  )
  
  // 3. Prioritize by type rotation
  const typeOrder = getTypeRotation(input.previousResponses)
  const sorted = targeted.sort((a, b) => 
    typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
  )
  
  // 4. Add randomness within type
  const topType = sorted[0]?.type
  const sameType = sorted.filter(p => p.type === topType)
  const selected = sameType[Math.floor(Math.random() * sameType.length)]
  
  return selected
}
```

### Type Rotation

To maintain variety, rotate through prompt types:

```typescript
function getTypeRotation(recentResponses: PromptResponse[]): PromptType[] {
  const recentTypes = recentResponses
    .slice(0, 7)
    .map(r => r.prompt.type)
  
  const allTypes: PromptType[] = ['reflection', 'exploration', 'research', 'creative']
  
  // Deprioritize recently seen types
  return allTypes.sort((a, b) => {
    const aIndex = recentTypes.indexOf(a)
    const bIndex = recentTypes.indexOf(b)
    // -1 (not found) sorts first
    return aIndex - bIndex
  })
}
```

### Targeting Rules

```typescript
interface TargetingRule {
  field: 'dreamCount' | 'censusComplete' | 'daysActive' | 'consentTier'
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in'
  value: unknown
}

function evaluateTargetingRules(
  rules: TargetingRule[] | null,
  input: PromptSelectionInput
): boolean {
  if (!rules || rules.length === 0) return true
  
  return rules.every(rule => {
    const fieldValue = getFieldValue(rule.field, input)
    return evaluateCondition(fieldValue, rule.operator, rule.value)
  })
}
```

---

## Data Model

### Database Schema

```prisma
model Prompt {
  id            String   @id @default(cuid())
  text          String
  type          String   // "reflection" | "exploration" | "research" | "creative"
  responseType  String   // "text" | "scale" | "choice" | "multi_choice"
  responseProps Json?    // Type-specific configuration
  
  isActive      Boolean  @default(true)
  frequency     String?  // "daily" | "weekly" | "once"
  
  targetingRules Json?
  studyId        String?
  
  responses PromptResponse[]
  
  createdAt DateTime @default(now())
}

model PromptResponse {
  id       String   @id @default(cuid())
  userId   String
  promptId String
  
  value    Json     // Response value
  
  shownAt     DateTime
  respondedAt DateTime @default(now())
  skipped     Boolean  @default(false)
  
  @@unique([userId, promptId, shownAt])
}
```

### Response Value Types

```typescript
type ResponseValue =
  | { type: 'text'; text: string }
  | { type: 'scale'; value: number }
  | { type: 'choice'; selected: string }
  | { type: 'multi_choice'; selected: string[] }
```

---

## Server Actions

```typescript
// app/(app)/today/actions.ts
'use server'

export async function getDailyPrompt(): Promise<Prompt | null> {
  const session = await getSession()
  if (!session) return null
  
  // Check if already responded today
  const todayResponse = await db.promptResponse.findFirst({
    where: {
      userId: session.userId,
      shownAt: { gte: startOfDay(new Date()) },
    },
  })
  
  if (todayResponse) return null
  
  return selectDailyPrompt({
    userId: session.userId,
    // ... other inputs
  })
}

export async function submitPromptResponse(
  promptId: string,
  value: ResponseValue
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Not authenticated' }
  
  await emitEvent({
    type: 'prompt.responded',
    userId: session.userId,
    payload: { promptId, value },
  })
  
  revalidatePath('/today')
  
  return { success: true, data: undefined }
}

export async function skipDailyPrompt(promptId: string): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Not authenticated' }
  
  await emitEvent({
    type: 'prompt.skipped',
    userId: session.userId,
    payload: { promptId },
  })
  
  revalidatePath('/today')
  
  return { success: true, data: undefined }
}
```

---

## Component Interfaces

### PromptCard

```tsx
interface PromptCardProps {
  prompt: {
    id: string
    text: string
    type: PromptType
    responseType: ResponseType
    responseProps?: ResponseProps
  }
  status: 'available' | 'responding' | 'completed' | 'skipped'
  response?: ResponseValue
  onRespond: () => void
  onSkip: () => void
  onView: () => void
}
```

### PromptResponseWidget

```tsx
interface PromptResponseWidgetProps {
  prompt: Prompt
  onSubmit: (value: ResponseValue) => Promise<void>
  onCancel: () => void
}
```

---

## Implementation Checklist

### Components
- [ ] `PromptCard` — Prompt display with actions
- [ ] `PromptResponseWidget` — Response input container
- [ ] `TextResponse` — Free text input
- [ ] `ScaleResponse` — Slider input
- [ ] `ChoiceResponse` — Radio/checkbox input

### Logic
- [ ] `selectDailyPrompt` — Selection algorithm
- [ ] `submitPromptResponse` — Server Action
- [ ] `skipDailyPrompt` — Server Action
- [ ] Targeting rule evaluation

### Integration
- [ ] Today hub prompt tile
- [ ] Response history view
- [ ] Prompt seeding script

