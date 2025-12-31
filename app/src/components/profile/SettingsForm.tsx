'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/profile/actions'
import { getCurrentUser } from '@/lib/auth'

export function SettingsForm() {
  const [displayName, setDisplayName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [country, setCountry] = useState('')
  const [dreamFrequency, setDreamFrequency] = useState<string>('')
  const [consentData, setConsentData] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsLoading(true)

    try {
      const result = await updateProfile({
        displayName: displayName || undefined,
        birthYear: birthYear ? parseInt(birthYear) : undefined,
        country: country || undefined,
        dreamFrequency: dreamFrequency || undefined,
        consentData,
        consentMarketing,
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="What should we call you?"
          className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg"
        />
      </div>

      {/* Birth Year */}
      <div>
        <label className="block text-sm font-medium mb-2">Birth Year (optional)</label>
        <input
          type="number"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder="1990"
          min="1900"
          max={new Date().getFullYear()}
          className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg"
        />
        <p className="text-xs text-[var(--foreground-subtle)] mt-1">
          Helps us provide age-related insights
        </p>
      </div>

      {/* Dream Frequency */}
      <div>
        <label className="block text-sm font-medium mb-2">How often do you remember dreams?</label>
        <select
          value={dreamFrequency}
          onChange={(e) => setDreamFrequency(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg"
        >
          <option value="">Select frequency</option>
          <option value="rarely">Rarely</option>
          <option value="sometimes">Sometimes</option>
          <option value="often">Often</option>
          <option value="always">Always</option>
        </select>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentData}
            onChange={(e) => setConsentData(e.target.checked)}
            className="mt-1 w-5 h-5"
          />
          <div>
            <div className="text-sm font-medium">Anonymous Data Sharing</div>
            <div className="text-xs text-[var(--foreground-subtle)]">
              Allow your anonymized dream data to contribute to collective insights
            </div>
          </div>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentMarketing}
            onChange={(e) => setConsentMarketing(e.target.checked)}
            className="mt-1 w-5 h-5"
          />
          <div>
            <div className="text-sm font-medium">Marketing Communications</div>
            <div className="text-xs text-[var(--foreground-subtle)]">
              Receive occasional updates about new features
            </div>
          </div>
        </label>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30'
            : 'bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30'
        }`}>
          {message.text}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  )
}

