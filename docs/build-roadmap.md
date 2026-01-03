# Build Roadmap

> **Version:** 2.1  
> **Status:** Specification  
> **Updated:** 2026-01-02

This document outlines the phase-by-phase implementation plan for The Dream Census v3, built from scratch.

**Related documentation:**
- [`ux-enhancements.md`](./ux-enhancements.md) — Visual design system, interaction primitives, rewards
- [`flows/onboarding.md`](./flows/onboarding.md) — 4-screen onboarding flow specification
- [`flows/morning-mode.md`](./flows/morning-mode.md) — Morning capture flow (updated with Quick Facts First)
- [`flows/night-mode.md`](./flows/night-mode.md) — Night ritual flow (updated with Breathing Guide)

---

## Overview

```
Week 1    Week 2    Week 3    Week 4    Week 5    Week 6    Week 7    Week 8
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│Foundation│ Morning │ Journal │ Prompts │ Census  │ Weather │ Privacy │ Polish  │
│  Setup  │  Mode   │ + Events│ + Night │ System  │ + Insigh│ Ladder  │ + Launch│
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
     ▲         ▲         ▲         ▲         ▲         ▲         ▲         ▲
     │         │         │         │         │         │         │         │
  Alpha 0   Alpha 1   Alpha 2   Alpha 3   Beta 1    Beta 2    RC 1      v3.0
```

---

## Phase 0: Foundation (Week 1)

### Objectives
- Project scaffold with all tooling
- Database schema and migrations
- Auth system with key generation
- Design tokens and UI primitives

### Deliverables

#### 0.1 Project Setup
- [ ] Initialize Next.js 15+ project with App Router
- [ ] Configure TypeScript (strict mode)
- [ ] Set up Prisma with PostgreSQL
- [ ] Configure Tailwind CSS 4
- [ ] Set up Vitest + Testing Library
- [ ] Configure ESLint + Prettier
- [ ] Create `.env.example` and environment setup

#### 0.2 Database
- [ ] Create complete schema (from `schema.prisma.md`)
- [ ] Run initial migration
- [ ] Seed reference data (emotions, symbols, themes)
- [ ] Set up Prisma Studio for development

#### 0.3 Auth Foundation
- [ ] Implement session model (cookie-based)
- [ ] Create `getSession()` and `ensureSession()` utilities
- [ ] Set up key derivation utilities
- [ ] Create basic onboarding flow (no encryption yet)

#### 0.4 Design System Foundation
- [ ] Port CSS variables and design tokens
- [ ] Create `globals.css` with theme system
- [ ] Add signature visual CSS variables:
  - [ ] Dream Mist gradients
  - [ ] Progress ring colors
  - [ ] Constellation colors
  - [ ] Breathing guide colors
- [ ] Build UI primitives:
  - [ ] `Button` (variants: primary, secondary, ghost)
  - [ ] `Card` (variants: elevated, outlined, ghost)
  - [ ] `Modal`
  - [ ] `Spinner`
  - [ ] `Icon` (using Lucide or similar)
  - [ ] `ProgressRing` (Skyline circular indicator)
  - [ ] `FAB` (time-aware floating action button)
- [ ] Set up font loading (display + body fonts)

#### 0.5 App Shell
- [ ] Create root layout with theme provider
  - [ ] Provide: Dawn, Day, Dusk, and Night themes
- [ ] Build navigation components:
  - [ ] `BottomNav` (mobile: Today, Journal, Census, Weather)
  - [ ] `Sidebar` (desktop)
  - [ ] `TopBar` (contextual)
  - [ ] `FAB` (positioned above BottomNav)
- [ ] Define route structure with groups:
  - [ ] `(app)/` — Authenticated routes
  - [ ] `(auth)/` — Auth flows
  - [ ] `(public)/` — Landing, etc.

