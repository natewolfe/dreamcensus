# Component Specifications

> **Version:** 2.1  
> **Status:** Specification  
> **Updated:** 2026-01-02

This document specifies all UI components for The Dream Census v3.

---

## Component Hierarchy

```
components/
├── ui/                    # Design system primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Spinner.tsx
│   ├── Icon.tsx
│   ├── Input.tsx
│   ├── Slider.tsx
│   ├── Chips.tsx
│   ├── Toggle.tsx
│   ├── ProgressRing.tsx      # NEW: Skyline progress ring
│   ├── EmotionWheel.tsx      # NEW: Two-stage emotion selector
│   ├── TagPill.tsx           # NEW: AI-suggested tag with gestures
│   ├── FAB.tsx               # NEW: Time-aware floating action button
│   └── index.ts
│
├── layout/                # App structure
│   ├── AppShell.tsx
│   ├── BottomNav.tsx
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── PageHeader.tsx
│   └── index.ts
│
├── morning/               # Morning capture flow
│   ├── MorningMode.tsx
│   ├── MorningStart.tsx
│   ├── QuickFacts.tsx        # NEW: Quick facts first screen
│   ├── VoiceCapture.tsx
│   ├── TextCapture.tsx
│   ├── MicroStructure.tsx
│   ├── EmotionChips.tsx
│   ├── VividnessSlider.tsx
│   ├── LucidityToggle.tsx
│   ├── FastTags.tsx
│   ├── CloseRitual.tsx
│   ├── DreamComplete.tsx
│   ├── MicroInsight.tsx      # NEW: Contextual insight card
│   └── index.ts
│
├── night/                 # Night mode ritual
│   ├── NightMode.tsx
│   ├── NightWelcome.tsx
│   ├── DayReflection.tsx
│   ├── BreathingGuide.tsx    # NEW: Animated breathing exercise
│   ├── DreamIntention.tsx
│   ├── TomorrowSetup.tsx
│   ├── NightComplete.tsx
│   └── index.ts
│
├── onboarding/            # NEW: Onboarding flow
│   ├── OnboardingFlow.tsx
│   ├── WelcomeScreen.tsx
│   ├── PrivacyLadder.tsx
│   ├── PrivacyTierCard.tsx
│   ├── DailyRhythm.tsx
│   ├── TimePicker.tsx
│   ├── FirstMoment.tsx
│   ├── FirstMomentCard.tsx
│   ├── OnboardingComplete.tsx
│   └── index.ts
│
├── journal/               # Dream journal
│   ├── JournalList.tsx
│   ├── DreamCard.tsx
│   ├── DreamDetail.tsx
│   ├── DreamEditor.tsx
│   ├── TagInput.tsx
│   └── index.ts
│
├── prompts/               # Daily prompts
│   ├── PromptCard.tsx
│   ├── PromptResponse.tsx
│   ├── TextResponse.tsx
│   ├── ScaleResponse.tsx
│   ├── ChoiceResponse.tsx
│   └── index.ts
│
├── census/                # Census questionnaire
│   ├── CensusOverview.tsx
│   ├── SectionCard.tsx
│   ├── SectionRunner.tsx
│   ├── QuestionRenderer.tsx
│   ├── StatementQuestion.tsx
│   ├── ChoiceQuestion.tsx
│   ├── ScaleQuestion.tsx
│   ├── OpinionSlider.tsx
│   └── index.ts
│
├── weather/               # Weather dashboard
│   ├── WeatherDashboard.tsx
│   ├── PersonalWeather.tsx
│   ├── CollectiveWeather.tsx
│   ├── EmotionChart.tsx
│   ├── SymbolCloud.tsx
│   ├── TrendLine.tsx
│   ├── MethodCard.tsx
│   └── index.ts
│
├── insights/              # NEW: Insights & visualizations
│   ├── ConstellationView.tsx # Entities as connected stars
│   ├── WeeklyRecap.tsx
│   ├── PatternCard.tsx
│   └── index.ts
│
├── consent/               # Privacy settings
│   ├── ConsentSettings.tsx
│   ├── TierToggle.tsx
│   ├── ReceiptHistory.tsx
│   └── index.ts
│
└── common/                # Shared utilities
    ├── ErrorBoundary.tsx
    ├── OfflineBanner.tsx
    ├── SyncStatus.tsx
    ├── DreamMist.tsx         # NEW: Signature gradient overlay
    └── index.ts
```

