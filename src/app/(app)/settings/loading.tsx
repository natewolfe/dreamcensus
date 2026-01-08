import { 
  PageHeaderSkeleton, 
  SettingsLinkSkeleton, 
  CardSkeleton, 
  Skeleton 
} from '@/components/ui'

function SettingsSectionSkeleton({ 
  title = true, 
  children 
}: { 
  title?: boolean
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-3">
      {title && <Skeleton className="h-4 w-24" />}
      {children}
    </div>
  )
}

export default function SettingsLoading() {
  return (
    <div id="main-content" className="container mx-auto max-w-2xl px-3 md:px-4 py-8">
      <div className="mb-6 md:mb-8">
        <PageHeaderSkeleton />
      </div>

      <div className="space-y-8">
        {/* Appearance */}
        <SettingsSectionSkeleton>
          <CardSkeleton lines={4} showHeader />
        </SettingsSectionSkeleton>

        {/* Privacy & Data */}
        <SettingsSectionSkeleton>
          <div className="space-y-2">
            <SettingsLinkSkeleton />
            <SettingsLinkSkeleton />
          </div>
        </SettingsSectionSkeleton>

        {/* Daily Rhythm */}
        <SettingsSectionSkeleton>
          <SettingsLinkSkeleton />
        </SettingsSectionSkeleton>

        {/* Security */}
        <SettingsSectionSkeleton>
          <SettingsLinkSkeleton />
        </SettingsSectionSkeleton>

        {/* Account */}
        <SettingsSectionSkeleton>
          <div className="space-y-2">
            <SettingsLinkSkeleton />
            <SettingsLinkSkeleton />
          </div>
        </SettingsSectionSkeleton>

        {/* About */}
        <SettingsSectionSkeleton>
          <CardSkeleton lines={2} />
        </SettingsSectionSkeleton>
      </div>
    </div>
  )
}
