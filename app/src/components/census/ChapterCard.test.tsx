import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChapterCard } from './ChapterCard'

describe('ChapterCard', () => {
  const baseChapter = {
    slug: 'test-chapter',
    name: 'Test Chapter',
    description: 'A test chapter description',
    iconEmoji: '✦',
    estimatedMinutes: 5,
    stepCount: 10,
    answeredCount: 0,
    isComplete: false,
    isLocked: false,
  }

  it('should render chapter name', () => {
    render(<ChapterCard chapter={baseChapter} />)
    expect(screen.getByText('Test Chapter')).toBeInTheDocument()
  })

  it('should render chapter description', () => {
    render(<ChapterCard chapter={baseChapter} />)
    expect(screen.getByText('A test chapter description')).toBeInTheDocument()
  })

  it('should render icon emoji', () => {
    render(<ChapterCard chapter={baseChapter} />)
    expect(screen.getByText('✦')).toBeInTheDocument()
  })

  it('should show estimated time and question count', () => {
    render(<ChapterCard chapter={baseChapter} />)
    expect(screen.getByText(/~5 min/)).toBeInTheDocument()
    expect(screen.getByText(/10 questions/)).toBeInTheDocument()
  })

  it('should show "Start" for new chapter', () => {
    render(<ChapterCard chapter={baseChapter} />)
    expect(screen.getByText('Start →')).toBeInTheDocument()
  })

  it('should show "Continue" for partially complete chapter', () => {
    const partialChapter = { ...baseChapter, answeredCount: 5 }
    render(<ChapterCard chapter={partialChapter} />)
    expect(screen.getByText('Continue →')).toBeInTheDocument()
  })

  it('should show completion checkmark for complete chapter', () => {
    const completeChapter = { ...baseChapter, answeredCount: 10, isComplete: true }
    render(<ChapterCard chapter={completeChapter} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(screen.getByText('Review responses →')).toBeInTheDocument()
  })

  it('should show lock icon for locked chapter', () => {
    const lockedChapter = { ...baseChapter, isLocked: true }
    render(<ChapterCard chapter={lockedChapter} />)
    expect(screen.getByText('🔒')).toBeInTheDocument()
  })

  it('should show progress bar for partially complete chapter', () => {
    const partialChapter = { ...baseChapter, answeredCount: 5 }
    render(<ChapterCard chapter={partialChapter} />)
    expect(screen.getByText('5 of 10 complete')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should not show progress bar for locked chapter', () => {
    const lockedChapter = { ...baseChapter, isLocked: true }
    render(<ChapterCard chapter={lockedChapter} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should have correct aria-label for locked chapter', () => {
    const lockedChapter = { ...baseChapter, isLocked: true }
    render(<ChapterCard chapter={lockedChapter} />)
    expect(screen.getByLabelText('Test Chapter (locked)')).toBeInTheDocument()
  })

  it('should calculate progress percentage correctly', () => {
    const partialChapter = { ...baseChapter, answeredCount: 5 }
    render(<ChapterCard chapter={partialChapter} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
  })
})

