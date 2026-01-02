'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Card, Button } from '@/components/ui'

type RitualType = 'morning' | 'evening' | 'default'

function getRitualType(hour: number): RitualType {
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 20 || hour < 2) return 'evening'
  return 'default'
}

interface RitualPromptProps {
  hasDreamsToday?: boolean
}

export function RitualPrompt({ hasDreamsToday = false }: RitualPromptProps) {
  const [ritualType, setRitualType] = useState<RitualType>('default')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    setRitualType(getRitualType(hour))
  }, [])

  if (!mounted) return null

  const renderMorningRitual = () => (
    <Card variant="glass" className="border-2 border-[var(--accent)]/30">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-4xl mb-3">🌅</div>
        <h3 className="text-xl font-medium mb-2">Good morning</h3>
        <p className="text-[var(--foreground-muted)] mb-4">
          {hasDreamsToday 
            ? "Welcome back! Ready to capture today's dreams?"
            : "Did you dream last night?"
          }
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/journal/capture">
            <Button variant="primary">
              Capture Dream
            </Button>
          </Link>
          {!hasDreamsToday && (
            <Button variant="secondary">
              I don't remember
            </Button>
          )}
        </div>
      </motion.div>
    </Card>
  )

  const renderEveningRitual = () => (
    <Card variant="glass" className="border-2 border-[var(--accent)]/30">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-4xl mb-3">🌙</div>
        <h3 className="text-xl font-medium mb-2">Good evening</h3>
        <p className="text-[var(--foreground-muted)] mb-4">
          Set an intention for tonight's dreams
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/ritual/evening">
            <Button variant="primary">
              Evening Ritual
            </Button>
          </Link>
          <Link href="/census/cards">
            <Button variant="secondary">
              Answer Questions
            </Button>
          </Link>
        </div>
      </motion.div>
    </Card>
  )

  switch (ritualType) {
    case 'morning':
      return renderMorningRitual()
    case 'evening':
      return renderEveningRitual()
    default:
      // No ritual prompt during the day - CensusProgressCard handles census progress
      return null
  }
}
