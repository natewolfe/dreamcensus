'use client'

import { StatementQuestion } from './StatementQuestion'
import { NumberQuestion } from './NumberQuestion'
import { 
  QuestionCard, 
  ChoiceGroup, 
  DiscreteScale, 
  TextArea, 
  BinaryButtons, 
  Input,
  FrequencyScale,
  DatePicker,
  ImageChoiceGroup,
  SearchableDropdown,
  MatrixQuestion,
  VASSlider,
  RankingQuestion,
  TagPool,
  type BinaryValue 
} from '@/components/ui'
import type { QuestionRendererProps } from './types'

export function QuestionRenderer({
  question,
  value,
  onChange,
  onCommit,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'statement':
      return (
        <StatementQuestion
          question={question}
          value={value as number | null}
          onChange={onChange}
          onCommit={onCommit}
        />
      )
    
    case 'binary':
      return (
        <QuestionCard question={question} contentWidth="sm">
          <BinaryButtons
            variant={(question.config?.variant as any) ?? 'yes_no'}
            value={value as BinaryValue | null}
            onChange={onChange as (value: BinaryValue) => void}
            onCommit={onCommit}
          />
        </QuestionCard>
      )
    
    case 'choice':
      return (
        <QuestionCard question={question}>
          <ChoiceGroup
            options={question.config?.options ?? []}
            value={value as string | null}
            onChange={(val) => onChange(val)}
            allowMultiple={false}
            allowOther={question.config?.allowOther}
            onCommit={question.config?.allowOther ? undefined : onCommit}
          />
        </QuestionCard>
      )
    
    case 'multiChoice':
      return (
        <QuestionCard question={question}>
          <ChoiceGroup
            options={question.config?.options ?? []}
            value={value as string[] | null}
            onChange={(val) => onChange(val)}
            allowMultiple={true}
            allowOther={question.config?.allowOther}
            maxSelections={question.config?.maxSelections}
          />
        </QuestionCard>
      )
    
    case 'scale':
      return (
        <QuestionCard question={question}>
          <DiscreteScale
            min={question.config?.min ?? 0}
            max={question.config?.max ?? 10}
            minLabel={question.config?.minLabel}
            maxLabel={question.config?.maxLabel}
            value={value as number | null}
            onChange={onChange as (value: number) => void}
            onCommit={onCommit}
          />
        </QuestionCard>
      )
    
    case 'frequency':
      return (
        <QuestionCard question={question}>
          <FrequencyScale
            value={value as number | null}
            onChange={onChange as (value: number) => void}
            anchorSet={question.config?.anchorSet ?? 'standard'}
            steps={question.config?.frequencySteps ?? 5}
            allowNA={question.config?.allowNA}
            onCommit={onCommit}
          />
        </QuestionCard>
      )
    
    case 'text':
      return (
        <QuestionCard question={question}>
          <TextArea
            value={(value as string) ?? ''}
            onChange={onChange as (value: string) => void}
            placeholder={question.config?.placeholder}
            maxLength={question.config?.maxLength}
            minLength={question.config?.minLength}
          />
        </QuestionCard>
      )
    
    case 'shortText':
      return (
        <QuestionCard question={question} contentWidth="md">
          <Input
            type="text"
            value={(value as string) ?? ''}
            onChange={(e) => (onChange as (value: string) => void)(e.target.value)}
            placeholder={question.config?.placeholder}
            maxLength={question.config?.maxLength}
            className="text-center"
          />
        </QuestionCard>
      )
    
    case 'number':
      return (
        <NumberQuestion
          question={question}
          value={value as number | null}
          onChange={onChange}
        />
      )
    
    case 'date':
      return (
        <QuestionCard question={question} contentWidth="sm">
          <DatePicker
            value={(value as string) ?? null}
            onChange={onChange as (value: string) => void}
            minDate={question.config?.minDate}
            maxDate={question.config?.maxDate}
            showAge={question.config?.showAge}
          />
        </QuestionCard>
      )
    
    case 'imageChoice':
      return (
        <QuestionCard question={question}>
          <ImageChoiceGroup
            options={question.config?.imageOptions ?? []}
            value={value as string | string[] | null}
            onChange={onChange as (value: string | string[]) => void}
            allowMultiple={question.config?.allowMultiple}
            columns={question.config?.columns}
            onCommit={question.config?.allowMultiple ? undefined : onCommit}
          />
        </QuestionCard>
      )
    
    case 'dropdown':
      return (
        <QuestionCard question={question} contentWidth="sm">
          <SearchableDropdown
            options={(question.config?.options ?? []).map((opt) => ({
              value: opt,
              label: opt,
            }))}
            value={(value as string) ?? null}
            onChange={onChange as (value: string) => void}
            allowOther={question.config?.allowOther}
            onCommit={onCommit}
          />
        </QuestionCard>
      )
    
    case 'matrix':
      return (
        <QuestionCard question={question}>
          <MatrixQuestion
            rows={question.config?.matrixRows ?? []}
            columns={question.config?.matrixColumns ?? []}
            values={(value as Record<string, number>) ?? {}}
            onChange={(rowId: string, val: number) => {
              const newValues = { ...((value as Record<string, number>) ?? {}), [rowId]: val }
              onChange(newValues)
            }}
          />
        </QuestionCard>
      )
    
    case 'vas':
      return (
        <QuestionCard question={question}>
          <VASSlider
            value={value as number | null}
            onChange={onChange as (value: number) => void}
            leftLabel={question.config?.leftLabel ?? 'Not at all'}
            rightLabel={question.config?.rightLabel ?? 'Extremely'}
            showValue={question.config?.showValue}
            instruction={question.config?.instruction}
          />
        </QuestionCard>
      )
    
    case 'ranking':
      return (
        <QuestionCard question={question}>
          <RankingQuestion
            items={question.config?.rankingItems ?? []}
            value={(value as string[]) ?? []}
            onChange={onChange as (value: string[]) => void}
            maxItems={question.config?.maxRank}
          />
        </QuestionCard>
      )
    
    case 'tagPool':
      return (
        <QuestionCard question={question} contentWidth="lg">
          <TagPool
            tags={question.config?.tags ?? []}
            selected={(value as string[]) ?? []}
            onChange={onChange as (value: string[]) => void}
            allowCustom={question.config?.allowCustomTags}
            min={question.config?.minTags}
            max={question.config?.maxTags}
          />
        </QuestionCard>
      )
    
    default:
      return (
        <div className="text-muted">
          Unknown question type: {(question as any).type}
        </div>
      )
  }
}

