import { notFound, redirect } from 'next/navigation'
import { getChapter, getChaptersWithProgress } from '@/lib/chapters'
import { getSession } from '@/lib/auth'
import { ChapterCelebration } from '@/components/census/ChapterCelebration'
import { checkAchievements, calculateAchievementProgress, getNewlyUnlocked, ACHIEVEMENTS } from '@/lib/achievements'

interface ChapterCompletePageProps {
  params: Promise<{ chapter: string }>
}

export async function generateMetadata({ params }: ChapterCompletePageProps) {
  const { chapter: chapterSlug } = await params
  const chapter = await getChapter(chapterSlug).catch(() => null)
  
  return {
    title: chapter ? `${chapter.name} Complete | Dream Census` : 'Complete',
  }
}

// Generate some contextual insights based on chapter
function generateChapterInsights(chapterSlug: string): string[] {
  const insightMap: Record<string, string[]> = {
    threshold: [
      "You've taken the first step into exploring your dream life",
      "Your openness to self-reflection is a powerful tool",
      "The journey ahead will reveal patterns you may not have noticed"
    ],
    dreamer: [
      "Your relationship with sleep and dreams is unique to you",
      "Understanding your dreaming habits is the foundation of dream awareness",
      "Every dreamer's experience is valid and valuable"
    ],
    sleeping: [
      "Sleep quality directly impacts dream recall and vividness",
      "Your sleep patterns influence your dream experiences",
      "Awareness of sleep habits is the first step to better dreams"
    ],
    dreaming: [
      "The content of your dreams reflects your inner world",
      "Dream themes often connect to waking life in surprising ways",
      "Your dream experiences are a window into your subconscious"
    ],
    patterns: [
      "Recurring symbols in dreams often carry personal significance",
      "Patterns in dreams can reveal unconscious preoccupations",
      "Recognizing dream patterns is key to lucidity"
    ],
    lucidity: [
      "Lucid dreaming is a skill that can be developed over time",
      "Awareness in dreams opens up new possibilities for exploration",
      "Your capacity for lucidity reflects your self-awareness"
    ],
    emotions: [
      "Emotions in dreams are often more intense than in waking life",
      "Your emotional landscape in dreams reveals deeper truths",
      "Processing emotions through dreams is a natural healing process"
    ],
    reflection: [
      "Self-reflection deepens your understanding of dreams",
      "Looking inward reveals connections between dreams and life",
      "Your willingness to reflect shows emotional maturity"
    ],
  }
  
  return insightMap[chapterSlug] || [
    "You've explored an important aspect of your dream life",
    "Your responses contribute to our collective understanding",
    "Each chapter brings you closer to dream awareness"
  ]
}

export default async function ChapterCompletePage({ params }: ChapterCompletePageProps) {
  const { chapter: chapterSlug } = await params
  const chapter = await getChapter(chapterSlug)
  
  if (!chapter) {
    notFound()
  }

  const session = await getSession()
  
  // If no session, redirect to census hub
  if (!session) {
    redirect('/census')
  }
  
  const chapters = await getChaptersWithProgress(session.userId)
  
  const currentChapter = chapters.find((c) => c.slug === chapterSlug)
  if (!currentChapter) {
    notFound()
  }

  // Find next chapter
  const nextChapter = chapters.find(
    (c) => !c.isComplete && !c.isLocked && c.orderIndex > chapter.orderIndex
  ) || null
  
  // Calculate achievements
  const progress = calculateAchievementProgress(chapters)
  const currentAchievements = checkAchievements(progress)
  
  // For demo purposes, we'll assume previous achievements were all except the newly unlocked ones
  // In production, you'd fetch this from the database
  const previousCompletedCount = chapters.filter(c => c.isComplete).length - 1
  const previousProgress = calculateAchievementProgress(
    chapters.map(c => c.slug === chapterSlug ? { ...c, isComplete: false } : c)
  )
  const previousAchievements = checkAchievements(previousProgress)
  const newAchievements = getNewlyUnlocked(previousAchievements, currentAchievements)
  
  // Generate insights for this chapter
  const insights = generateChapterInsights(chapterSlug)

  return (
    <ChapterCelebration
      chapter={currentChapter}
      insights={insights}
      nextChapter={nextChapter}
      newAchievements={newAchievements}
    />
  )
}
