# Onboarding Flow Specification

> **Version:** 2.0  
> **Status:** Specification  
> **Created:** 2026-01-02

The onboarding flow is a **4-screen journey** that feels like an invitation, not a setup chore. It establishes trust, sets daily rhythms, and leads to an immediate first action.

---

## Design Principles

1. **Minimal friction** - Only ask what's necessary
2. **Progressive disclosure** - Reveal complexity gradually
3. **Immediate value** - End with a real action, not more setup
4. **Trust first** - Privacy controls before data collection

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Completion rate | > 85% | Low drop-off through flow |
| Time to complete | 60-90 seconds | Quick but not rushed |
| Privacy tier selection | > 60% enable insights | Trust was established |
| First action completion | > 70% | Momentum into app |

---

## Flow Overview

```
Screen 1        Screen 2           Screen 3         Screen 4
Welcome    →    Privacy Ladder  →  Daily Rhythm  →  First Moment
(5 sec)         (15 sec)           (15 sec)         (choose action)
                                                         │
                    ┌────────────────┬─────────────────┐
                    ▼                ▼                 ▼
               Morning Demo    Census Start     Explore Prompts
```

---

## Screen 1: Welcome

**Purpose:** Calm value proposition, establish trust immediately

**Duration:** ~5 seconds interaction

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                          ✨                                  │
│                                                             │
│                   Dream Census                              │
│                                                             │
│          A ritual for understanding your dreams             │
│                                                             │
│                                                             │
│                                                             │
│          ┌─────────────────────────────────┐               │
│          │      Start Private              │               │
│          └─────────────────────────────────┘               │
│                                                             │
│          ┌─────────────────────────────────┐               │
│          │      Sign in for sync           │               │
│          └─────────────────────────────────┘               │
│                                                             │
│                                                             │
│                  How privacy works →                        │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interface

```tsx
interface WelcomeScreenProps {
  onStartPrivate: () => void
  onSignIn: () => void
  onLearnPrivacy: () => void  // Opens modal
}
```

### Elements

| Element | Behavior |
|---------|----------|
| Logo animation | Subtle constellation forming on load |
| "Start Private" (primary) | Creates local-only account, continues |
| "Sign in for sync" (secondary) | Opens auth flow, then continues |
| "How privacy works" (link) | Opens modal with privacy summary |

### Privacy Modal Content

```
┌─────────────────────────────────────────────────────────────┐
│  How Your Data Stays Safe                         [×]       │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  🔒 End-to-End Encrypted                                   │
│  Your dream journal is encrypted before it leaves your     │
│  device. We never see the content.                         │
│                                                             │
│  🎛 You Control Everything                                 │
│  Choose what's private, what's analyzed for insights,      │
│  and what contributes to research. Change anytime.         │
│                                                             │
│  🗑 Deletable Forever                                      │
│  Export or delete your data at any time. When you         │
│  delete, it's gone—no hidden copies.                       │
│                                                             │
│                     [Got it]                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Screen 2: Privacy Ladder

**Purpose:** Progressive consent with clear explanations

**Duration:** ~15 seconds interaction

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                                        │
│                                                             │
│                   Your privacy choices                      │
│                                                             │
│               You can change these anytime                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔒 Private Journal                    Always on ✓  │   │
│  │  Your dreams, encrypted and yours alone             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✨ Personal Insights                      [  ○──]   │   │
│  │  AI analyzes your dreams for patterns               │   │
│  │  What gets shared →                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🌍 Dream Weather                          [  ○──]   │   │
│  │  Contribute to collective patterns                  │   │
│  │  What gets shared →                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔬 Research Studies                       [  ○──]   │   │
│  │  Join time-limited research projects                │   │
│  │  What gets shared →                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                                             │
│                     [Continue →]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interface

```tsx
interface PrivacyLadderProps {
  initialSelections?: PrivacySelections
  onComplete: (selections: PrivacySelections) => void
  onBack: () => void
}

