# UI/UX Enhancements Specification

> **Version:** 2.0  
> **Status:** Specification  
> **Created:** 2026-01-02

This document specifies visual design enhancements, interaction primitives, and delight systems that elevate the Dream Census experience.

---

## Overview

These enhancements focus on:

1. **Distinctive visual identity** - Dream Mist gradients, Skyline progress rings, Constellation views
2. **Ritual-enhancing interactions** - Breathing exercises, emotion wheels, soft rewards
3. **Trust-building UI** - Method cards, transparent provenance
4. **Non-toxic engagement** - Compassionate streaks, quiet micro-rewards

---

## Visual Design System

### Themes

Two primary themes tuned for sleep use:

| Theme | When Active | Characteristics |
|-------|-------------|-----------------|
| **Night Mode** | Sunset → Sunrise (default) | Deep, low-luminance, soft gradients |
| **Day Mode** | Sunrise → Sunset | Airy, bright, editorial |

Theme transitions:
- Gentle 400ms fade between themes
- Respects `prefers-reduced-motion`
- Auto-switch based on local time + user preference override

### Signature Visual Motifs

#### Dream Mist Gradient

A distinctive gradient that appears behind key moments (save success, weekly recap, insights unlock):

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

**Usage:**
- Dream save success screen
- Weekly recap header
- Insight unlock cards
- Onboarding completion

#### Skyline Progress Ring

A circular progress indicator used for streaks and section completion:

```tsx
interface ProgressRingProps {
  progress: number      // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  variant?: 'streak' | 'completion' | 'insight'
}
```

**Visual Spec:**

```
    ╭──────────╮
   ╱            ╲
  │      7       │    ← Current streak number
  │    days      │    ← Label
   ╲            ╱
    ╰──────────╯
       ▓▓▓░░░        ← Fill indicating progress to next milestone
```

**Sizes:**

| Size | Diameter | Stroke | Font |
|------|----------|--------|------|
| `sm` | 48px | 4px | 14px |
| `md` | 80px | 6px | 24px |
| `lg` | 120px | 8px | 36px |

#### Constellation Tag UI

Entities and themes visualized as connected stars:

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
- Nodes pulse gently based on recency
- Edge thickness indicates co-occurrence strength
- Hover reveals connection details
- Tap on node shows timeline of appearances

---

## New Interaction Primitives

### Floating Action Button (FAB)

A single primary action that adapts by time-of-day:

```tsx
interface FABProps {
  timeOfDay: 'morning' | 'day' | 'evening' | 'night'
  onPrimaryAction: () => void
  onLongPress: () => void
}

type FABAction = {
  morning: { label: 'Log Dream', icon: 'sunrise' }
  day: { label: 'New Entry', icon: 'plus' }
  evening: { label: 'Pre-sleep', icon: 'moon' }
  night: { label: 'Pre-sleep', icon: 'moon' }
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
- Fixed position, always visible
- 56px diameter, 16px from edges

### Emotion Wheel

A two-stage emotion selector: coarse category → fine emotion with intensity:

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

**Stage 1 - Coarse Selection (tap):**

```
        Joy
         ●
    ╱         ╲
Surprise       Fear
   ●             ●
    ╲         ╱
     Sad ● Anger
```

**Stage 2 - Fine Selection (swipe/drag):**

```
     Joy (selected)
    ╱    │    ╲
Elation  │  Contentment
    ╲    │    ╱
     ●───●───●
      Intensity: 75
```

**Interaction:**
1. Tap coarse emotion → wheel expands to show fine options
2. Drag radially to adjust intensity
3. Tap confirm or tap elsewhere to select

### Tag Pills (AI-Suggested)

Enhanced tag suggestions with gesture-based confirmation:

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
| AI Suggested | Soft highlight, dashed border |
| User Added | Solid fill, solid border |
| Accepted | Checkmark appears, transitions to solid |
| Dismissed | Fades out with swipe animation |

**Gestures:**
- **Tap** = Accept suggestion
- **Swipe away** = Dismiss
- **Long-press** = Edit (rename, merge, mark sensitive)
- **Undo** visible for 5 seconds after any action

### Method Card / Badge

Trust UI component that explains any insight or metric:

```tsx
interface MethodCardProps {
  title: string
  description: string
  timeRange: string
  dataSources: ('journal' | 'census' | 'prompts')[]
  sampleSize?: number
  confidence?: number      // 0-1
  ontologyVersion: string
  methodVersion: string
  lastUpdated: Date
}
```

**Trigger:** Small ℹ️ badge on any insight card

**Modal Content:**

```
┌─────────────────────────────────────┐
│  How "Your Emotions" is calculated  │
├─────────────────────────────────────┤
│                                     │
│  This shows the distribution of     │
│  emotions in your dreams over the   │
│  selected time period.              │
│                                     │
│  📊 Calculation                     │
│  Counts emotion tags and calculates │
│  percentage of total.               │
│                                     │
│  📥 Data Sources                    │
│  • Your manual selections           │
│  • AI-extracted emotions (if opted) │
│                                     │
│  🔒 Privacy                         │
│  This data never leaves your        │
│  account unless you enable Commons. │
│                                     │
│  ⚠️ Limitations                     │
│  Based on 23 dreams over 30 days.   │
│  AI extraction may miss nuances.    │
│                                     │
│  v1.2 · Updated Jan 2, 2026         │
└─────────────────────────────────────┘
```

### Breathing Guide

Animated breathing exercise for pre-sleep ritual:

```tsx
interface BreathingGuideProps {
  duration: 30 | 60 | 90 | 120  // seconds
  pattern?: BreathingPattern
  onComplete: () => void
  onSkip: () => void
}

type BreathingPattern = {
  inhale: number   // seconds
  hold: number     // seconds
  exhale: number   // seconds
}

