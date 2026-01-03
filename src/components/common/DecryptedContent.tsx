'use client'

import { useState, useEffect } from 'react'
import { Spinner } from '@/components/ui'
import { useEncryptionKey } from '@/hooks/use-encryption-key'
import { decrypt, decodeBase64 } from '@/lib/encryption'

interface DecryptedContentProps {
  ciphertext: string
  iv: string
  keyVersion: number
  fallback?: React.ReactNode
  children: (content: string) => React.ReactNode
}

export function DecryptedContent({
  ciphertext,
  iv,
  keyVersion,
  fallback,
  children,
}: DecryptedContentProps) {
  const { key, isLoading: keyLoading, error: keyError } = useEncryptionKey(keyVersion)
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!key) return

    const decryptContent = async () => {
      try {
        const ciphertextBytes = decodeBase64(ciphertext)
        const ivBytes = decodeBase64(iv)
        
        const decrypted = await decrypt(ciphertextBytes, ivBytes, key)
        setContent(decrypted)
        setError(null)
      } catch (err) {
        console.error('Decryption failed:', err)
        setError('Failed to decrypt content')
      }
    }

    decryptContent()
  }, [key, ciphertext, iv])

  if (keyLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (keyError || error) {
    return (
      fallback ?? (
        <div className="text-center py-8 text-muted">
          <div className="mb-2 text-2xl">🔒</div>
          <p className="text-sm">
            {keyError ?? error}
          </p>
        </div>
      )
    )
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  return <>{children(content)}</>
}

