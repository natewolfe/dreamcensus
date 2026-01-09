# Night Mode Flow Specification

> **Version:** 2.1  
> **Status:** Specification  
> **Updated:** 2026-01-02

Night Mode is the **pre-sleep check-in ritual** that helps users prepare for sleep and set intentions for dreaming. It's a gentle, calming experience designed to be used in the 30-60 minutes before bed.

---

## Enhanced Ritual: Breathing Exercise

The pre-sleep experience can optionally include a **guided breathing exercise** between reflection and intention, creating a physiological transition to rest.

### Flow with Breathing

```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│ Welcome │─►│ Reflect  │─►│ Breathe   │─►│ Intention │─►│ Tomorrow │─►│ Complete │
│         │   │ (mood)   │   │ (optional)│   │ (set)     │   │ (setup)  │   │ (sleep)  │
└─────────┘   └──────────┘   └───────────┘   └───────────┘   └──────────┘   └──────────┘
```

### Breathing Screen

```
┌─────────────────────────────────────────────────────────────┐
│                                             [Skip →]        │
│                                                             │
│                                                             │
│                                                             │
│                      Take a moment                          │
│                                                             │
│                 ╭─────────────────╮                        │
│                ╱                   ╲                       │
│               │                     │                      │
│               │     Breathe in      │                      │
│               │                     │                      │
│                ╲                   ╱                       │
│                 ╰─────────────────╯                        │
│                                                             │
│                      ●●●○○○○○                              │
│                    3 of 8 breaths                          │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Breathing Component

```tsx
interface BreathingGuideProps {
  duration?: 30 | 60 | 90 | 120  // seconds, default 60
  pattern?: BreathingPattern
  onComplete: () => void
  onSkip: () => void
}

type BreathingPattern = {
  inhale: number   // seconds
  hold: number     // seconds  
  exhale: number   // seconds
}

// Default: 4-7-8 pattern (calming)
const DEFAULT_PATTERN: BreathingPattern = {
  inhale: 4,
  hold: 7,
  exhale: 8,
}

// Alternative: Box breathing (grounding)
const BOX_PATTERN: BreathingPattern = {
  inhale: 4,
  hold: 4,
  exhale: 4,
}
```

### Animation Specifications

```css
/* Breathing circle animation */
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

.breathing-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    var(--accent) 0%,
    transparent 70%
  );
}
```

### Accessibility

- **Reduced motion:** Replace animation with progress bar and text
- **Screen reader:** Announce each phase ("Breathe in", "Hold", "Breathe out")
- **Optional audio:** Soft chime on phase transitions (off by default)
- **Haptic feedback:** Gentle vibration on phase change (if enabled)

---

## Philosophy

### Ritual over Feature

Night Mode isn't about data collection—it's about creating a mindful transition from waking to sleeping. The data we capture is a byproduct of a meaningful ritual.

### Design Principles

- **Calming**: Even more subdued than Morning Mode
- **Brief**: 2-3 minutes maximum
- **Optional depth**: Every step can be skipped
- **Sleep-friendly**: No blue light, no stimulation
- **Future-oriented**: Sets up tomorrow's capture

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Night check-in rate | > 30% | Ritual adoption |
| Intention-set rate | > 50% (of check-ins) | Core feature |
| Time spent | 1-3 min | Ritual feels complete but not burdensome |
| Morning recall improvement | +15% | Validates the practice |
| Bedtime consistency | ±30 min | Habit formation |

---

## State Machine

```typescript
type NightStep =
  | 'welcome'      // Gentle entry
  | 'day_reflect'  // Optional: How was today?
  | 'breathing'    // Optional: Breathing exercise
  | 'intention'    // Dream intention setting
  | 'tomorrow'     // Morning capture reminder
  | 'complete'     // Sleep well

type NightEvent =
  | { type: 'START' }
  | { type: 'SKIP_REFLECTION' }
  | { type: 'SUBMIT_REFLECTION'; mood: string }
  | { type: 'BREATHING_COMPLETE' }
  | { type: 'SKIP_BREATHING' }
  | { type: 'SET_INTENTION'; intention: string }
  | { type: 'SKIP_INTENTION' }
  | { type: 'SET_REMINDER'; time: string }
  | { type: 'SKIP_REMINDER' }
  | { type: 'COMPLETE' }
