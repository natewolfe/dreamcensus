import { useRef, useCallback, useEffect } from 'react'

export interface UseDebouncedCallbackOptions {
  /** Delay in ms before callback fires (default: 500) */
  delay?: number
  /** If true, flush pending call on unmount (default: true) */
  flushOnUnmount?: boolean
}

/**
 * Returns a debounced version of a callback.
 * Cancels pending calls when a new call is made.
 * Useful for auto-save, search inputs, sliders, etc.
 * 
 * @example
 * const [debouncedSave] = useDebouncedCallback(
 *   async (value: string) => await saveToServer(value),
 *   { delay: 500 }
 * )
 * 
 * // Call debouncedSave on each change - only fires after 500ms of no calls
 * onChange={(e) => debouncedSave(e.target.value)}
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  { delay = 500, flushOnUnmount = true }: UseDebouncedCallbackOptions = {}
): [(...args: Parameters<T>) => void, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingArgsRef = useRef<Parameters<T> | null>(null)
  const callbackRef = useRef(callback)

  // Keep callback ref fresh
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    pendingArgsRef.current = null
  }, [])

  const flush = useCallback(() => {
    if (timeoutRef.current && pendingArgsRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      callbackRef.current(...pendingArgsRef.current)
      pendingArgsRef.current = null
    }
  }, [])

  const debouncedFn = useCallback((...args: Parameters<T>) => {
    cancel()
    pendingArgsRef.current = args
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
      pendingArgsRef.current = null
      timeoutRef.current = null
    }, delay)
  }, [delay, cancel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushOnUnmount) {
        flush()
      } else {
        cancel()
      }
    }
  }, [flush, cancel, flushOnUnmount])

  return [debouncedFn, cancel]
}