interface PrivacySelections {
  insights: boolean    // Personal insights tier
  commons: boolean     // Dream Weather tier
  studies: boolean     // Research studies tier
}

interface PrivacyTierCardProps {
  icon: ReactNode
  title: string
  description: string
  enabled: boolean
  locked?: boolean           // For dependent tiers
  alwaysOn?: boolean         // For base tier
  onToggle: (enabled: boolean) => void
  onLearnMore: () => void
}
```

### Tier Dependencies

```
Private Journal (always on)
        │
        ├── Personal Insights (optional)
        │           │
        │           └── Dream Weather (requires Insights)
        │                       │
        │                       └── Research Studies (requires Commons)
```

### "What Gets Shared" Modals

**Personal Insights:**
```
┌─────────────────────────────────────────────────────────────┐
│  What "Personal Insights" uses                    [×]       │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ✓ Your dream text (analyzed on our servers)               │
│  ✓ Emotions, themes, symbols extracted                     │
│  ✓ Patterns identified over time                           │
│                                                             │
│  ✗ Never shared with anyone                                │
│  ✗ Never used for advertising                              │
│  ✗ Deletable at any time                                   │
│                                                             │
│                     [Got it]                                │
└─────────────────────────────────────────────────────────────┘
```

**Dream Weather:**
```
┌─────────────────────────────────────────────────────────────┐
│  What "Dream Weather" shares                      [×]       │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ✓ Emotion distributions (not raw text)                    │
│  ✓ Theme frequencies (aggregated with others)              │
│  ✓ Sleep quality patterns                                  │
│                                                             │
│  Privacy safeguards:                                        │
│  • Minimum 50 dreamers per aggregate                       │
│  • Differential privacy noise added                        │
│  • No individual identification possible                   │
│                                                             │
│                     [Got it]                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Screen 3: Daily Rhythm

**Purpose:** Set up timing for reminders and mode switching

**Duration:** ~15 seconds interaction

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                                        │
│                                                             │
│                   Your daily rhythm                         │
│                                                             │
│         We'll adapt the app to your sleep schedule          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│                     🌙 Bedtime                              │
│                                                             │
│         [9:00 PM]  [10:00 PM]  [11:00 PM]                  │
│                                                             │
│         [12:00 AM]  [Custom...]                            │
│                                                             │
│                                                             │
│                     🌅 Wake time                            │
│                                                             │
│         [6:00 AM]  [7:00 AM]  [8:00 AM]                    │
│                                                             │
│         [9:00 AM]  [Custom...]                             │
│                                                             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Reminders                                                  │
│                                                             │
│  ☐ Pre-sleep check-in (30 min before bed)                  │
│  ☑ Morning capture (at wake time)                          │
│                                                             │
│                                                             │
│                     [Continue →]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interface

```tsx
interface DailyRhythmProps {
  initialSettings?: RhythmSettings
  onComplete: (settings: RhythmSettings) => void
  onBack: () => void
}

interface RhythmSettings {
  bedtime: string           // "22:00" format
  wakeTime: string          // "07:00" format
  reminders: {
    preSleep: boolean
    morning: boolean
  }
  timezone: string          // Auto-detected, editable
}

interface TimePickerProps {
  presets: string[]         // Common times
  value: string
  onChange: (time: string) => void
  onCustom: () => void      // Opens time picker modal
}
```

### Auto-Detected Values

- **Timezone:** Auto-detect from browser, show for confirmation
- **Defaults:** 10:30 PM bedtime, 7:00 AM wake (adjustable)
- Morning reminder: ON by default
- Pre-sleep reminder: OFF by default (opt-in)

---

## Screen 4: First Moment

**Purpose:** Immediate engagement, no dead end

**Duration:** User chooses, then action begins

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                                        │
│                                                             │
│                      You're all set                         │
│                                                             │
│                 What would you like to do?                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  🌅 Try Morning Capture                            │   │
│  │                                                     │   │
│  │  See how dream logging works                       │   │
│  │  30 seconds                                        │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  📋 Start the Census                               │   │
│  │                                                     │   │
│  │  Tell us about your sleep patterns                 │   │
│  │  ~3 minutes                                        │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  💭 Explore Prompts                                │   │
│  │                                                     │   │
│  │  Browse reflection questions                       │   │
│  │  No time limit                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                                             │
│                   Skip to Today →                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interface

