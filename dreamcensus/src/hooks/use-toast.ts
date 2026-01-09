import { useContext } from 'react'
import { ToastContext } from '@/providers/toast-provider'

/**
 * Hook to trigger toast notifications
 * 
 * @example
 * const { toast } = useToast()
 * 
 * toast.success('Dream saved!')
 * toast.error('Failed to save dream')
 * toast.warning('You have unsaved changes')
 * toast.info('Tip: Use voice capture for faster entry')
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}

