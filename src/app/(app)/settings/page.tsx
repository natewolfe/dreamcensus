import Link from 'next/link'
import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui'
import { ThemeSelector, SettingsSection } from '@/components/settings'

export default function SettingsPage() {
  return (
    <div id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="space-y-6">
        {/* Appearance */}
        <SettingsSection title="Appearance">
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-foreground mb-1">
                  Theme
                </h3>
                <p className="text-sm text-muted mb-4">
                  Choose your color theme or let it change automatically based on time of day
                </p>
              </div>
              <ThemeSelector />
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
                    <p className="text-sm text-muted">Manage consent tiers</p>
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
                    <p className="text-sm text-muted">Download your complete data</p>
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
                  <p className="text-sm text-muted">Schedule your morning alarm</p>
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
                <p className="text-sm text-muted">Manage your encryption key</p>
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
                  <p className="text-sm text-muted">Email, password</p>
                </div>
                <span className="text-muted">→</span>
              </div>
            </Card>

            <Link href="/settings/delete">
              <Card variant="interactive" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-500">Delete Account</h3>
                    <p className="text-sm text-muted">Permanently delete all data</p>
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
              <div className="text-sm text-muted">
                <p className="mb-1">Dream Census v3.0</p>
                <p>A ritual-first dream reflection app</p>
              </div>
            </Card>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