---

## UI Primitives

### Button

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  children: ReactNode
  onClick?: () => void
}
```

**Variants:**

| Variant | Use Case |
|---------|----------|
| `primary` | Main CTAs (Save Dream, Continue) |
| `secondary` | Secondary actions (Skip, Cancel) |
| `ghost` | Tertiary actions, minimal UI |
| `danger` | Destructive actions (Delete) |

**Sizes:**

| Size | Height | Font | Padding |
|------|--------|------|---------|
| `sm` | 32px | 14px | 12px 16px |
| `md` | 40px | 16px | 12px 20px |
| `lg` | 56px | 18px | 16px 24px |

**States:**

```css
/* Base */
.button { transition: all 150ms ease; }

/* Hover */
.button:hover { filter: brightness(1.1); }

/* Active */
.button:active { transform: scale(0.98); }

/* Disabled */
.button:disabled { opacity: 0.5; cursor: not-allowed; }

/* Loading */
.button[data-loading] { pointer-events: none; }
```

---

### Card

```tsx
interface CardProps {
  variant?: 'elevated' | 'outlined' | 'ghost' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: 'div' | 'button' | 'article'
  children: ReactNode
}
```

**Variants:**

| Variant | Background | Border | Shadow |
|---------|------------|--------|--------|
| `elevated` | --card-bg | --border | 0 4px 12px |
| `outlined` | transparent | --border | none |
| `ghost` | --card-bg/50 | none | none |
| `interactive` | --card-bg | --border | hover: 0 8px 24px |

---

### Slider

```tsx
interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  leftLabel?: string
  rightLabel?: string
  showValue?: boolean
  hapticFeedback?: boolean
}
```

**Visual Spec:**

```
┌─────────────────────────────────────────────────────────────┐
│ Faint            ○────────●────────○          Crystal clear │
│                           │                                 │
│                          65                                 │
└─────────────────────────────────────────────────────────────┘
```

- Track height: 4px
- Thumb size: 24px
- Active thumb: 28px (scale on drag)
- Touch target: 48px

---

### Chips

```tsx
interface ChipsProps<T extends string> {
  options: T[]
  selected: T[]
  onChange: (selected: T[]) => void
  max?: number
  renderOption?: (option: T, isSelected: boolean) => ReactNode
  expandable?: boolean
  expandThreshold?: number
}
```

**Visual Spec:**

```
┌─────────────────────────────────────────────────────────────┐
│ [anxious] [awe✓] [tender] [joy✓] [fear] [calm]             │
│ [confused] [sad] [+more]                                    │
└─────────────────────────────────────────────────────────────┘
```

- Chip height: 36px
- Chip padding: 12px 16px
- Gap: 8px
- Border radius: 18px (pill)

---

### Toggle

```tsx
interface ToggleProps<T extends string> {
  options: T[]
  value: T | null
  onChange: (value: T) => void
  labels?: Record<T, string>
  size?: 'sm' | 'md' | 'lg'
}
```

**Three-way toggle (Lucidity):**

```
┌─────────────────────────────────────────────────────────────┐
│                 [No]  [Maybe]  [Yes]                        │
│                        ────────                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Modal

```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  closeOnOverlayClick?: boolean
  children: ReactNode
  footer?: ReactNode
}
```

**Sizes:**

| Size | Width | Mobile |
|------|-------|--------|
| `sm` | 400px | 90vw |
| `md` | 560px | 95vw |
| `lg` | 720px | 100vw |
| `full` | 100vw | 100vw |

---

## Enhanced UI Primitives

### ProgressRing (Skyline)

Circular progress indicator for streaks and section completion.

