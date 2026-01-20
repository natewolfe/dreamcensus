'use client'

import { Card } from '@/components/ui'
import type { DreamerProfileData } from '@/lib/profile/types'

interface ProfileSummaryProps {
  profileData: DreamerProfileData
}

export function ProfileSummary({ profileData }: ProfileSummaryProps) {
  const { dimensions, primaryArchetype } = profileData

  // Get dimension scores for synthesis
  const scores = dimensions.reduce((acc, d) => {
    acc[d.dimension] = d.score
    return acc
  }, {} as Record<string, number | null>)

  // Generate synthesis based on scores
  const synthesis = generateSynthesis(scores, primaryArchetype?.id ?? null)

  return (
    <Card variant="elevated" padding="lg" className="h-full">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{primaryArchetype?.icon ?? '✨'}</span>
          <div>
            <div className="text-lg font-semibold text-foreground">Your Dream Self</div>
            <div className="text-xs text-muted">Profile complete</div>
          </div>
        </div>

        <div className="text-sm text-muted leading-relaxed">
          {synthesis}
        </div>

        <span className="text-xs text-subtle italic">
          This understanding deepens as you continue journaling.
        </span>
      </div>
    </Card>
  )
}

/**
 * Generate a personalized synthesis paragraph based on dimension scores
 */
function generateSynthesis(
  scores: Record<string, number | null>,
  archetypeId: string | null
): string {
  const parts: string[] = []

  // Opening based on archetype
  const archetypeOpenings: Record<string, string> = {
    navigator: "You approach the dreamscape with intention.",
    oracle: "Your dreams speak to you in symbols and patterns.",
    witness: "You experience dreams as immersive emotional journeys.",
    explorer: "Your dream world is vast and boundary-free.",
  }
  
  if (archetypeId && archetypeOpenings[archetypeId]) {
    parts.push(archetypeOpenings[archetypeId])
  } else {
    parts.push("Your dream life has a unique character.")
  }

  // Boundary observation
  const boundary = scores.boundary
  if (boundary !== null) {
    if (boundary >= 65) {
      parts.push("The line between waking and dreaming feels permeable to you—imagination flows freely between worlds.")
    } else if (boundary <= 35) {
      parts.push("You maintain clear distinctions between dream and waking reality, with structured dream narratives.")
    }
  }

  // Lucidity observation
  const lucidity = scores.lucidity
  if (lucidity !== null) {
    if (lucidity >= 60) {
      parts.push("You often recognize when you're dreaming, and can sometimes guide where things go.")
    } else if (lucidity <= 30) {
      parts.push("Your dreams unfold naturally without conscious steering—you're along for the ride.")
    }
  }

  // Emotion observation
  const emotion = scores.emotion
  if (emotion !== null) {
    if (emotion >= 60) {
      parts.push("Emotions run strong in your dreams, often lingering into waking.")
    } else if (emotion <= 35) {
      parts.push("Your dreams carry a quieter emotional tone, more observational than felt.")
    }
  }

  // Meaning/engagement synthesis
  const meaning = scores.meaning
  const engagement = scores.engagement
  if (meaning !== null && engagement !== null) {
    if (meaning >= 55 && engagement >= 55) {
      parts.push("You actively work with your dreams—finding meaning, connecting patterns, integrating insights into your life.")
    } else if (meaning >= 55) {
      parts.push("You're drawn to the symbolic language of dreams, even if you don't always act on what you find.")
    } else if (engagement >= 55) {
      parts.push("Dreams matter to you—you think about them, talk about them, and let them inform your days.")
    }
  }

  return parts.join(" ")
}