// Default: 4-7-8 pattern
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
│         │   Breathe   │             │
│         │     in      │             │
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
- Holds at full size
- Scales down on exhale (1.3 → 1.0)
- Subtle color shift (deeper purple on exhale)
- Optional haptic feedback on phase transitions

---

## Reward & Engagement System

### Philosophy

Rewards should be:
- **Quiet** - No fireworks, no aggressive celebration
- **Meaningful** - Tied to real progress, not arbitrary
- **Compassionate** - No punishment for gaps

### Streak Types

Three separate streaks to avoid punishing users:

```tsx
interface UserStreaks {
  dreamRecall: {
    current: number
    longest: number
    lastEntry: Date
  }
  reflection: {
    current: number
    longest: number
    lastEntry: Date
  }
  return: {
    current: number     // Days returned after a gap
    gapsHealed: number  // Total gaps recovered from
  }
}
```

| Streak Type | What Counts | Tone |
|-------------|-------------|------|
| **Dream Recall** | Logging any dream (even fragment) | "Building memory" |
| **Reflection** | Answering any prompt | "Deepening practice" |
| **Return** | Coming back after 3+ day gap | "Welcome back" |

### Micro-Rewards

Small, satisfying moments that don't interrupt flow:

| Trigger | Reward |
|---------|--------|
| Save dream | Soft checkmark + "Captured" |
| Complete census section | Progress ring fills + "Section complete" |
| Tag a motif | Constellation node pulses briefly |
| Answer prompt | Reflection streak increments quietly |
| Return after gap | Warm "Welcome back" message |
| Unlock insight | New card fades in with Dream Mist glow |

### Progress Visualization

```
Today Card:

┌─────────────────────────────────────┐
│  Your Week                          │
│                                     │
│   ○  ○  ●  ●  ●  ○  ◐              │
│  Mon Tue Wed Thu Fri Sat Sun        │
│                                     │
│  5 day recall streak                │
│  ▓▓▓▓▓▓▓▓▓▓░░░░  Next: 7 days      │
└─────────────────────────────────────┘

Legend:
  ●  Dream logged
  ◐  Fragment logged
  ○  No entry
```

---

## Empty States & Micro-copy

### Smart Empty States

Every empty state should:
1. Acknowledge the state without judgment
2. Offer a gentle next action
3. Never make the user feel behind

**Examples:**

| Screen | Empty State |
|--------|-------------|
| Journal | "Your dream journal is ready. When you remember something—even a fragment—capture it here." |
| Today (no dreams) | "No dreams remembered? That's normal. You can log a feeling or a fragment." |
| Insights | "We're gathering patterns. After a few more dreams, you'll start seeing insights here." |
| Weather | "Not enough data yet. Dreams from 50+ dreamers create the collective weather." |

### Adaptive Tone

If nightmares are frequent (>30% of entries), the app adjusts:

- Warmer, gentler microcopy
- Grounding prompts offered after nightmare entries
- "Healing" tag category becomes more prominent
- Optional: "Would you like to talk to someone?" resources

---

## Animation Specifications

### Page Transitions

```css
/* Standard page transition */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms ease-out;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 150ms ease-in;
}
```

### Ritual Transitions (Morning/Night modes)

```css
/* Slower, more ambient for ritual contexts */
.ritual-enter {
  opacity: 0;
  transform: scale(0.98);
}

.ritual-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 400ms ease-out;
}
```

### Constellation Animations

```css
/* Node pulse on new connection */
@keyframes node-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 var(--constellation-pulse); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 8px transparent; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; }
}

/* Edge draw-in */
@keyframes edge-draw {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}
```

### Breathing Animation

```css
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
```

---

## Accessibility Requirements

All enhancements must meet:

- **WCAG 2.1 AA** minimum, **AAA** for night/morning modes
- **Reduced motion** variants for all animations
- **Screen reader** announcements for state changes
- **Keyboard navigation** for all interactions
- **Touch targets** ≥ 44px (48px in ritual modes)

### Specific Requirements

| Component | Accessibility |
|-----------|--------------|
| FAB | `aria-label` changes with time, announces long-press menu |
| Emotion Wheel | Keyboard navigable, announces selection |
| Constellation | Tab through nodes, edge relationships announced |
| Breathing Guide | Audio cues optional, phase announced |
| Progress Ring | `role="progressbar"` with value announcements |

---

## Implementation Priority

| Priority | Component | Phase |
|----------|-----------|-------|
| High | Method Card | Phase 1 (trust foundation) |
| High | FAB | Phase 1 (primary interaction) |
| High | Tag Pills (gestures) | Phase 2 (journal enhancement) |
| Medium | Progress Ring | Phase 2 (engagement) |
| Medium | Breathing Guide | Phase 3 (night mode) |
| Medium | Emotion Wheel | Phase 3 (morning mode) |
| Lower | Constellation View | Phase 5 (insights) |
| Lower | Dream Mist effects | Polish phase |

---

## CSS Variables (New)

Add to `globals.css`:

```css
:root {
  /* Signature gradients */
  --dream-mist: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  --dream-mist-glow: radial-gradient(circle at 50% 50%, rgba(149, 117, 205, 0.15), transparent 70%);
  
  /* Progress ring */
  --ring-track: #2d2d44;
  --ring-fill: var(--accent);
  --ring-glow: rgba(176, 147, 255, 0.3);
  
  /* Constellation */
  --constellation-node: #b093ff;
  --constellation-edge: rgba(176, 147, 255, 0.3);
  --constellation-pulse: rgba(176, 147, 255, 0.5);
  
  /* Breathing */
  --breathe-inhale: #9575cd;
  --breathe-hold: #7e57c2;
  --breathe-exhale: #5e35b1;
}
```

