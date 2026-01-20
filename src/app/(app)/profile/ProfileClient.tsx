'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { ProfileData, ProfileStats, DreamerProfileData, UnlockProgress } from '@/lib/profile'
import type { DreamWeatherChartData } from '@/lib/weather/types'
import {
  ProfileHeader,
  AvatarEditor,
  ProfileStats as ProfileStatsComponent,
  QuickActions,
  ShareModal,
  ProfileInsights,
  DreamProfile,
  DimensionsGrid,
  ArchetypeSection,
  UnlockProgress as UnlockProgressComponent,
  ProfileSummary,
} from '@/components/profile'
import { EmbeddedWeatherChart } from '@/components/weather'
import type { InsightItem } from '@/components/today'
import { updateProfile } from './actions'

interface ProfileClientProps {
  initialProfile: ProfileData | null
  initialStats: ProfileStats | null
  insights: InsightItem[]
  dreamerProfile: DreamerProfileData | null
  progress: UnlockProgress | null
  personalChartData: DreamWeatherChartData | null
}

export function ProfileClient({ 
  initialProfile, 
  initialStats, 
  insights, 
  dreamerProfile, 
  progress,
  personalChartData,
}: ProfileClientProps) {
  const { toast } = useToast()
  const [profile, setProfile] = useState(initialProfile)
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const isProfileComplete = progress?.currentLevel === 4
  const hasProfile = dreamerProfile && progress

  if (!profile || !initialStats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Failed to load profile data</p>
      </div>
    )
  }

  const handleAvatarSave = async (emoji: string, color: string) => {
    // Optimistic update
    const previousProfile = profile
    setProfile({ ...profile, avatarEmoji: emoji, avatarBgColor: color })

    const result = await updateProfile({
      avatarEmoji: emoji,
      avatarBgColor: color,
    })

    if (!result.success) {
      // Revert on error
      setProfile(previousProfile)
      toast.error('Failed to update avatar')
    } else {
      toast.success('Avatar updated')
    }
  }

  const handleNameChange = async (name: string) => {
    // Optimistic update
    const previousProfile = profile
    setProfile({ ...profile, displayName: name })

    const result = await updateProfile({
      displayName: name,
    })

    if (!result.success) {
      // Revert on error
      setProfile(previousProfile)
      toast.error('Failed to update name')
    } else {
      toast.success('Name updated')
    }
  }

  return (
    <div className="space-y-10">
      {/* Profile Header */}
      <ProfileHeader
        displayName={profile.displayName}
        avatarEmoji={profile.avatarEmoji}
        avatarBgColor={profile.avatarBgColor}
        memberSince={profile.memberSince}
        onAvatarEdit={() => setIsAvatarEditorOpen(true)}
        onShare={() => setIsShareModalOpen(true)}
        onNameChange={handleNameChange}
      />

      <div className="flex flex-col gap-2">
        {/* Stats Grid */}
        <ProfileStatsComponent
          totalDreams={initialStats.totalDreams}
          journalStreak={initialStats.journalStreak}
          lucidPercentage={initialStats.lucidPercentage}
          censusProgress={initialStats.censusProgress}
        />

        {/* Personal Weather Chart */}
        {personalChartData && personalChartData.points.length >= 3 && (
          <EmbeddedWeatherChart 
            collectiveChartData={personalChartData}
            variant="inline"
          />
        )}
      </div>

      {/* Personal Insights Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Personal Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Progress OR Summary */}
          {hasProfile && (
            isProfileComplete ? (
              <ProfileSummary profileData={dreamerProfile} />
            ) : dreamerProfile.unlockLevel === 0 ? (
              <DreamProfile profileData={dreamerProfile} progress={progress} />
            ) : (
              <UnlockProgressComponent progress={progress} />
            )
          )}

          {/* Right: Insights Carousel */}
          <ProfileInsights insights={insights} hideHeader />
        </div>
      </section>

      {/* Dimensions Grid (2-column on desktop) - only if level 1+ */}
      {hasProfile && dreamerProfile.unlockLevel >= 1 && (
        <DimensionsGrid profileData={dreamerProfile} />
      )}

      {/* Archetype (if unlocked at level 3+) */}
      {hasProfile && (
        <ArchetypeSection profileData={dreamerProfile} />
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Modals */}
      <AvatarEditor
        isOpen={isAvatarEditorOpen}
        onClose={() => setIsAvatarEditorOpen(false)}
        currentEmoji={profile.avatarEmoji}
        currentColor={profile.avatarBgColor}
        onSave={handleAvatarSave}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        totalDreams={initialStats.totalDreams}
        journalStreak={initialStats.journalStreak}
        memberSince={profile.memberSince}
      />
    </div>
  )
}
