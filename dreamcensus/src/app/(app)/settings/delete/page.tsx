'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout'
import { Button, Card, Input } from '@/components/ui'
import { useToast } from '@/hooks/use-toast'

export default function DeleteAccountPage() {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const canDelete = confirmation.toLowerCase() === 'delete my account'

  const handleDelete = async () => {
    if (!canDelete) return

    setIsDeleting(true)
    
    try {
      // In production, this would call a Server Action
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // Redirect to goodbye page
      router.push('/goodbye')
    } catch (error) {
      console.error('Deletion failed:', error)
      toast.error('Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        title="Delete Account"
        subtitle="Permanently delete your account and all data"
      />

      <div className="space-y-6">
        {/* Warning */}
        <Card padding="lg" variant="elevated">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  This action cannot be undone
                </h3>
                <p className="text-sm text-muted">
                  Deleting your account will permanently remove:
                </p>
              </div>
            </div>

            <ul className="space-y-2 pl-11">
              {[
                'All dream entries',
                'Journal facts and tags',
                'Census responses',
                'Prompt responses',
                'Personal weather data',
                'Account settings',
                'Consent receipts',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-red-500">×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted">
                We recommend exporting your data first if you want to keep a copy.
              </p>
            </div>
          </div>
        </Card>

        {/* Confirmation */}
        <Card padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Type "delete my account" to confirm
              </label>
              <Input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="delete my account"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/settings')}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={!canDelete}
                loading={isDeleting}
                fullWidth
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