```tsx
interface FirstMomentProps {
  onMorningDemo: () => void
  onCensusStart: () => void
  onExplorePrompts: () => void
  onSkipToToday: () => void
}

interface FirstMomentCardProps {
  icon: ReactNode
  title: string
  description: string
  duration: string
  onClick: () => void
}
```

### Post-Selection Behavior

| Choice | Destination |
|--------|-------------|
| Morning Demo | Morning Mode with "demo" flag (no real save) |
| Census Start | Census section 1 |
| Explore Prompts | Prompts tab with "getting started" filter |
| Skip to Today | Today tab |

---

## Completion Moment

After any first action OR skip, show a brief completion:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                          ✨                                  │
│                                                             │
│              [Constellation animation]                      │
│                                                             │
│                      You're set                             │
│                                                             │
│          Your dream journey is ready to begin               │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Animation:** A small constellation of 5-7 stars connects, then fades into the Today screen.

**Duration:** 2 seconds, auto-advances (no button needed)

---

## State Machine

```typescript
type OnboardingStep =
  | 'welcome'
  | 'privacy'
  | 'rhythm'
  | 'first_moment'
  | 'complete'

type OnboardingEvent =
  | { type: 'START_PRIVATE' }
  | { type: 'SIGN_IN' }
  | { type: 'PRIVACY_COMPLETE'; selections: PrivacySelections }
  | { type: 'RHYTHM_COMPLETE'; settings: RhythmSettings }
  | { type: 'FIRST_ACTION'; action: FirstAction }
  | { type: 'SKIP_TO_TODAY' }
  | { type: 'BACK' }

type FirstAction = 'morning_demo' | 'census_start' | 'explore_prompts'
```

### Flow Diagram

```
welcome ─┬─→ [Start Private] ────→ privacy ──→ rhythm ──→ first_moment ──→ complete
         │                              ↑         ↑             ↓
         └─→ [Sign In] ──→ auth ────────┘         │      ┌──────┴──────┐
                            │                      │      ▼      ▼      ▼
                            └──────────────────────┘   Morning Census Prompts
                                                          Demo   Start  Explore
```

---

## Data Persistence

After onboarding completes, store:

```typescript
interface OnboardingResult {
  completedAt: Date
  method: 'private' | 'signed_in'
  privacy: PrivacySelections
  rhythm: RhythmSettings
  firstAction: FirstAction | 'skipped'
}
```

This is saved to:
1. Local storage (for immediate use)
2. Database (when signed in / synced)

---

## Returning User Detection

If user has completed onboarding before:
- Skip directly to Today
- Show "Welcome back" instead of onboarding
- Offer "Review settings" link

Detection signals:
- Local storage flag
- Existing session cookie
- Database record (if signed in)

---

## Implementation Checklist

### Components
- [ ] `OnboardingFlow` — Container with state machine
- [ ] `WelcomeScreen` — Value prop + auth choice
- [ ] `PrivacyLadder` — Tiered consent toggles
- [ ] `PrivacyTierCard` — Individual tier card
- [ ] `DailyRhythm` — Time selection
- [ ] `TimePicker` — Preset + custom time picker
- [ ] `FirstMoment` — Action selection
- [ ] `FirstMomentCard` — Action card
- [ ] `OnboardingComplete` — Constellation animation

### Logic
- [ ] Onboarding state machine
- [ ] Privacy tier dependencies
- [ ] Reminder scheduling setup
- [ ] Timezone detection
- [ ] Returning user detection

### Testing
- [ ] Complete flow end-to-end
- [ ] Back navigation at each step
- [ ] Privacy tier interactions
- [ ] Time picker accessibility
- [ ] Screen reader flow
- [ ] Reduced motion (skip constellation animation)

