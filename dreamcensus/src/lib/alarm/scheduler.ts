import type { AlarmScheduler } from './types'

/**
 * Web-based alarm scheduler (v1)
 * Uses setInterval for reliability in active tabs
 * 
 * Limitations:
 * - Only works when tab is active
 * - Browser throttling may delay trigger
 * 
 * Future: Can be swapped with PWA notifications or native alarms
 */
export function createWebScheduler(): AlarmScheduler {
  let checkInterval: NodeJS.Timeout | null = null
  let triggerCallback: (() => void) | null = null
  let targetTime: Date | null = null

  return {
    start(nextAlarmAt: Date) {
      // Cancel any existing alarm
      this.cancel()
      
      targetTime = nextAlarmAt
      
      // Check every 5 seconds
      checkInterval = setInterval(() => {
        if (!targetTime) return
        
        const now = new Date()
        
        // Trigger if we've reached or passed the target time
        if (now >= targetTime) {
          if (triggerCallback) {
            triggerCallback()
          }
          this.cancel()
        }
      }, 5000)
    },

    cancel() {
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }
      targetTime = null
    },

    onTrigger(callback: () => void) {
      triggerCallback = callback
    },
  }
}

/**
 * Get scheduler instance (singleton)
 */
let schedulerInstance: AlarmScheduler | null = null

export function getScheduler(): AlarmScheduler {
  if (!schedulerInstance) {
    schedulerInstance = createWebScheduler()
  }
  return schedulerInstance
}