```tsx
interface ProgressRingProps {
  progress: number          // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  variant?: 'streak' | 'completion' | 'insight'
  children?: ReactNode      // Center content (e.g., streak number)
}
```

**Sizes:**

| Size | Diameter | Stroke | Center Font |
|------|----------|--------|-------------|
| `sm` | 48px | 4px | 14px |
| `md` | 80px | 6px | 24px |
| `lg` | 120px | 8px | 36px |

**Visual Spec:**

```
    ╭──────────╮
   ╱  ▓▓▓▓▓░░░ ╲     ← Circular progress track
  │      7       │    ← Center value
  │    days      │    ← Label
   ╲            ╱
    ╰──────────╯
```

---

### EmotionWheel

Two-stage emotion selector: coarse category → fine emotion with intensity.

```tsx
interface EmotionWheelProps {
  value: EmotionSelection | null
  onChange: (selection: EmotionSelection) => void
  mode?: 'coarse' | 'fine'  // Start coarse, transition to fine
}

interface EmotionSelection {
  primary: string      // Coarse category: joy, fear, sadness, etc.
  secondary?: string   // Fine emotion: elation, contentment, etc.
  intensity: number    // 0-100
}
```

**Interaction:**
1. Tap coarse emotion → wheel expands to show fine options
2. Drag radially to adjust intensity
3. Tap confirm or tap elsewhere to select

**Coarse Categories:**
- Joy, Fear, Sadness, Anger, Surprise, Disgust, Curiosity, Peace

**Visual Spec:**

```
        Joy                       Joy (selected)
         ●                       ╱    │    ╲
    ╱         ╲              Elation  │  Contentment
Surprise       Fear             ╲    │    ╱
   ●             ●               ●───●───●
    ╲         ╱                   Intensity: 75
     Sad ● Anger
```

---

### TagPill

Enhanced tag with AI suggestion state and gesture-based interaction.

```tsx
interface TagPillProps {
  label: string
  source: 'user' | 'ai_suggested' | 'ai_auto'
  confidence?: number  // 0-1, for AI suggestions
  onAccept: () => void
  onDismiss: () => void
  onEdit: () => void
}
```

**Visual States:**

| State | Appearance |
|-------|------------|
| AI Suggested | Soft highlight, dashed border, sparkle icon |
| User Added | Solid fill, solid border |
| Accepted | Checkmark appears, transitions to solid |
| Dismissed | Fades out with swipe animation |

**Gestures:**
- **Tap** = Accept suggestion
- **Swipe away** = Dismiss
- **Long-press** = Edit menu (rename, merge, mark sensitive)
- **Undo** visible for 5 seconds after any action

---

### FAB (Floating Action Button)

Time-aware primary action button.

```tsx
interface FABProps {
  timeOfDay: 'morning' | 'day' | 'evening' | 'night'
  onPrimaryAction: () => void
  onLongPress: () => void
}

const FAB_ACTIONS: Record<TimeOfDay, { label: string; icon: string }> = {
  morning: { label: 'Log Dream', icon: 'sunrise' },
  day: { label: 'New Entry', icon: 'plus' },
  evening: { label: 'Pre-sleep', icon: 'moon' },
  night: { label: 'Pre-sleep', icon: 'moon' },
}
```

**Long-press Quick Menu:**

```
┌─────────────────────────────────────┐
│  ○ Dream entry (voice)             │
│  ○ Dream entry (text)              │
│  ○ Quick check-in                  │
│  ○ Prompt reflection               │
│  ○ Record fragment (10s)           │
└─────────────────────────────────────┘
```

**Positioning:**
- Bottom-right on mobile (above bottom nav)
- 56px diameter
- 16px from edges
- 8px above BottomNav

---

### BreathingGuide

Animated breathing exercise for pre-sleep ritual.

```tsx
interface BreathingGuideProps {
  duration?: 30 | 60 | 90 | 120  // seconds
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
```

**Visual:**

