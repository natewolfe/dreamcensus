'use client'

import { useState, useEffect } from 'react'
import { importKey } from '@/lib/encryption'

interface UseEncryptionKeyResult {
  key: CryptoKey | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook to get encryption key for a specific version
 * Key is stored in sessionStorage (in production, use more secure storage)
 */
export function useEncryptionKey(keyVersion: number): UseEncryptionKeyResult {
  const [key, setKey] = useState<CryptoKey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadKey = async () => {
      try {
        // Get key from session storage
        const keyData = sessionStorage.getItem(`encryption-key-v${keyVersion}`)
        
        if (!keyData) {
          setError('Encryption key not available')
          setIsLoading(false)
          return
        }

        // Parse and import key
        const keyBytes = new Uint8Array(JSON.parse(keyData))
        const cryptoKey = await importKey(keyBytes)
        
        setKey(cryptoKey)
        setError(null)
      } catch (err) {
        console.error('Failed to load encryption key:', err)
        setError('Failed to load encryption key')
      } finally {
        setIsLoading(false)
      }
    }

    loadKey()
  }, [keyVersion])

  return { key, isLoading, error }
}

/**
 * Hook to check if encryption key is available
 */
export function useHasEncryptionKey(): boolean {
  const [hasKey, setHasKey] = useState(false)

  useEffect(() => {
    // Check if any encryption key exists
    const keyV1 = sessionStorage.getItem('encryption-key-v1')
    setHasKey(!!keyV1)
  }, [])

  return hasKey
}

