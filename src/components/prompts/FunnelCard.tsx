'use client'

import { motion } from 'motion/react'
import { Button, Card } from '@/components/ui'
import Link from 'next/link'

interface FunnelCardProps {
  category: {
    name: string
    slug: string
    icon?: string
  }
  form: {
    name: string
    slug: string
    estimatedMinutes: number
  }
  answeredCount: number
  onDismiss: () => void
}

export function FunnelCard({
  category,
  form,
  answeredCount,
  onDismiss,
}: FunnelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card padding="lg" className="text-center space-y-6">
        {/* Celebration */}
        <div className="text-6xl">✨</div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-2xl font-medium text-foreground">
            Nice streak!
          </h3>
          <p className="text-muted">
            You've answered {answeredCount} questions about{' '}
            <span className="text-accent font-medium">{category.name}</span>
          </p>
        </div>

        {/* Form invitation */}
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 space-y-3">
          <p className="text-sm text-muted">
            Want to go deeper?
          </p>
          <div className="space-y-1">
            <h4 className="text-lg font-medium text-foreground">
              {form.name}
            </h4>
            <p className="text-sm text-subtle">
              {form.estimatedMinutes} min form
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href={`/census/${category.slug}/${form.slug}`}>
            <Button variant="primary" fullWidth>
              Explore {category.name} →
            </Button>
          </Link>
          
          <Button variant="ghost" onClick={onDismiss} fullWidth>
            Continue prompts
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