#### 0.6 Onboarding Flow
See [`flows/onboarding.md`](./flows/onboarding.md) for full specification.
- [ ] Build onboarding components:
  - [ ] `OnboardingFlow` — Container with state machine
  - [ ] `WelcomeScreen` — Value prop + auth choice
  - [ ] `PrivacyLadder` — 4-tier consent selection
  - [ ] `PrivacyTierCard` — Individual tier card with toggle
  - [ ] `DailyRhythm` — Bedtime/wake time picker
  - [ ] `TimePicker` — Preset + custom time selector
  - [ ] `FirstMoment` — Action selection cards
  - [ ] `OnboardingComplete` — Constellation animation
- [ ] Implement onboarding state machine
- [ ] Create returning user detection

### Exit Criteria
- [ ] App runs with `pnpm dev`
- [ ] Database migrations succeed
- [ ] UI primitives render correctly
- [ ] Navigation works on mobile and desktop
- [ ] FAB shows time-aware action
- [ ] Dynamic themes based on time of day
- [ ] Basic session creation works
- [ ] Onboarding flow completes end-to-end

---

## Phase 1: Morning Mode (Week 2)

### Objectives
- Complete morning capture flow
- Voice recording + transcription
- Quick Facts First approach
- Auto-save and draft system

See [`flows/morning-mode.md`](./flows/morning-mode.md) for full specification.

### Deliverables

#### 1.1 Morning Mode Container
- [ ] Create `/today` route as daily hub
- [ ] Build `MorningMode` state machine component
- [ ] Implement step transitions with ritual animations
- [ ] Create morning-specific color palette
- [ ] Implement Quick Facts First flow variant:
  - [ ] `QuickFacts` — Pre-capture metadata screen
  - [ ] Recall level selector (nothing → full story)
  - [ ] Quick flag chips (Lucid, Nightmare, Recurring)

#### 1.2 Voice Capture
- [ ] Implement Web Speech API integration
- [ ] Build `VoiceCapture` component:
  - [ ] Hold-to-record interaction
  - [ ] Real-time waveform visualization
  - [ ] Live transcription display
- [ ] Set up Whisper API fallback
- [ ] Handle browser compatibility

#### 1.3 Text Capture
- [ ] Build `TextCapture` component
- [ ] Implement auto-save with debounce
- [ ] Add draft status indicator
- [ ] Create placeholder states

#### 1.4 Micro-Structure
- [ ] Build `EmotionChips` component
- [ ] Build `EmotionWheel` component (two-stage selector)
- [ ] Build `VividnessSlider` component
- [ ] Build `LucidityToggle` component
- [ ] Create "I only have a feeling" shortcut path

#### 1.5 Dream Save
- [ ] Create `createDreamEntry` Server Action
- [ ] Build completion screen with dream card
- [ ] Implement Dream Mist success animation
- [ ] Build `MicroInsight` component for contextual insights
- [ ] Implement pattern/frequency/tip insight types

### Exit Criteria
- [ ] Can capture dream via text
- [ ] Can capture dream via voice
- [ ] Emotions, vividness, lucidity are saved
- [ ] Dreams appear in database
- [ ] Auto-save works reliably
- [ ] Micro-insight appears on save (when applicable)

---

## Phase 2: Journal + Events (Week 3)

### Objectives
- Event sourcing layer
- Journal list and detail views
- Basic offline draft storage
- Tag system

### Deliverables

#### 2.1 Event System
- [ ] Create `emitEvent()` utility
- [ ] Implement event handlers:
  - [ ] `journal.entry.created`
  - [ ] `journal.entry.updated`
  - [ ] `journal.entry.deleted`
- [ ] Build event playback for debugging

#### 2.2 Journal List
- [ ] Create `/journal` route
- [ ] Build `JournalList` component with:
  - [ ] Dream cards with preview
  - [ ] Date grouping
  - [ ] Search input
- [ ] Implement infinite scroll or pagination

