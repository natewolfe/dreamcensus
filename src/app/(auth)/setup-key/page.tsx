'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Button, Card, Input } from '@/components/ui'
import { deriveKeyFromPassphrase, generateSalt, exportKey } from '@/lib/encryption'
import { cn } from '@/lib/utils'

export default function SetupKeyPage() {
  const router = useRouter()
  const [step, setStep] = useState<'passphrase' | 'confirm' | 'recovery'>('passphrase')
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passphraseStrength = getPassphraseStrength(passphrase)
  const passphrasesMatch = passphrase === confirmPassphrase

  const handleCreateKey = async () => {
    if (passphraseStrength < 3) {
      setError('Please use a stronger passphrase')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Generate salt
      const salt = generateSalt()
      
      // Derive key
      const key = await deriveKeyFromPassphrase(passphrase, salt)
      
      // Export key for storage
      const keyBytes = await exportKey(key)
      
      // Store in sessionStorage (in production, use more secure storage)
      sessionStorage.setItem('encryption-key-v1', JSON.stringify(Array.from(keyBytes)))
      sessionStorage.setItem('encryption-salt', JSON.stringify(Array.from(salt)))
      
      // Generate recovery phrase (simplified - in production use BIP39)
      const recovery = generateRecoveryPhrase(keyBytes)
      setRecoveryPhrase(recovery)
      
      setStep('recovery')
    } catch (err) {
      console.error('Key setup failed:', err)
      setError('Failed to create encryption key')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleComplete = () => {
    router.push('/today')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {step === 'passphrase' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card padding="lg">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔐</div>
                  <h1 className="text-2xl font-medium text-foreground mb-2">
                    Create Encryption Key
                  </h1>
                  <p className="text-sm text-muted">
                    Your dreams will be encrypted with this passphrase
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
                    Passphrase
                  </label>
                  <Input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter a strong passphrase"
                  />
                  
                  {/* Strength indicator */}
                  {passphrase && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-colors',
                              level <= passphraseStrength
                                ? level <= 2 ? 'bg-red-500' : level === 3 ? 'bg-orange-500' : 'bg-green-500'
                                : 'bg-subtle'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {passphraseStrength === 1 && 'Weak'}
                        {passphraseStrength === 2 && 'Fair'}
                        {passphraseStrength === 3 && 'Good'}
                        {passphraseStrength === 4 && 'Strong'}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setStep('confirm')}
                  disabled={passphraseStrength < 3}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setStep('passphrase')}
                    className="text-muted hover:text-foreground transition-colors mb-4"
                  >
                    ← Back
                  </button>
                  
                  <h2 className="text-xl font-medium text-foreground mb-2">
                    Confirm Passphrase
                  </h2>
                  <p className="text-sm text-muted">
                    Type your passphrase again to confirm
                  </p>
                </div>

                <div>
                  <Input
                    type="password"
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    placeholder="Re-enter passphrase"
                  />
                  
                  {confirmPassphrase && !passphrasesMatch && (
                    <p className="text-xs text-red-500 mt-1">
                      Passphrases don't match
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleCreateKey}
                  disabled={!passphrasesMatch || isProcessing}
                  loading={isProcessing}
                >
                  Create Key
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'recovery' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card padding="lg">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📝</div>
                  <h2 className="text-xl font-medium text-foreground mb-2">
                    Save Recovery Phrase
                  </h2>
                  <p className="text-sm text-muted">
                    Write this down in a safe place. You'll need it to recover your key.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-subtle/10 border border-border">
                  {recoveryPhrase.map((word, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted w-6">{i + 1}.</span>
                      <span className="text-sm text-foreground font-mono">{word}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <p className="text-xs text-orange-400">
                    ⚠️ Never share this phrase. Anyone with it can decrypt your dreams.
                  </p>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleComplete}
                >
                  I've Saved It →
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function getPassphraseStrength(passphrase: string): number {
  if (passphrase.length < 8) return 1
  if (passphrase.length < 12) return 2
  if (passphrase.length < 16) return 3
  return 4
}

function generateRecoveryPhrase(keyBytes: Uint8Array): string[] {
  // Simplified recovery phrase generation
  // In production, use BIP39 or similar standard
  const words = [
    'dream', 'moon', 'star', 'cloud', 'night', 'sleep',
    'vision', 'memory', 'thought', 'wonder', 'magic', 'spirit',
  ]
  
  // Generate 12 words based on key bytes
  const phrase: string[] = []
  for (let i = 0; i < 12; i++) {
    const byte = keyBytes[i % keyBytes.length]
    if (byte !== undefined) {
      const index = byte % words.length
      const word = words[index]
      if (word) {
        phrase.push(word)
      }
    }
  }
  
  return phrase
}