```
┌─────────────────────────────────────┐
│                                     │
│           ╭─────────╮               │
│          ╱           ╲              │
│         │   Breathe   │  ← Circle scales on breath
│         │     in      │
│          ╲           ╱              │
│           ╰─────────╯               │
│                                     │
│            ●●●●○○○○○               │
│            4 of 8 breaths           │
│                                     │
│           [Skip]                    │
│                                     │
└─────────────────────────────────────┘
```

**Animation:**
- Circle scales up on inhale (1.0 → 1.3)
- Holds at full size during hold phase
- Scales down on exhale (1.3 → 1.0)
- Subtle color shift (deeper purple on exhale)
- Optional haptic feedback on phase transitions

---

### DreamMist

Signature gradient overlay for celebratory moments.

```tsx
interface DreamMistProps {
  variant?: 'background' | 'glow' | 'overlay'
  animate?: boolean
  intensity?: 'subtle' | 'medium' | 'strong'
}
```

**Usage contexts:**
- Dream save success screen
- Weekly recap header
- Insight unlock cards
- Onboarding completion

**CSS:**

```css
.dream-mist {
  background: linear-gradient(
    135deg,
    #1a1a2e 0%,
    #16213e 50%,
    #0f3460 100%
  );
}

.dream-mist-glow {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(149, 117, 205, 0.15),
    transparent 70%
  );
}
```

---

### ConstellationView

Visual representation of dream entities as connected nodes.

```tsx
interface ConstellationNode {
  id: string
  label: string
  type: 'person' | 'place' | 'symbol' | 'theme' | 'emotion'
  frequency: number       // How often it appears
  lastSeen: Date
  connections: string[]   // IDs of related nodes
}

interface ConstellationViewProps {
  nodes: ConstellationNode[]
  timeRange: '7d' | '30d' | '90d' | 'all'
  onNodeSelect: (id: string) => void
  onConnectionSelect: (fromId: string, toId: string) => void
  layout?: 'force' | 'radial' | 'timeline'
}
```

**Visual Characteristics:**
- Nodes pulse gently based on recency (more recent = brighter)
- Edge thickness indicates co-occurrence strength
- Hover reveals connection details
- Tap on node shows timeline of appearances
- Node size scales with frequency

**Colors by Type:**

| Type | Color |
|------|-------|
| person | var(--constellation-person) |
| place | var(--constellation-place) |
| symbol | var(--constellation-symbol) |
| theme | var(--constellation-theme) |
| emotion | var(--constellation-emotion) |

---

## Morning Mode Components

### MorningMode

The container component managing the morning capture state machine.

```tsx
type MorningStep =
  | 'start'
  | 'voice'
  | 'text'
  | 'structure'
  | 'tags'
  | 'close'
  | 'complete'

interface MorningModeProps {
  initialStep?: MorningStep
  onComplete: (dreamId: string) => void
  onCancel: () => void
}
```

**State Machine:**

```
start ─┬─→ voice ───→ structure ─┬─→ tags ──→ close ──→ complete
       ├─→ text ────→ structure ─┤
       └─→ structure ────────────┘
                                 │
                                 └─→ complete (quick save)
```

---

### VoiceCapture

```tsx
interface VoiceCaptureProps {
  onComplete: (transcript: string, audioBlob?: Blob) => void
  onCancel: () => void
  maxDuration?: number // seconds
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

**Visual Spec:**

```
┌─────────────────────────────────────────────────────────────┐
│ [Cancel]                                      [Done ✓]      │
│                                                             │
│                      1:23 / 5:00                            │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │  ~~~~~~~~ WAVEFORM VISUALIZATION ~~~~~~~~~~   │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │  "I was in my grandmother's house..."         │      │
│     │                                    [Edit ✏️]   │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│                   [🔴 Recording...]                         │
│                Tap to pause · Double-tap to stop            │
└─────────────────────────────────────────────────────────────┘
```

---

### EmotionChips

```tsx
const CORE_EMOTIONS = [
  'anxious', 'awe', 'tender', 'shame', 'joy', 
  'fear', 'calm', 'confused'
] as const

