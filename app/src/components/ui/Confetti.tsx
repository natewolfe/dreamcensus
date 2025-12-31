'use client'

import { useEffect, useState } from 'react'

interface ConfettiProps {
  particleCount?: number
  duration?: number
}

export function Confetti({ particleCount = 50, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    left: number
    delay: number
    color: string
  }>>([])

  useEffect(() => {
    const colors = [
      'var(--accent)',
      'var(--accent-glow)',
      'var(--success)',
      'var(--warning)',
      '#ff6b9d',
      '#c4a2ff',
    ]

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 500,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    setParticles(newParticles)

    // Clean up after animation
    const timer = setTimeout(() => {
      setParticles([])
    }, duration)

    return () => clearTimeout(timer)
  }, [particleCount, duration])

  return (
    <div className="fixed inset-0 pointer-events-none z-[var(--z-modal)]" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti-particle absolute top-0"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}ms`,
            backgroundColor: particle.color,
          }}
        />
      ))}
    </div>
  )
}

