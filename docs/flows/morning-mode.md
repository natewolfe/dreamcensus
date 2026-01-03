# Morning Mode Flow Specification

> **Version:** 2.1  
> **Status:** Specification  
> **Updated:** 2026-01-02

Morning Mode is the flagship UX of The Dream Census—a **low-stimulation, voice-first capture experience** designed for the fragile moments after waking when dream recall is most accessible but cognitive load tolerance is lowest.

---

## Quick Facts First (Enhanced Flow)

The enhanced morning capture reorders the flow for **groggy cognition**—collecting metadata first while the user is deciding, then flowing into content capture:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Quick Facts │ ──► │   Capture   │ ──► │   Anchor    │ ──► │  Complete   │
│ (no typing) │     │ (voice/text)│     │   (tags)    │     │  (reward)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Why This Order?

1. **Quick facts require no typing** - Drowsy users can tap chips while deciding
2. **Metadata anchors memory** - Selecting emotions helps solidify recall
3. **Capture flows naturally** - After "priming," narrative comes easier
4. **Reward loop closes fast** - Micro-insight appears immediately after save

### Quick Facts Screen

```
┌─────────────────────────────────────────────────────────────┐
│  [×]                                                        │
│                                                             │
│                    Good morning                             │
│                                                             │
│               How much do you remember?                     │
│                                                             │
│     [nothing] [fragments] [a scene] [full story]           │
│                                                             │
│                                                             │
│               How did it feel?                              │
│                                                             │
│           [Emotion Wheel - tap to expand]                   │
│                                                             │
│                                                             │
│     [☐ Lucid]     [☐ Nightmare]     [☐ Recurring]          │
│                                                             │
│                                                             │
│                     [Continue →]                            │
│                                                             │
│               I only have a feeling →                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Micro-Insight Reward

After save, show a **contextual micro-insight**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Dream Captured ✨                        │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │  💡 You've mentioned "water" 3 times this     │      │
│     │     month. Tap to see the pattern.            │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│                [Continue to Today]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Insight types:**
- **Pattern detection:** "Flying dreams often follow stressful days for you"
- **Frequency:** "This is your 5th dream about [place] this month"
- **Tip:** "Dreams with strong emotions often connect to recent events"

The tone is **observational, not interpretive** - never "this means X."

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Time to "saved" | ≤ 90 seconds | Dream recall fades quickly |
| Tap count (minimal) | ≤ 4 taps | Reduce friction |
| Voice capture usage | > 50% | Hands-free is ideal |
| Micro-structure completion | > 80% | Enables insights |
| Session completion rate | > 70% | Capture > abandon |

---

## Design Constraints

### Visual

```css
.morning-mode {
  /* Ultra-low stimulation */
  --background: #080a12;
  --foreground: #c5cae9;
  --foreground-muted: #7986cb;
  --accent: #9575cd;
  
  /* Larger touch targets for drowsy users */
  --button-min-height: 56px;
  --tap-target-min: 48px;
  
  /* Relaxed typography */
  --font-size-question: 1.5rem;
  --line-height: 1.6;
}
```

### Interaction

- **One primary action per screen**
- **Every step is skippable**
- **Auto-save on every change**
- **No "are you sure?" confirmations**
- **No loading spinners (use skeleton states)**

### Accessibility

- Minimum 48×48px touch targets
- WCAG AAA contrast (7:1)
- Voice input always optional
- Full keyboard navigation
- Screen reader optimized

---

## State Machine

```typescript
type MorningStep =
  | 'start'       // Method selection
  | 'voice'       // Voice recording
  | 'text'        // Text input
  | 'structure'   // Emotions, vividness, lucidity
  | 'tags'        // Quick tagging
  | 'close'       // Title + waking life link
  | 'complete'    // Success + dream card

type MorningEvent =
  | { type: 'SELECT_VOICE' }
  | { type: 'SELECT_TEXT' }
  | { type: 'SELECT_EMOTION_ONLY' }
  | { type: 'CAPTURE_COMPLETE'; transcript: string }
  | { type: 'STRUCTURE_COMPLETE'; data: MicroStructure }
  | { type: 'TAGS_COMPLETE'; tags: string[] }
  | { type: 'CLOSE_COMPLETE'; title?: string; wakingLife?: string }
  | { type: 'SKIP' }
  | { type: 'SAVE_AND_EXIT' }
```

### Flow Diagram

```
                        ┌─────────────┐
                        │    START    │
                        │  (Welcome)  │
                        └──────┬──────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
    ┌───────────┐        ┌───────────┐        ┌───────────┐
    │   VOICE   │        │   TEXT    │        │  EMOTION  │
    │  (Record) │        │  (Type)   │        │   ONLY    │
    └─────┬─────┘        └─────┬─────┘        └─────┬─────┘
          │                    │                    │
          └──────────┬─────────┘                    │
                     │                              │
                     ▼                              │
             ┌───────────────┐                      │
             │   STRUCTURE   │◄─────────────────────┘
             │ (Micro-data)  │
             └───────┬───────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
    ┌───────────┐ ┌────────┐ ┌──────────┐
    │   TAGS    │ │ CLOSE  │ │ SAVE &   │
    │ (Optional)│ │(Ritual)│ │  EXIT    │
    └─────┬─────┘ └────┬───┘ └──────────┘
          │            │
          └──────┬─────┘
                 │
                 ▼
         ┌───────────────┐
         │   COMPLETE    │
         │ (Dream Card)  │
         └───────────────┘
