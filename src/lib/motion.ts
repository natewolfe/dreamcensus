/**
 * Shared motion/framer-motion animation variants
 * Ensures consistent animations across the application
 */

import type { Variants } from 'motion/react'

/**
 * Horizontal slide animation for flow navigation
 * Used in FlowCard, FormRunner, and other step-based flows
 */
export const slideVariants: Variants = {
  enter: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? 50 : -50,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? -50 : 50,
  }),
}

/**
 * Standard slide transition configuration
 */
export const slideTransition = {
  duration: 0.3,
  ease: 'easeInOut' as const,
}

/**
 * Fade in with upward motion
 * Used for cards, list items, and page elements
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
}

/**
 * Fade in with larger upward motion
 * Used for section headers and major page elements
 */
export const fadeInUpLarge: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
}

/**
 * Simple fade in
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
}

/**
 * Stagger children animation container
 * Use with staggerChildren in transition
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

/**
 * Scale and fade for interactive elements
 */
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
}

/**
 * Hover scale for cards and interactive elements
 */
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 },
}

/**
 * Tap scale for buttons and interactive elements
 */
export const tapScale = {
  scale: 0.98,
}
