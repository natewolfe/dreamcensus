import Link from 'next/link'
import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui'
import { ThemeSelector, SettingsSection } from '@/components/settings'
import { AnimationToggle } from '@/components/settings/AnimationToggle'

export default function SettingsPage() {
  return (
    <div id="main-content" className="container mx-auto max-w-2xl px-3 md:px-4 py-8">
      
      <div className="mb-6 md:mb-0">
        <PageHeader
          title="Settings"
          subtitle="Manage your account and preferences"
        />
      </div>

      <div className="space-y-8">
        {/* Appearance */}
        <SettingsSection title="Appearance">
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-foreground mb-1">
                  Theme
                </h3>
                <p className="text-sm text-muted mb-4">
                  Choose the app's color scheme.
                </p>
              </div>
              <ThemeSelector />
              
              <div className="pt-4 border-t border-border">
                <h3 className="text-base font-medium text-foreground mb-1">
                  Animations
                </h3>
                <p className="text-sm text-muted mb-4">
                  Enhanced visual effects and ambient backgrounds.
                </p>
                <AnimationToggle />
              </div>
            </div>
          </Card>
        </SettingsSection>

        {/* Privacy & Data */}
        <SettingsSection title="Privacy & Data">
          <div className="space-y-2">
            <Link href="/settings/privacy" className="block">
              <Card variant="interactive" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Privacy Controls</h3>
                    <span className="text-sm text-muted">Manage consent tiers</span>
                  </div>
                  <span className="text-muted">→</span>
                </div>
              </Card>
            </Link>

            <Link href="/settings/export">
              <Card variant="interactive" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Export Data</h3>
                    <span className="text-sm text-muted">Download your complete data</span>
                  </div>
                  <span className="text-muted">→</span>
                </div>
              </Card>
            </Link>
          </div>
        </SettingsSection>

        {/* Daily Rhythm */}
        <SettingsSection title="Daily Rhythm">
          <Link href="/settings/alarm">
            <Card variant="interactive" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Wake Alarm</h3>
                  <span className="text-sm text-muted">Schedule your morning alarm</span>
                </div>
                <span className="text-muted">→</span>
              </div>
            </Card>
          </Link>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security">
          <Card variant="interactive" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Encryption Key</h3>
                <span className="text-sm text-muted">Manage your encryption key</span>
              </div>
              <span className="text-muted">→</span>
            </div>
          </Card>
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <div className="space-y-2">
            <Card variant="interactive" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Profile</h3>
                  <span className="text-sm text-muted">Email, password</span>
                </div>
                <span className="text-muted">→</span>
              </div>
            </Card>

            <Link href="/settings/delete">
              <Card variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-500">⚠ Delete Account</h3>
                    <span className="text-sm text-muted">Permanently delete all data</span>
                  </div>
                  <span className="text-muted">→</span>
                </div>
              </Card>
            </Link>
          </div>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <div className="space-y-2">
            <Card padding="md" variant="outlined">
              <div className="text-muted">
                <div className="mb-1 text-md font-medium">🔮 Dream Census v3.0</div>
                <div className="text-sm">A ritual-first dream reflection app</div>
              </div>
            </Card>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