```

---

## Screen Specifications

### Screen 1: Start

**Purpose:** Gentle entry, capture method selection

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                    Good morning                             │
│                                                             │
│               Anything you remember?                        │
│                                                             │
│                                                             │
│     ┌─────────────────────────────────────────────┐        │
│     │                                             │        │
│     │              🎤 Record                      │        │
│     │                                             │        │
│     │         Tap and speak your dream            │        │
│     │                                             │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
│     ┌─────────────────────────────────────────────┐        │
│     │              ✏️ Type                        │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
│                                                             │
│               I only have a feeling →                       │
│                                                             │
│                                                             │
│                        Skip →                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface MorningStartProps {
  onRecord: () => void
  onType: () => void
  onEmotionOnly: () => void
  onSkip: () => void
}
```

**Time-aware greeting:**
- 5am-12pm: "Good morning"
- 12pm-5pm: "Good day"
- 5pm-9pm: "Good evening"
- 9pm-5am: "Sweet dreams"

---

### Screen 2a: Voice Capture

**Purpose:** Hands-free dream dictation

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Cancel]                                     [Done ✓]      │
│                                                             │
│                      1:23 / 5:00                            │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │                                               │      │
│     │      ~~~~~~~~ WAVEFORM VISUALIZATION ~~~~~    │      │
│     │                                               │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │                                               │      │
│     │  "I was in my grandmother's house, but it    │      │
│     │   wasn't quite right. The hallway was        │      │
│     │   longer than it should be..."               │      │
│     │                                               │      │
│     │                               [Edit ✏️]       │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│              Fragments are perfect.                         │
│                                                             │
│                   [🔴 Recording...]                         │
│                                                             │
│               Tap when done speaking                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface VoiceCaptureProps {
  onComplete: (transcript: string, audioBlob?: Blob) => void
  onCancel: () => void
  maxDuration?: number  // seconds, default 300
}

type VoiceCaptureState =
  | 'idle'
  | 'permission'
  | 'ready'
  | 'recording'
  | 'processing'
  | 'complete'
  | 'error'
```

**Technical Implementation:**

```typescript
// Primary: Web Speech API
const recognition = new webkitSpeechRecognition()
recognition.continuous = true
recognition.interimResults = true
recognition.lang = navigator.language

// Fallback: Whisper API
async function transcribeWithWhisper(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-1')
  
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })
  
  return response.json()
}
```

---

### Screen 2b: Text Capture

**Purpose:** Typed dream entry

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Cancel]                                     [Done ✓]      │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │                                               │      │
│     │  Write whatever you remember...              │      │
│     │                                               │      │
│     │  _                                           │      │
│     │                                               │      │
│     │                                               │      │
│     │                                               │      │
│     │                                               │      │
│     │                                               │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│              Fragments are perfect.                         │
│                                                             │
│                                         Auto-saved ✓        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface TextCaptureProps {
  initialValue?: string
  onComplete: (text: string) => void
  onCancel: () => void
}
```

**Behavior:**
- Auto-save every 2 seconds (debounced)
- Show "Auto-saved ✓" indicator
- Placeholder fades on focus
- No character limit (but warn at 10k)

---

### Screen 3: Micro-Structure

**Purpose:** Quick metadata capture

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                     [Save & Exit]      │
│                                                             │
│               How did this dream feel?                      │
│                                                             │
│     [anxious] [awe✓] [tender] [joy✓] [fear] [calm]         │
│     [confused] [sad] [curious] [+more]                      │
│                                                             │
│                                                             │
│               How vivid was it?                             │
│                                                             │
│     Faint  ○─────────●─────────○  Crystal clear            │
│                                                             │
│                                                             │
│               Were you aware it was a dream?                │
│                                                             │
│              [No]     [Maybe]     [Yes]                     │
│                                                             │
│                                                             │
│                        [Continue →]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface MicroStructureData {
  emotions: string[]
  vividness: number      // 0-100
  lucidity: 'no' | 'maybe' | 'yes' | null
}

