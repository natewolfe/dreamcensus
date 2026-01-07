'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

type TimeOfDay = 'morning' | 'day' | 'evening' | 'night'

interface FABProps {
  timeOfDay: TimeOfDay
  onPrimaryAction: () => void
  onLongPress?: () => void
}

const FAB_ACTIONS: Record<TimeOfDay, { label: string; icon: string }> = {
  morning: { label: 'Log Dream', icon: '🌅' },
  day: { label: 'New Entry', icon: '+' },
  evening: { label: 'Pre-sleep', icon: '🌙' },
  night: { label: 'Pre-sleep', icon: '🌙' },
}

const QUICK_MENU_ITEMS = [
  { label: 'Dream entry (voice)', icon: '🎤', action: 'voice' },
  { label: 'Dream entry (text)', icon: '✏️', action: 'text' },
  { label: 'Quick check-in', icon: '💭', action: 'checkin' },
  { label: 'Prompt reflection', icon: '📝', action: 'prompt' },
]

export function FAB({ timeOfDay, onPrimaryAction, onLongPress }: FABProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  
  const action = FAB_ACTIONS[timeOfDay]

  const handleMouseDown = () => {
    if (!onLongPress) return
    
    const timer = setTimeout(() => {
      setShowMenu(true)
    }, 500)
    
    setLongPressTimer(timer)
  }

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    
    if (!showMenu) {
      onPrimaryAction()
    }
  }

  const handleMenuItemClick = (_itemAction: string) => {
    setShowMenu(false)
    // In production, route based on action
    onPrimaryAction()
  }

  return (
    <>
      {/* Quick Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-4 z-50 w-64 rounded-xl bg-card-bg border border-border shadow-xl overflow-hidden"
            >
              {QUICK_MENU_ITEMS.map((item, index) => (
                <motion.button
                  key={item.action}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleMenuItemClick(item.action)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-subtle/30 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-foreground">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (longPressTimer) {
            clearTimeout(longPressTimer)
            setLongPressTimer(null)
          }
        }}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-20 right-4 z-30',
          'w-14 h-14 rounded-full',
          'bg-accent text-foreground',
          'flex items-center justify-center',
          'shadow-lg shadow-accent/30',
          'transition-all'
        )}
        aria-label={action.label}
      >
        <span className="text-2xl">{action.icon}</span>
      </motion.button>
    </>
  )
}

