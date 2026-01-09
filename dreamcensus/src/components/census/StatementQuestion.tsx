'use client'

import { QuestionCard, DiscreteScale } from '@/components/ui'
import type { StatementQuestionProps } from './types'

const SCALE_LABELS: Record<string, { left: string; right: string }> = {
  agreement: {
    left: 'Disagree',
    right: 'Agree',
  },
  frequency: {
    left: 'Never',
    right: 'Often',
  },
  satisfaction: {
    left: 'Dissatisfied',
    right: 'Satisfied',
  },
}

export function StatementQuestion({
  question,
  value,
  onChange,
  onCommit,
}: StatementQuestionProps) {
  const scaleType = question.config?.scaleType ?? 'agreement'
  const steps = question.config?.steps ?? 5
  const labels = SCALE_LABELS[scaleType] ?? SCALE_LABELS.agreement

  return (
    <QuestionCard question={question}>
      <DiscreteScale
        min={1}
        max={steps}
        value={value}
        onChange={onChange}
        minLabel={labels?.left ?? 'Disagree'}
        maxLabel={labels?.right ?? 'Agree'}
        onCommit={onCommit}
      />
    </QuestionCard>
  )
}

