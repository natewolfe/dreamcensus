'use client'

import { Button, Card } from '@/components/ui'

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto max-w-2xl px-3 md:px-4 py-8">
      <Card padding="lg">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
          <p className="text-muted mb-6">We couldn't load your profile.</p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </Card>
    </div>
  )
}