const EXPANDED_EMOTIONS = [
  'anger', 'sadness', 'surprise', 'disgust', 'love',
  'longing', 'curiosity', 'peace', 'dread', 'wonder',
  'grief', 'relief'
] as const

interface EmotionChipsProps {
  selected: string[]
  onChange: (selected: string[]) => void
  showExpanded?: boolean
  max?: number // default 5
}
```

---

### VividnessSlider

```tsx
interface VividnessSliderProps {
  value: number
  onChange: (value: number) => void
  leftLabel?: string  // default: "Faint"
  rightLabel?: string // default: "Crystal clear"
}
```

**Behavior:**
- Range: 0-100
- Step: 1
- Haptic feedback at 0, 50, 100
- Shows numeric value on drag

---

### LucidityToggle

```tsx
interface LucidityToggleProps {
  value: 'no' | 'maybe' | 'yes' | null
  onChange: (value: 'no' | 'maybe' | 'yes') => void
}
```

---

## Journal Components

### DreamCard

Preview card for journal list.

```tsx
interface DreamCardProps {
  dream: {
    id: string
    title?: string
    capturedAt: Date
    emotions: string[]
    vividness?: number
    hasNarrative: boolean
  }
  onClick?: () => void
  variant?: 'compact' | 'expanded'
}
```

**Compact Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│  Jan 2                        "The Endless Hallway"         │
│  7:32 AM                                                    │
│                                                             │
│  [joy] [curious]                           ●●●●○ vivid      │
└─────────────────────────────────────────────────────────────┘
```

**Expanded Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│  "The Endless Hallway"                           Jan 2, '26 │
│                                                   7:32 AM   │
│  ─────────────────────────────────────────────────────────  │
│  I was in my grandmother's house, but the hallway was       │
│  longer than it should be. Every door I opened led to...    │
│                                                             │
│  [joy] [curious] [awe]                     ●●●●○ vivid      │
│                                            lucid: maybe     │
└─────────────────────────────────────────────────────────────┘
```

---

### TagInput

```tsx
interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[] // From taxonomy + user lexicon
  placeholder?: string
  max?: number
}
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│ [grandmother ×] [house ×] [hallway ×]                       │
│                                                             │
│ [+ Add tag...]                                              │
│                                                             │
│ Suggested: childhood, memory, family                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Census Components

### SectionCard

```tsx
interface SectionCardProps {
  section: {
    id: string
    name: string
    description?: string
    icon?: string
    questionCount: number
    completedCount: number
    estimatedTime: number
  }
  isLocked?: boolean
  onClick?: () => void
}
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│  🌙 Sleep Patterns                           3/8 complete   │
│                                                             │
│  Questions about your typical sleep habits                  │
│  and how they relate to dreaming.                          │
│                                                             │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ~4 min remaining│
│                                                             │
│                                         [Continue →]        │
└─────────────────────────────────────────────────────────────┘
```

---

### OpinionSlider

Bidirectional scale for Likert-style questions.

```tsx
interface OpinionSliderProps {
  value: number | null
  onChange: (value: number) => void
  leftLabel: string   // "Strongly disagree"
  rightLabel: string  // "Strongly agree"
  steps?: number      // default: 5
}
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│ Strongly                                         Strongly   │
│ disagree    ○     ○     ●     ○     ○            agree     │
└─────────────────────────────────────────────────────────────┘
```

---

## Weather Components

### EmotionChart

Distribution visualization.

```tsx
interface EmotionChartProps {
  data: Array<{
    emotion: string
    percentage: number
    count?: number
  }>
  period?: string
  showLegend?: boolean
}
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Emotions (7 days)                   │
│                                                             │
│  joy       ████████████████████░░░░░░░░░░░░░░  38%         │
│  curious   ███████████████░░░░░░░░░░░░░░░░░░░  28%         │
│  calm      █████████░░░░░░░░░░░░░░░░░░░░░░░░░  16%         │
│  awe       ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  12%         │
│  anxious   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   6%         │
│                                                             │
│                        [ⓘ How is this calculated?]         │
└─────────────────────────────────────────────────────────────┘
```