#### 2.3 Dream Detail
- [ ] Create `/journal/[id]` route
- [ ] Build `DreamDetail` component
- [ ] Add edit mode
- [ ] Implement delete with confirmation

#### 2.4 Tags
- [ ] Build `TagInput` component
- [ ] Build `TagPill` component with gesture support:
  - [ ] Tap to accept AI suggestion
  - [ ] Swipe to dismiss
  - [ ] Long-press for edit menu
  - [ ] Undo action (5s visibility)
- [ ] Create tag autocomplete from taxonomy
- [ ] Implement custom tag creation
- [ ] Add tag filtering to journal list

#### 2.5 Offline Foundation
- [ ] Set up IndexedDB wrapper (`idb` or similar)
- [ ] Implement draft storage
- [ ] Create sync queue structure
- [ ] Add offline indicator component

### Exit Criteria
- [ ] Events are logged for all journal actions
- [ ] Journal list displays all dreams
- [ ] Can search and filter dreams
- [ ] Tags work end-to-end
- [ ] Drafts persist across browser refresh

---

## Phase 3: Prompts + Night Mode (Week 4)

### Objectives
- Daily prompt system
- Night check-in flow with breathing exercise
- Prompt response types
- Today hub integration

See [`flows/night-mode.md`](./flows/night-mode.md) for full specification.

### Deliverables

#### 3.1 Prompt Engine
- [ ] Create prompt selection algorithm
- [ ] Build prompt scheduling logic
- [ ] Implement targeting rules

#### 3.2 Prompt Components
- [ ] Build `PromptCard` component
- [ ] Create response type renderers:
  - [ ] `TextResponse`
  - [ ] `ScaleResponse`
  - [ ] `ChoiceResponse`
  - [ ] `MultiChoiceResponse`
- [ ] Build `PromptResponseWidget`

#### 3.3 Day Loop Integration
- [ ] Add prompt tile to `/today` hub
- [ ] Implement "one prompt per day" logic
- [ ] Create "skip" and "later" actions

#### 3.4 Night Mode
- [ ] Create Night check-in flow:
  - [ ] Day reflection (mood + notes)
  - [ ] Breathing guide (optional, 4-7-8 pattern)
  - [ ] Dream intention setting
  - [ ] Tomorrow prep (optional)
- [ ] Build `NightMode` state machine component
- [ ] Build `BreathingGuide` component:
  - [ ] Animated breathing circle
  - [ ] Phase indicators (inhale/hold/exhale)
  - [ ] Reduced motion variant
  - [ ] Optional haptic feedback
- [ ] Add evening notification scheduling

#### 3.5 Today Hub Completion
- [ ] Build complete `/today` layout:
  - [ ] Morning tile (capture CTA)
  - [ ] Day tile (prompt)
  - [ ] Night tile (check-in)
  - [ ] Mini weather preview
- [ ] Add time-aware greetings

### Exit Criteria
- [ ] Daily prompt appears and can be answered
- [ ] Night check-in flow works
- [ ] Today hub shows all three loops
- [ ] Prompts don't repeat inappropriately

---

## Phase 4: Census System (Week 5)

### Objectives
- Census instrument structure
- Question type renderers
- Section-based navigation
- Progress tracking

### Deliverables

#### 4.1 Census Structure
- [ ] Seed census instruments and sections
- [ ] Create census question content
- [ ] Build section fetching utilities

#### 4.2 Question Renderers
- [ ] Build question type components:
  - [ ] `StatementQuestion`
  - [ ] `SingleChoiceQuestion`
  - [ ] `MultiChoiceQuestion`
  - [ ] `ScaleQuestion`
  - [ ] `TextQuestion`
  - [ ] `NumberQuestion`
- [ ] Create `OpinionSlider` for scale questions

#### 4.3 Census Flow
- [ ] Create `/census` overview page
- [ ] Build `/census/[section]` section runner
- [ ] Implement answer persistence
- [ ] Create section completion celebrations