interface MicroStructureProps {
  initialData?: Partial<MicroStructureData>
  onComplete: (data: MicroStructureData) => void
  onSaveAndExit: (data: MicroStructureData) => void
  onBack: () => void
}
```

---

### Screen 4: Fast Tags (Optional)

**Purpose:** AI-suggested + user lexicon tags

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                          [Skip →]      │
│                                                             │
│           Add tags to find this dream later                 │
│                                                             │
│     Suggested:                                              │
│     [+ grandmother] [+ house] [+ hallway] [+ childhood]     │
│                                                             │
│     Your lexicon:                                           │
│     [+ the red door] [+ recurring places]                   │
│                                                             │
│                                                             │
│     [+ Add new tag...]                                      │
│                                                             │
│                        [Continue →]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface FastTagsProps {
  suggestions: string[]      // AI-suggested from narrative
  userLexicon: string[]     // User's custom tags
  selectedTags: string[]
  onComplete: (tags: string[]) => void
  onSkip: () => void
  onBack: () => void
}
```

---

### Screen 5: Close Ritual (Optional)

**Purpose:** Meaning-making through title and waking-life connection

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                          [Skip →]      │
│                                                             │
│               If this dream had a title...                  │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │  The Endless Hallway                          │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│                                                             │
│           Anything from waking life connected?              │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │  Been thinking about visiting grandma...      │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│                                                             │
│                      [Save Dream →]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface CloseRitualProps {
  suggestedTitle?: string    // AI-generated suggestion
  onComplete: (data: { title?: string; wakingLife?: string }) => void
  onSkip: () => void
  onBack: () => void
}
```

---

### Screen 6: Complete

**Purpose:** Confirmation and gentle reward

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ✨                                  │
│                                                             │
│                    Dream Captured                           │
│                                                             │
│          ┌─────────────────────────────────┐                │
│          │                                 │                │
│          │    "The Endless Hallway"        │                │
│          │                                 │                │
│          │    Jan 2, 2026 · 7:32 AM        │                │
│          │    [joy] [curious] · vivid      │                │
│          │                                 │                │
│          └─────────────────────────────────┘                │
│                                                             │
│          ┌─────────────────────────────────┐                │
│          │  💡 Dreams with vivid emotions   │                │
│          │  often reflect recent concerns   │                │
│          └─────────────────────────────────┘                │
│                                                             │
│     [Continue to Today]        [See Insights]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Interface:**

```tsx
interface DreamCompleteProps {
  dream: {
    id: string
    title?: string
    capturedAt: Date
    emotions: string[]
    vividness?: number
  }
  insight?: {
    text: string
    type: 'pattern' | 'fact' | 'tip'
  }
  onContinue: () => void
  onViewInsights: () => void
}
```

---

## Data Model

### Morning Draft

```typescript
interface MorningDraft {
  id: string
  step: MorningStep
  
  // Captured content
  narrative?: string
  audioUrl?: string
  
  // Structure
  emotions: string[]
  vividness: number
  lucidity: 'no' | 'maybe' | 'yes' | null
  
  // Tags
  tags: string[]
  
  // Close ritual
  title?: string
  wakingLifeLink?: string
  
  // Timestamps
  startedAt: Date
  lastUpdatedAt: Date
}
```

### Persistence

```typescript
// Save draft to IndexedDB on every change
async function saveMorningDraft(draft: MorningDraft) {
  await offlineStore.put('drafts', draft)
  
  // Sync to server if online
  if (navigator.onLine) {
    await syncDraft(draft)
  }
}

// Final save creates DreamEntry
async function completeMorningCapture(draft: MorningDraft) {
  // 1. Encrypt narrative
  const { ciphertext, iv } = await encrypt(draft.narrative, userKey)
  
  // 2. Create entry via Server Action
  const result = await createDreamEntry({
    ciphertext,
    iv,
    keyVersion: currentKeyVersion,
    emotions: draft.emotions,
    vividness: draft.vividness,
    lucidity: draft.lucidity,
    tags: draft.tags,
    title: draft.title,
    wakingLifeLink: draft.wakingLifeLink,
    capturedAt: draft.startedAt,
  })
  
  // 3. Clean up draft
  await offlineStore.delete('drafts', draft.id)
  
  return result
}
```

---

## Implementation Checklist

### Components
- [ ] `MorningMode` — Container with state machine
- [ ] `MorningStart` — Entry screen
- [ ] `VoiceCapture` — Voice recording + transcription
- [ ] `TextCapture` — Text input with auto-save
- [ ] `MicroStructure` — Emotion/vividness/lucidity
- [ ] `EmotionChips` — Multi-select emotion picker
- [ ] `VividnessSlider` — 0-100 slider with labels
- [ ] `LucidityToggle` — Three-way toggle
- [ ] `FastTags` — Tag suggestions + custom
- [ ] `CloseRitual` — Title + waking life
- [ ] `DreamComplete` — Completion display
- [ ] `WaveformVisualizer` — Audio visualization

### Infrastructure
- [ ] Web Speech API integration
- [ ] Whisper API fallback route
- [ ] IndexedDB draft storage
- [ ] Morning Mode route (`/today?mode=morning`)

### Testing
- [ ] Voice capture across browsers
- [ ] Offline capture + sync
- [ ] Auto-save reliability
- [ ] Touch target accessibility
- [ ] Screen reader flow
- [ ] Reduced motion support