```

---

## Visual Design

### Color Palette

```css
.night-mode {
  /* Ultra-dark, warm palette */
  --background: #050508;
  --foreground: #9fa8da;
  --foreground-muted: #5c6bc0;
  --accent: #7e57c2;
  
  /* Even larger touch targets */
  --button-min-height: 64px;
  
  /* Sleepy typography */
  --font-size-question: 1.25rem;
  --font-weight: 300;
  --line-height: 1.8;
}
```

### Animation

- Slower transitions (400ms instead of 200ms)
- Gentle fades only (no sliding or scaling)
- Subtle breathing animations for indicators

---

## Screen Specifications

### Screen 1: Welcome

**Purpose:** Gentle transition into night ritual

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                          🌙                                  │
│                                                             │
│                   Good evening                              │
│                                                             │
│            Ready to wind down for sleep?                    │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                     [Begin →]                               │
│                                                             │
│                                                             │
│                   Not tonight →                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Time-aware greeting:**
- 6pm-9pm: "Good evening"
- 9pm-12am: "Getting sleepy?"
- 12am-3am: "Late night?"
- 3am-6am: "Rest well"

---

### Screen 2: Day Reflection (Optional)

**Purpose:** Gentle processing of the day

```
┌─────────────────────────────────────────────────────────────┐
│  [Skip →]                                                   │
│                                                             │
│                                                             │
│                                                             │
│                   How was today?                            │
│                                                             │
│                                                             │
│     [😔]     [😐]     [🙂]     [😊]     [✨]               │
│    rough   okay    good    great  amazing                   │
│                                                             │
│                                                             │
│                                                             │
│    Anything on your mind?                                   │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │  (optional)                                   │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│                                                             │
│                     [Continue →]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface DayReflectionProps {
  onComplete: (data: { mood: string; notes?: string }) => void
  onSkip: () => void
}
```

---

### Screen 3: Dream Intention

**Purpose:** Set an intention for tonight's dreams

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                          [Skip →]      │
│                                                             │
│                                                             │
│                                                             │
│              Set an intention for tonight                   │
│                                                             │
│            What would you like to dream about?              │
│                                                             │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │                                               │      │
│     │  I want to visit...                          │      │
│     │  _                                           │      │
│     │                                               │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│                                                             │
│     Suggestions:                                            │
│     [A peaceful place] [Someone I miss] [Flying]           │
│                                                             │
│                                                             │
│                     [Set Intention →]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface DreamIntentionProps {
  suggestions?: string[]
  previousIntentions?: string[]
  onComplete: (intention: string) => void
  onSkip: () => void
  onBack: () => void
}
```

**Suggestion Categories:**
- Places: "A peaceful place", "Somewhere from childhood", "An imaginary world"
- People: "Someone I miss", "A mentor figure", "Future self"
- Experiences: "Flying", "Creating something", "Solving a problem"
- Emotions: "Feeling calm", "Experiencing joy", "Finding clarity"

---

### Screen 4: Tomorrow Setup

**Purpose:** Prime for morning capture

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                          [Skip →]      │
│                                                             │
│                                                             │
│                                                             │
│              When will you capture tomorrow?                │
│                                                             │
│         We'll send a gentle reminder when you wake.         │
│                                                             │
│                                                             │
│              [6:00 AM]  [7:00 AM]  [8:00 AM]                │
│                                                             │
│              [9:00 AM]  [Custom...]                         │
│                                                             │
│                                                             │
│     ☑ Remind me to capture when I wake                     │
│                                                             │
│                                                             │
│                                                             │
│                     [Continue →]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface TomorrowSetupProps {
  defaultWakeTime?: string
  onComplete: (data: { wakeTime: string; enableReminder: boolean }) => void
  onSkip: () => void
  onBack: () => void
}
```

---

### Screen 5: Complete

**Purpose:** Gentle sendoff to sleep

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                          ✨                                  │
│                                                             │
│                    Sleep well                               │
│                                                             │
│                                                             │
│          Your intention: "Visit a peaceful place"          │
│                                                             │
│          Reminder set for 7:00 AM                          │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│     ─────────────────────────────────────────────────────  │
│                                                             │
│     💡 Tip: Keep your phone nearby but screen-down.        │
│        Dream memories fade quickly after waking.           │
│                                                             │
│                                                             │
│                      [Close]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface NightCompleteProps {
  intention?: string
  reminderTime?: string
  tip?: string
  onClose: () => void
}
```

---

## Data Model

### Night Check-in

```typescript
interface NightCheckIn {
  id: string
  userId: string
  
  // Day reflection (optional)
  mood?: 'rough' | 'okay' | 'good' | 'great' | 'amazing'
  dayNotes?: string
  
  // Dream intention (optional)
  intention?: string
  
  // Tomorrow setup (optional)
  plannedWakeTime?: string
  reminderEnabled?: boolean
  
  // Timestamps
  checkedInAt: Date
  date: string // YYYY-MM-DD
}
```

### Database Schema Addition

```prisma
model NightCheckIn {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Day reflection
  mood      String?  // "rough" | "okay" | "good" | "great" | "amazing"
  dayNotes  String?
  
  // Dream intention
  intention String?
  
  // Tomorrow setup
  plannedWakeTime String?
  reminderEnabled Boolean @default(false)
  
  // Metadata
  checkedInAt DateTime @default(now())
  date        String   // YYYY-MM-DD for easy lookup
  
  @@unique([userId, date])
  @@index([userId])
}
```

