# Flow State Architecture

## Overview

Dream Census uses two distinct approaches for managing flow state, depending on the complexity of the flow:

1. **Generic `useFlowNavigation` hook** - For simple, linear flows
2. **Manual state machines** - For complex, non-linear flows with branching logic

## Decision Rationale

### When to Use Each Approach

| Approach | Use Case | Examples |
|----------|----------|----------|
| `useFlowNavigation` | Linear flows with predictable step order | Simple wizards, onboarding |
| Manual State Machine | Non-linear flows with conditional branching | Morning Mode, Night Mode |

### Why Not a Single Unified Approach?

We evaluated three options:

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Generic hook only** | Simple, consistent API | Can't handle branching logic | ❌ Too limited |
| **Manual state only** | Full control, explicit | Code duplication, verbose | ⚠️ Works but not DRY |
| **Hybrid (current)** | Right tool for the job | Two patterns to learn | ✅ **Selected** |

**Rationale**: Morning Mode and Night Mode have complex branching:
- Morning Mode: Different paths based on `recallLevel` (nothing → fragments → scene → full)
- Night Mode: Optional steps that can be skipped in various orders

A generic hook would require extensive configuration to handle these cases, making it more complex than manual state management.

## Architecture

### Generic Flow Hook

**Location**: [`src/hooks/use-flow-navigation.ts`](../src/hooks/use-flow-navigation.ts)

**Usage**:
```tsx
const { state, actions } = useFlowNavigation({
  steps: ['intro', 'details', 'confirm'],
  initialData: {},
  onComplete: async (data) => { /* save */ },
})
```

**Best for**: Linear flows where every step follows the previous one.

### Manual State Machines

**Locations**:
- [`src/components/morning/MorningMode.tsx`](../src/components/morning/MorningMode.tsx)
- [`src/components/night/NightMode.tsx`](../src/components/night/NightMode.tsx)

**Pattern**:
```tsx
const [step, setStep] = useState<MorningStep>('start')
const [direction, setDirection] = useState<FlowDirection>('forward')
const [data, setData] = useState<MorningDraft>(INITIAL_DRAFT)

// Manual transitions with branching logic
const handleQuickFactsComplete = (factData: QuickFactsData) => {
  updateData(factData)
  
  // Branch based on recall level
  if (factData.recallLevel === 'nothing') {
    setStep('structure')  // Skip capture
  } else if (captureMethod === 'voice') {
    setStep('voice')
  } else {
    setStep('text')
  }
}
```

**Best for**: Flows with conditional branching, dynamic step counts, or complex state dependencies.

## Shared Utilities

To reduce duplication in manual state machines, we provide shared utilities:

### Flow Navigation Helper

**Location**: [`src/lib/flow/utils.ts`](../src/lib/flow/utils.ts)

```tsx
import { createFlowNavigator } from '@/lib/flow/utils'

const navigator = createFlowNavigator(
  steps,
  setStep,
  setDirection
)

// Use helper methods
navigator.goTo('structure', 'forward')
navigator.goBack('quick-facts')
```

### Shared Types

**Location**: [`src/lib/flow/types.ts`](../src/lib/flow/types.ts)

- `FlowDirection` - Type for navigation direction
- `FlowStepBaseProps` - Base props for step components
- `FlowStepProps<TData, TEvent>` - Generic step props interface

## Component Patterns

### Step Component Structure

All flow step components should follow this pattern:

```tsx
import type { FlowStepBaseProps } from '@/lib/flow/types'

export interface MyStepProps extends FlowStepBaseProps {
  onComplete: (data: MyData) => void
  onBack: () => void
  onSkip?: () => void
}

export function MyStep({
  direction,
  globalStep,
  totalSteps,
  onComplete,
  onBack,
}: MyStepProps) {
  // Implementation
}
```

### Animation Consistency

Use shared animation variants from [`src/lib/motion.ts`](../src/lib/motion.ts):

```tsx
import { slideVariants, slideTransition } from '@/lib/motion'

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={step}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={slideTransition}
  >
    {/* Step content */}
  </motion.div>
</AnimatePresence>
```

## Future Considerations

### If Adding More Flows

**3-4 flows**: Current approach remains optimal. Extract more shared utilities as patterns emerge.

**5+ flows**: Consider:
1. **XState** - Industry-standard state machine library
2. **FlowStateContext** - Custom context-based solution
3. **Flow Builder** - Configuration-driven flow engine

### Migration Path

If we decide to unify:

1. Create `FlowStateContext` provider
2. Migrate one flow as proof of concept
3. Evaluate complexity vs. benefits
4. Decide whether to continue migration

## Related Documentation

- [Architecture Overview](./architecture.md)
- [Component Patterns](./patterns.md)
- [Flow Specifications](./flows/)
  - [Morning Mode](./flows/morning-mode.md)
  - [Night Mode](./flows/night-mode.md)
