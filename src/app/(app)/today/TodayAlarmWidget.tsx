'use client'

import { useRouter } from 'next/navigation'
import { AlarmWidget } from '@/components/alarm'
import { useAlarm } from '@/hooks/use-alarm'
import { setAlarmArmed } from '../settings/alarm/actions'
import { useToast } from '@/hooks/use-toast'
import { formatAlarmTimeSplit } from '@/lib/alarm'

export function TodayAlarmWidget() {
  const router = useRouter()
  const { isArmed, nextAlarmTime, refreshAlarm } = useAlarm()
  const { toast } = useToast()

  const hasValidAlarm = !!nextAlarmTime
  
  // Format the time for display
  const formattedTime = nextAlarmTime 
    ? formatAlarmTimeSplit(new Date(nextAlarmTime)).time
    : null

  const handleToggle = async () => {
    const newArmed = !isArmed
    const result = await setAlarmArmed(newArmed)
    
    if (result.success) {
      await refreshAlarm()
      toast.success(newArmed ? 'Alarm armed' : 'Alarm disarmed')
      
      // Navigate to settings only when arming
      if (newArmed) {
        router.push('/settings/alarm')
      }
    } else {
      toast.error(result.error)
    }
  }

  return (
    <AlarmWidget
      isArmed={isArmed}
      nextAlarmTime={formattedTime}
      hasValidAlarm={hasValidAlarm}
      onToggle={handleToggle}
    />
  )
}
