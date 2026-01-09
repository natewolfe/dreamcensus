import { describe, it, expect } from 'vitest'
import { generateDeviceKey, encrypt, decrypt, exportKey, importKey } from '../encryption'

describe('encryption', () => {
  it('should generate a valid CryptoKey', async () => {
    const key = await generateDeviceKey()
    
    expect(key).toBeDefined()
    expect(key.type).toBe('secret')
    expect(key.algorithm.name).toBe('AES-GCM')
  })

  it('should encrypt and decrypt text successfully', async () => {
    const key = await generateDeviceKey()
    const plaintext = 'This is a test dream narrative'

    const { ciphertext, iv } = await encrypt(plaintext, key)

    expect(ciphertext).toBeDefined()
    expect(iv).toBeDefined()
    expect(ciphertext).not.toBe(plaintext)

    const decrypted = await decrypt(ciphertext, iv, key)
    expect(decrypted).toBe(plaintext)
  })

  it('should fail to decrypt with wrong key', async () => {
    const key1 = await generateDeviceKey()
    const key2 = await generateDeviceKey()
    const plaintext = 'Secret dream'

    const { ciphertext, iv } = await encrypt(plaintext, key1)

    await expect(decrypt(ciphertext, iv, key2)).rejects.toThrow()
  })

  it('should handle empty string encryption', async () => {
    const key = await generateDeviceKey()
    const plaintext = ''

    const { ciphertext, iv } = await encrypt(plaintext, key)
    const decrypted = await decrypt(ciphertext, iv, key)

    expect(decrypted).toBe('')
  })

  it('should handle Unicode content', async () => {
    const key = await generateDeviceKey()
    const plaintext = '夢の中で🌙✨ I was flying over 日本'

    const { ciphertext, iv } = await encrypt(plaintext, key)
    const decrypted = await decrypt(ciphertext, iv, key)

    expect(decrypted).toBe(plaintext)
  })

  it('should export and import key successfully', async () => {
    const originalKey = await generateDeviceKey()
    const plaintext = 'Test content'

    // Encrypt with original key
    const { ciphertext, iv } = await encrypt(plaintext, originalKey)

    // Export and reimport key
    const exportedBytes = await exportKey(originalKey)
    const importedKey = await importKey(exportedBytes)

    // Decrypt with imported key
    const decrypted = await decrypt(ciphertext, iv, importedKey)
    expect(decrypted).toBe(plaintext)
  })

  it('should produce different ciphertext for same plaintext', async () => {
    const key = await generateDeviceKey()
    const plaintext = 'Same content'

    const result1 = await encrypt(plaintext, key)
    const result2 = await encrypt(plaintext, key)

    // Different IVs should produce different ciphertext
    expect(result1.ciphertext).not.toBe(result2.ciphertext)
    expect(result1.iv).not.toBe(result2.iv)

    // But both should decrypt to same plaintext
    const decrypted1 = await decrypt(result1.ciphertext, result1.iv, key)
    const decrypted2 = await decrypt(result2.ciphertext, result2.iv, key)
    expect(decrypted1).toBe(plaintext)
    expect(decrypted2).toBe(plaintext)
  })

  it('should handle long content', async () => {
    const key = await generateDeviceKey()
    const plaintext = 'A'.repeat(10000) // 10KB of text

    const { ciphertext, iv } = await encrypt(plaintext, key)
    const decrypted = await decrypt(ciphertext, iv, key)

    expect(decrypted).toBe(plaintext)
  })
})
