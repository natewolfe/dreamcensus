'use client'

import { CardView } from './CardView'
import { ListView } from './ListView'
import { WriteModal } from './WriteModal'
import { useStreamState, Question, AnsweredQuestion } from './useStreamState'

interface StreamContainerProps {
  questions: Question[]
  answeredQuestions: AnsweredQuestion[]
  onResponse: (questionId: string, response: 'yes' | 'no', expandedText?: string) => void
  onClearResponse: (questionId: string, preserveText?: boolean, expandedText?: string) => void
  onRequestMore: () => void
}

function CompletionView({ 
  stats, 
  onViewAll 
}: { 
  stats: { answered: number; total: number }
  onViewAll: () => void 
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-medium">All caught up!</h2>
        <p className="text-[var(--foreground-muted)]">
          You've answered all available questions
        </p>
        {stats.answered > 0 && (
          <button
            onClick={onViewAll}
            className="mt-4 px-6 py-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Review your answers ({stats.answered})
          </button>
        )}
      </div>
    </div>
  )
}

export function StreamContainer({
  questions,
  answeredQuestions,
  onResponse,
  onClearResponse,
  onRequestMore,
}: StreamContainerProps) {
  const state = useStreamState(questions, answeredQuestions, onResponse, onClearResponse, onRequestMore)

  // Show completion state if no more cards AND in card view mode
  const isComplete = state.currentCardIndex >= state.questions.length && state.questions.length === 0
  const shouldShowCompletion = isComplete && state.viewMode === 'card'

  return (
    <div className="relative flex-1 w-full flex flex-col">
      {/* Main Content - View Routing */}
      {shouldShowCompletion ? (
        <CompletionView 
          stats={state.progressStats}
          onViewAll={() => state.setViewMode('list')}
        />
      ) : state.viewMode === 'card' ? (
        <CardView state={state} />
      ) : (
        <ListView state={state} />
      )}

      {/* Global Write Modal */}
      <WriteModal
        question={state.writeModalQuestion}
        onSubmit={(response, text) => {
          if (state.writeModalQuestion) {
            state.recordResponse(state.writeModalQuestion.id, response, text)
            
            // Only advance card if we're in card view and it's the current card
            if (state.viewMode === 'card' && state.currentQuestion?.id === state.writeModalQuestion.id) {
              state.nextCard()
            }
          }
          state.closeWriteModal()
        }}
        onClose={state.closeWriteModal}
      />
    </div>
  )
}