---

### MethodCard

Transparency component linked to metrics.

```tsx
interface MethodCardProps {
  title: string
  version: string
  lastUpdated: string
  sections: {
    description: string
    howCalculated: string
    dataSources: string[]
    privacySafeguards: string[]
    limitations: string[]
  }
}
```

**Visual (Modal):**

```
┌─────────────────────────────────────────────────────────────┐
│  How "Your Emotions" is calculated              [×]         │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  This chart shows the distribution of emotions you've       │
│  reported or that were detected in your dream journals      │
│  over the selected time period.                             │
│                                                             │
│  📊 Calculation                                             │
│  We count each emotion tag associated with your dreams      │
│  and calculate the percentage of the total.                 │
│                                                             │
│  📥 Data Sources                                            │
│  • Your manually-selected emotions during capture           │
│  • AI-extracted emotions (if Insights tier enabled)         │
│                                                             │
│  🔒 Privacy                                                 │
│  This data never leaves your account. It is not shared      │
│  unless you enable the Research Commons tier.               │
│                                                             │
│  ⚠️ Limitations                                             │
│  AI extraction may miss nuanced emotions. Your manual       │
│  selections are always prioritized.                         │
│                                                             │
│  v1.0 · Last updated Jan 2026                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Consent Components

### ConsentSettings

```tsx
interface ConsentSettingsProps {
  currentTiers: {
    insights: boolean
    commons: boolean
  }
  onUpdate: (tier: 'insights' | 'commons', granted: boolean) => Promise<void>
}
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│  Privacy & Data                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ○───────────●───────────○───────────○                      │
│  Private    Insights    Commons    Studies                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ✅ Personal Sanctuary (always on)                          │
│     Your journal is encrypted and private.                  │
│                                                             │
│  🔘 Insights Tier                                [Enabled]  │
│     Allow processing for personal insights.                 │
│     [Learn more]                                            │
│                                                             │
│  ⚪ Research Commons                            [Disabled]  │
│     Contribute to collective understanding.                 │
│     Requires Insights tier.                                 │
│     [Learn more]                                            │
│                                                             │
│  [View consent history →]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Components

### OfflineBanner

```tsx
interface OfflineBannerProps {
  isOnline: boolean
  pendingCount: number
  onSync?: () => void
}
```

**Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ You're offline · 3 dreams waiting to sync     [Sync Now] │
└─────────────────────────────────────────────────────────────┘
```

---

### ErrorBoundary

```tsx
interface ErrorBoundaryProps {
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  children: ReactNode
}
```

---

## Animation Specifications

### Page Transitions

```tsx
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const pageTransition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier
}
```

### Morning Mode Transitions

```tsx
const morningStepVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
}
```

### Micro-interactions

| Element | Trigger | Animation |
|---------|---------|-----------|
| Button | Tap | scale(0.98) → scale(1) |
| Chip | Select | backgroundColor + scale(1.05) |
| Card | Tap | scale(0.99) + boxShadow |
| Slider thumb | Drag start | scale(1.2) |
| Modal | Open | opacity + y(20px→0) |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Requirements

### Touch Targets

- Minimum: 44×44px
- Preferred: 48×48px
- Morning Mode: 56×56px (drowsy users)

### Focus Management

```tsx
// Focus trap in modals
useFocusTrap(modalRef, isOpen)

// Focus restoration
useFocusRestoration(triggerRef, isOpen)

// Skip links
<SkipLink href="#main-content">Skip to content</SkipLink>
```

### ARIA

```tsx
// Live regions for voice capture
<div role="status" aria-live="polite" aria-atomic="true">
  {transcript}
</div>

// Slider labels
<input
  type="range"
  aria-label="Vividness"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={value}
  aria-valuetext={`${value}% vivid`}
/>
```

### Color Contrast

- Text on background: minimum 4.5:1 (WCAG AA)
- Morning Mode: minimum 7:1 (WCAG AAA)
- Interactive elements: minimum 3:1