#### 4.4 Progress System
- [ ] Build `CensusProgress` tracking
- [ ] Create progress visualization:
  - [ ] Section cards with completion
  - [ ] Overall progress bar
- [ ] Add "Continue where you left off"

### Exit Criteria
- [ ] Can browse census sections
- [ ] Can answer all question types
- [ ] Answers persist correctly
- [ ] Progress is tracked accurately

---

## Phase 5: Weather + Insights (Week 6)

### Objectives
- Personal weather dashboard
- Collective weather (foundations)
- Method cards for transparency
- Basic insights

### Deliverables

#### 5.1 Personal Weather
- [ ] Build weather computation logic
- [ ] Create `PersonalWeather` components:
  - [ ] Emotion distribution chart
  - [ ] Symbol frequency
  - [ ] Lucidity trend
  - [ ] Capture streak

#### 5.2 Weather Dashboard
- [ ] Create `/weather` route
- [ ] Build dashboard layout:
  - [ ] Personal weather section
  - [ ] Collective weather preview
- [ ] Add time period selector

#### 5.3 Collective Weather (Foundation)
- [ ] Create aggregate computation jobs
- [ ] Build collective weather components:
  - [ ] Emotion distribution (collective)
  - [ ] Regional patterns (placeholder)
- [ ] Implement sample size display

#### 5.4 Method Cards
- [ ] Build `MethodCard` component
- [ ] Create method card content:
  - [ ] Emotion distribution methodology
  - [ ] Sample size explanation
- [ ] Link method cards to metrics

#### 5.5 Insights
- [ ] Create `/insights` route (as a sub-tab or modal from Weather)
- [ ] Build insight cards:
  - [ ] Pattern detection results
  - [ ] Personal trends
  - [ ] Comparison to collective
- [ ] Build `ConstellationView` component:
  - [ ] Force-directed graph layout
  - [ ] Node types (person, place, symbol, theme, emotion)
  - [ ] Edge thickness by co-occurrence
  - [ ] Node pulse animation by recency
  - [ ] Time range selector (7d, 30d, 90d, all)

### Exit Criteria
- [ ] Personal weather displays correctly
- [ ] Collective weather shows with sample N
- [ ] Method cards are accessible
- [ ] Basic insights appear
- [ ] Constellation view visualizes entities

---

## Phase 6: Privacy Ladder (Week 7)

### Objectives
- Complete consent system
- E2E encryption
- Data export
- Account deletion

### Deliverables

#### 6.1 Consent UI
- [ ] Build `ConsentSettings` component
- [ ] Create tier toggles:
  - [ ] Insights tier
  - [ ] Commons tier
- [ ] Implement consent receipts
- [ ] Create receipt history view

#### 6.2 E2E Encryption
- [ ] Implement client-side encryption:
  - [ ] Key derivation from passphrase
  - [ ] AES-GCM encryption/decryption
- [ ] Update dream capture to encrypt
- [ ] Update journal to decrypt
- [ ] Handle key not available state

#### 6.3 Key Management
- [ ] Build key setup flow:
  - [ ] Passphrase creation
  - [ ] Recovery phrase generation
- [ ] Create key recovery flow
- [ ] Handle device-bound keys

#### 6.4 Data Rights
- [ ] Implement data export:
  - [ ] Generate export job
  - [ ] Create download flow
  - [ ] Include all user data
- [ ] Implement account deletion:
  - [ ] Confirmation flow
  - [ ] Cascade deletion
  - [ ] Revoke all sessions

#### 6.5 Consent Enforcement
- [ ] Guard data processing by consent:
  - [ ] AI extraction only with Insights consent
  - [ ] Aggregation only with Commons consent
- [ ] Implement consent change handlers

### Exit Criteria
- [ ] Can opt in/out of each tier
- [ ] Dreams are encrypted end-to-end
- [ ] Can export all data
- [ ] Can delete account completely
- [ ] Consent receipts are generated

