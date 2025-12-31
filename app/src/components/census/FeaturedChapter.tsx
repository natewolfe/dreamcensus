import Link from 'next/link'
import type { CensusChapterData } from '@/lib/chapters'
import type { CensusStepData } from '@/lib/types'

interface FeaturedChapterProps {
  chapter: CensusChapterData
  previewQuestions: CensusStepData[]
}

export function FeaturedChapter({ chapter, previewQuestions }: FeaturedChapterProps) {
  const progress = chapter.stepCount > 0 
    ? Math.round((chapter.answeredCount / chapter.stepCount) * 100)
    : 0

  return (
    <section>
      <div className="rounded-3xl border border-[var(--border)] overflow-hidden relative min-h-[180px]">
        {/* Full-width background image */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--secondary)]/20"
          style={{
            backgroundImage: `url('/images/census/${chapter.slug}.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Full-width gradient overlay - fades left (92%) to right (0%) */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, 
              rgba(var(--background-elevated-rgb, 26, 30, 58), 0.92) 0%, 
              rgba(var(--background-elevated-rgb, 26, 30, 58), 0.8) 40%,
              rgba(var(--background-elevated-rgb, 26, 30, 58), 0) 100%)`,
          }}
        />
        
        <div className="relative grid md:grid-cols-2">
          {/* Left: Chapter info */}
          <div className="p-8 relative z-10">
            <div className="text-6xl mb-4">{chapter.iconEmoji || '✦'}</div>
            <h2 className="text-3xl font-medium mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>
              {chapter.name}
            </h2>
            <p className="text-[var(--foreground-muted)] mb-6">{chapter.description}</p>
            
            {/* Desktop: Show metadata here */}
            <div className="hidden md:flex items-center gap-6 text-sm text-[var(--foreground-muted)]/70">
              <span>⏱️ {chapter.estimatedMinutes} min</span>
              <span>📝 {chapter.stepCount} questions</span>
            </div>
            
            {progress > 0 && progress < 100 && (
              <div className="mb-6 mt-6">
                <div className="flex justify-between text-sm text-[var(--foreground-muted)] mb-2">
                  <span>Your progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Right: Button area (shows through gradient) */}
          <div className="relative min-h-[200px] p-8 flex flex-col items-stretch md:items-end justify-end z-10 gap-4">
            {/* Mobile: Show metadata above button */}
            <div className="flex md:hidden items-center justify-around text-sm text-[var(--foreground-muted)]/70 w-full">
              <span>⏱️ {chapter.estimatedMinutes} min</span>
              <span>📝 {chapter.stepCount} questions</span>
            </div>
            
            <Link 
              href={`/census/${chapter.slug}`}
              className="btn btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
            >
              {progress > 0 ? 'Continue' : 'Begin'} 
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

