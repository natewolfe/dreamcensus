'use client'

import { QuestionListItem } from './QuestionListItem'
import { StreamState, Question } from './useStreamState'

interface ListViewProps {
  state: StreamState
}

function groupByCategory(questions: Question[]): Record<string, Question[]> {
  return questions.reduce((acc, question) => {
    const category = question.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(question)
    return acc
  }, {} as Record<string, Question[]>)
}

export function ListView({ state }: ListViewProps) {
  const grouped = groupByCategory(state.allQuestions)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-12 space-y-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--foreground-muted)]">
            {state.progressStats.answered} of {state.progressStats.total} answered
          </p>
          <button
            onClick={() => state.setViewMode('card')}
            className="px-4 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] hover:bg-[var(--background-subtle)] hover:border-[rgba(176,147,255,0.3)] transition-colors text-sm"
          >
            Card View
          </button>
        </div>

        {/* Categorized Questions */}
        {Object.entries(grouped).map(([category, questions]) => (
          <section key={category} className="pb-12">
            <h3 className="text-2xl text-[var(--accent)] text-center uppercase tracking-wider mb-12 px-2">
              {category}
            </h3>
            <div className="space-y-6">
              {questions.map((question) => (
                <QuestionListItem
                  key={question.id}
                  question={question}
                  response={state.responses.get(question.id)}
                  preservedText={state.preservedTexts.get(question.id)}
                  onNo={() => state.recordResponse(question.id, 'no')}
                  onYes={() => state.recordResponse(question.id, 'yes')}
                  onWrite={() => state.openWriteModal(question)}
                  onClear={() => state.clearResponse(question.id, true)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