---

## Phase 7: Polish + Launch (Week 8)

### Objectives
- PWA setup
- Performance optimization
- Accessibility audit
- Production deployment

### Deliverables

#### 7.1 PWA
- [ ] Create `manifest.json`
- [ ] Build service worker:
  - [ ] Cache app shell
  - [ ] Offline fallback page
- [ ] Implement install prompt
- [ ] Add home screen icons

#### 7.2 Visual Polish
See [`ux-enhancements.md`](./ux-enhancements.md) for specifications.
- [ ] Build `DreamMist` gradient component
- [ ] Implement micro-rewards system:
  - [ ] Streak tracking (recall, reflection, return)
  - [ ] Soft success moments
  - [ ] Progress ring animations
- [ ] Add empty state messages (compassionate tone)
- [ ] Implement adaptive tone for nightmare frequency

#### 7.3 Performance
- [ ] Optimize images and assets
- [ ] Implement code splitting
- [ ] Add loading skeletons
- [ ] Measure and optimize LCP, INP, CLS

#### 7.4 Accessibility
- [ ] Run automated a11y audit
- [ ] Fix all critical issues
- [ ] Test with screen reader
- [ ] Verify keyboard navigation
- [ ] Add reduced motion support

#### 7.5 Error Handling
- [ ] Implement global error boundary
- [ ] Create error pages (404, 500)
- [ ] Add error tracking (Sentry)
- [ ] Test error recovery flows

#### 7.6 Production Setup
- [ ] Configure production database
- [ ] Set up environment variables
- [ ] Deploy to Vercel
- [ ] Set up monitoring
- [ ] Configure analytics

### Exit Criteria
- [ ] PWA installs correctly
- [ ] Core Web Vitals pass
- [ ] No critical a11y issues
- [ ] Error tracking is active
- [ ] App is live in production

---

## Definition of Done

For each deliverable:

- [ ] Feature works as specified
- [ ] Unit tests pass (>80% coverage for logic)
- [ ] Integration tests pass (critical paths)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Accessibility basics met
- [ ] Works on mobile and desktop
- [ ] Works offline (where applicable)
- [ ] Documentation updated

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Voice capture browser support | Graceful fallback to text; detect support early |
| Encryption performance | Use Web Crypto API; test on low-end devices |
| Offline sync conflicts | Last-write-wins with conflict UI |
| AI extraction latency | Background processing; show "processing" state |
| Consent complexity | Start simple (Insights only); add tiers later |

---

## Dependencies

### External Services

| Service | Purpose | Phase |
|---------|---------|-------|
| PostgreSQL | Database | 0 |
| OpenAI Whisper | Voice transcription | 1 |
| OpenAI GPT-4 | Fact extraction | 3+ |
| Inngest/BullMQ | Job queue | 3+ |
| Sentry | Error tracking | 7 |
| Vercel | Hosting | 7 |

### Key Libraries

| Library | Purpose | Phase |
|---------|---------|-------|
| Next.js 15+ | Framework | 0 |
| Prisma 6+ | ORM | 0 |
| Tailwind CSS 4 | Styling | 0 |
| Zod 4+ | Validation | 0 |
| Motion 11+ | Animation | 0 |
| idb | IndexedDB | 2 |
| Recharts | Charts | 5 |

---

## Milestones

| Milestone | Criteria | Target |
|-----------|----------|--------|
| **Alpha 0** | App runs, auth works | Week 1 |
| **Alpha 1** | Can capture dreams | Week 2 |
| **Alpha 2** | Journal list works | Week 3 |
| **Alpha 3** | Prompts work | Week 4 |
| **Beta 1** | Census works | Week 5 |
| **Beta 2** | Weather works | Week 6 |
| **RC 1** | Privacy complete | Week 7 |
| **v3.0** | Production ready | Week 8 |

