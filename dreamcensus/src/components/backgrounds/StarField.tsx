'use client'

import { useRef, useEffect } from 'react'
import { useEnhancedAnimations } from '@/hooks/use-enhanced-animations'
import { useTheme } from '@/hooks/use-theme'

interface Star {
  x: number
  y: number
  size: number
  baseOpacity: number
  opacity: number
  twinklePhase: number
  twinkleSpeed: number
  driftX: number
  driftY: number
}

export function StarField() {
  const showEffects = useEnhancedAnimations()
  const { resolved } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationFrameRef = useRef<number>()
  const lastFrameTime = useRef<number>(0)

  // Determine if stars should be visible
  const shouldShow = showEffects && ['night', 'dusk'].includes(resolved)

  // All hooks must be called unconditionally (Rules of Hooks)
  useEffect(() => {
    // Bail early if not showing
    if (!shouldShow) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()

    // Initialize stars
    const initStars = () => {
      const starCount = Math.floor((canvas.width * canvas.height) / 20000) // Density-based count
      const stars: Star[] = []

      for (let i = 0; i < Math.max(40, Math.min(60, starCount)); i++) {
        const baseOpacity = 0.3 + Math.random() * 0.5
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 1 + Math.random(),
          baseOpacity,
          opacity: baseOpacity,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.5 + Math.random() * 0.5,
          driftX: (Math.random() - 0.5) * 0.02,
          driftY: (Math.random() - 0.5) * 0.02,
        })
      }

      starsRef.current = stars
    }

    initStars()

    // Animation loop (30 fps)
    const animate = (currentTime: number) => {
      if (!lastFrameTime.current) {
        lastFrameTime.current = currentTime
      }

      // Throttle to ~30fps
      const elapsed = currentTime - lastFrameTime.current
      if (elapsed < 33) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      lastFrameTime.current = currentTime

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Update twinkle
        star.twinklePhase += star.twinkleSpeed * 0.02
        star.opacity = star.baseOpacity + Math.sin(star.twinklePhase) * 0.2

        // Update position (drift)
        star.x += star.driftX
        star.y += star.driftY

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate)

    // Pause when document is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      } else {
        lastFrameTime.current = 0
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Handle resize
    const handleResize = () => {
      updateSize()
      initStars()
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [shouldShow])

  // Only render for night/dusk themes
  if (!shouldShow) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-30"
      aria-hidden="true"
    />
  )
}
