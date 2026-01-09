'use client'

import Link from 'next/link'
import { Card } from '@/components/ui'

interface TodayClientProps {
  promptsAnswered: number
}

export function TodayClient({ promptsAnswered }: TodayClientProps) {
  return (
    <Link href="/prompts" className="block">
      <Card variant="interactive" padding="lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-2xl">💭</div>
            <h2 className="text-xl font-semibold">The Stream</h2>
            <p className="mt-1 text-muted">
              {promptsAnswered > 0 
                ? `${promptsAnswered} questions answered`
                : 'Explore questions about dreams'}
            </p>
          </div>
          <span className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground">
            Continue →
          </span>
        </div>
      </Card>
    </Link>
  )
}

