import { useContext } from 'react'
import { AlarmContext } from '@/providers/alarm-provider'

/**
 * Hook to access alarm context
 * Must be used within AlarmProvider
 */
export function useAlarm() {
  const context = useContext(AlarmContext)
  
  if (!context) {
    throw new Error('useAlarm must be used within AlarmProvider')
  }
  
  return context
}
