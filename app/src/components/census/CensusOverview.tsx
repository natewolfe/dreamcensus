import { getChaptersWithProgress, getChapterPreviews } from '@/lib/chapters'
import { getSession } from '@/lib/auth'
import { calculateProgress } from '@/lib/progress'
import { 
  calculateDreamScore, 
  calculateInsightsUnlocked, 
  calculateTimeInvested,
  getRecommendedChapter 
} from '@/lib/census-stats'
import { ProgressInsights } from './ProgressInsights'
import { JourneyMap } from './JourneyMap'
import { FeaturedChapter } from './FeaturedChapter'
import { ChapterCard } from './ChapterCard'

export async function CensusOverview() {
  const session = await getSession()
  
  // Show chapters with or without progress
  // Session will be created when user actually starts a chapter
  const chapters = await getChaptersWithProgress(session?.userId)

  const totalSteps = chapters.reduce((sum, ch) => sum + ch.stepCount, 0)
  const totalAnswered = chapters.reduce((sum, ch) => sum + ch.answeredCount, 0)
  const completedChapters = chapters.filter((ch) => ch.isComplete).length
  const overallProgress = calculateProgress(totalAnswered, totalSteps)

  // Calculate enhanced stats
  const insightsUnlocked = calculateInsightsUnlocked(chapters)
  const timeInvested = calculateTimeInvested(chapters)
  const dreamScore = calculateDreamScore(completedChapters, chapters.length)

  // Find the recommended next chapter
  const recommendedChapter = getRecommendedChapter(chapters)
  
  // Get preview questions for featured chapter
  const previewQuestions = recommendedChapter 
    ? await getChapterPreviews(recommendedChapter.slug, 3)
    : []

  const isReturning = totalAnswered > 0

  return (
    <div className="flex flex-col max-w-5xl mx-auto px-4 py-8 pb-16 gap-6">

        {/* Journey Map - Visual constellation */}
        {isReturning && (
          <JourneyMap 
            chapters={chapters}
            currentPosition={recommendedChapter?.slug}
          />
        )}

        {/* Featured Chapter */}
        {recommendedChapter && previewQuestions.length > 0 && (
          <div>
            <h2 className="text-2xl font-medium mb-4">Next Form:</h2>
            <FeaturedChapter 
                chapter={recommendedChapter}
                previewQuestions={previewQuestions}
              />
          </div>
        )}

        {/* Help Text */}
        {!isReturning && (
          <div className="my-4 py-8 block rounded-2xl border border-[var(--border)] text-center text-lg text-[var(--foreground-muted)] leading-relaxed">
            <p className="max-w-[500px] mx-auto">
              Complete "The Threshold" to unlock all other chapters.
              Chapters can be completed in any order after that.
            </p>
          </div>
        )}

        {/* Progress Insights */}
        {isReturning && (
          <ProgressInsights
            chaptersComplete={completedChapters}
            totalChapters={chapters.length}
            insightsUnlocked={insightsUnlocked}
            timeInvested={timeInvested}
            dreamScore={dreamScore}
            isReturning={isReturning}
          />
        )}

        {/* All Chapters Grid */}
        <div className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <ChapterCard 
                key={chapter.id} 
                chapter={chapter}
                isRecommended={chapter.id === recommendedChapter?.id}
              />
            ))}
          </div>
        </div>
    </div>
  )
}