---

## Notification System

### Morning Reminder

```typescript
// Scheduled notification
interface MorningReminder {
  userId: string
  scheduledFor: Date
  title: "Ready to capture?"
  body: "You set an intention last night: '{{intention}}'"
}

// Notification scheduling
async function scheduleMorningReminder(userId: string, wakeTime: string, date: string) {
  const scheduledFor = parseISO(`${date}T${wakeTime}`)
  
  await db.scheduledNotification.create({
    data: {
      userId,
      type: 'morning_reminder',
      scheduledFor,
      payload: { date },
    },
  })
}
```

### Push Notification Flow

```
Night Check-in → Schedule Notification → Worker sends at wake time
                                              │
                                              ▼
                                    User taps notification
                                              │
                                              ▼
                                    Opens Morning Mode
```

---

## Server Actions

```typescript
// app/(app)/today/actions.ts
'use server'

export async function saveNightCheckIn(data: NightCheckInInput): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Not authenticated' }
  
  const today = format(new Date(), 'yyyy-MM-dd')
  
  await emitEvent({
    type: 'night.checked_in',
    userId: session.userId,
    payload: { ...data, date: today },
  })
  
  // Schedule morning reminder if enabled
  if (data.plannedWakeTime && data.reminderEnabled) {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
    await scheduleMorningReminder(session.userId, data.plannedWakeTime, tomorrow)
  }
  
  revalidatePath('/today')
  
  return { success: true, data: undefined }
}

export async function getTonightCheckIn(): Promise<NightCheckIn | null> {
  const session = await getSession()
  if (!session) return null
  
  const today = format(new Date(), 'yyyy-MM-dd')
  
  return db.nightCheckIn.findUnique({
    where: {
      userId_date: {
        userId: session.userId,
        date: today,
      },
    },
  })
}
```

---

## Research Value

### Data Points Collected

| Data Point | Research Use |
|------------|--------------|
| `mood` | Correlation: day mood → dream content |
| `dayNotes` | Qualitative context |
| `intention` | Intention → dream content correlation |
| `plannedWakeTime` | Sleep timing patterns |
| `checkedInAt` | Bedtime consistency |

### Aggregate Insights

```typescript
// Example research query
const intentionEffectiveness = await db.$queryRaw`
  SELECT 
    n.intention IS NOT NULL as had_intention,
    AVG(d.vividness) as avg_vividness,
    COUNT(d.id) as dream_count
  FROM NightCheckIn n
  LEFT JOIN DreamEntry d ON d.userId = n.userId 
    AND DATE(d.capturedAt) = DATE(n.checkedInAt) + INTERVAL '1 day'
  GROUP BY had_intention
`
```

---

## Component Interfaces

### NightMode Container

```tsx
interface NightModeProps {
  onComplete: () => void
  onCancel: () => void
}

export function NightMode({ onComplete, onCancel }: NightModeProps) {
  const [step, setStep] = useState<NightStep>('welcome')
  const [data, setData] = useState<Partial<NightCheckIn>>({})
  
  // State machine transitions
  // ...
}
```

### DayReflection

```tsx
interface DayReflectionProps {
  onComplete: (data: { mood: string; notes?: string }) => void
  onSkip: () => void
}
```

### DreamIntention

```tsx
interface DreamIntentionProps {
  suggestions?: string[]
  previousIntentions?: string[]
  onComplete: (intention: string) => void
  onSkip: () => void
  onBack: () => void
}
```

### TomorrowSetup

```tsx
interface TomorrowSetupProps {
  defaultWakeTime?: string
  onComplete: (data: { wakeTime: string; enableReminder: boolean }) => void
  onSkip: () => void
  onBack: () => void
}
```

---

## Implementation Checklist

### Components
- [ ] `NightMode` — Container with state machine
- [ ] `NightWelcome` — Entry screen
- [ ] `DayReflection` — Mood + notes
- [ ] `MoodSelector` — Emoji mood picker
- [ ] `BreathingGuide` — Animated breathing exercise
- [ ] `DreamIntention` — Intention setting
- [ ] `IntentionSuggestions` — Suggestion chips
- [ ] `TomorrowSetup` — Wake time + reminder
- [ ] `TimeSelector` — Time picker
- [ ] `NightComplete` — Sleep well screen

### Logic
- [ ] `saveNightCheckIn` — Server Action
- [ ] `scheduleMorningReminder` — Notification scheduling
- [ ] Intention suggestion algorithm
- [ ] Time-aware greetings
- [ ] Breathing animation state machine

### Integration
- [ ] Today hub night tile
- [ ] Push notification service
- [ ] Morning Mode intention display
- [ ] Research correlation queries

### Accessibility
- [ ] Breathing reduced motion variant
- [ ] Screen reader phase announcements
- [ ] Optional haptic feedback setting

