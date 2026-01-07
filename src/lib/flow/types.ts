/**
 * Generic flow step props interface
 * Provides consistent props for all flow step components
 */
export interface FlowStepProps<TData, TEvent extends string = string> {
  data: TData
  onChange: (data: Partial<TData>) => void
  onNavigate: (event: TEvent) => void
  step: number
  totalSteps: number
  direction?: 'forward' | 'back'
}

/**
 * Flow configuration
 */
export interface FlowConfig<TStep extends string, TData> {
  steps: TStep[]
  initialData: TData
  onComplete: (data: TData) => Promise<void>
  onCancel?: () => void
}

/**
 * Flow navigation state
 */
export interface FlowNavigationState<TStep extends string, TData> {
  currentStep: TStep
  stepIndex: number
  totalSteps: number
  data: TData
  isLoading: boolean
  error: string | null
  direction: 'forward' | 'back'
}

/**
 * Flow navigation actions
 */
export interface FlowNavigationActions<TData> {
  next: () => void
  back: () => void
  skip: () => void
  goToStep: (step: number) => void
  updateData: (data: Partial<TData>) => void
  complete: () => Promise<void>
  cancel: () => void
}

/**
 * Flow navigation return type
 */
export interface FlowNavigationReturn<TStep extends string, TData> {
  state: FlowNavigationState<TStep, TData>
  actions: FlowNavigationActions<TData>
}

