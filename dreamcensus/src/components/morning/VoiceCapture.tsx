'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { Button, FlowCard } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { VoiceCaptureProps, VoiceCaptureState } from './types'

export function VoiceCapture({ 
  globalStep,
  totalSteps,
  onComplete, 
  onCancel,
  onSkip,
  maxDuration = 300 
}: VoiceCaptureProps) {
  const [state, setState] = useState<VoiceCaptureState>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const streamRef = useRef<MediaStream | null>(null)

  // Check browser support
  const isSpeechSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechSupported) {
      setError('Voice recording is not supported in this browser')
      setState('error')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'
    
    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      
      if (final) {
        setTranscript(prev => prev + final)
      }
      setInterimTranscript(interim)
    }
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied')
      } else if (event.error === 'no-speech') {
        // Ignore no-speech errors, just restart
        return
      } else {
        setError('An error occurred during recording')
      }
      setState('error')
    }
    
    recognition.onend = () => {
      // Restart if still recording
      if (state === 'recording' && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          // Ignore if already started
        }
      }
    }
    
    recognitionRef.current = recognition
    
    return () => {
      recognition.stop()
    }
  }, [isSpeechSupported, state])

  // Request microphone permission
  const requestPermission = async () => {
    setState('permission')
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      // Set up MediaRecorder for audio backup
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }
      mediaRecorderRef.current = mediaRecorder
      
      setState('ready')
    } catch (err) {
      console.error('Microphone permission denied:', err)
      setError('Microphone access is required for voice recording')
      setState('error')
    }
  }

  // Start recording
  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return
    
    setTranscript('')
    setInterimTranscript('')
    setDuration(0)
    audioChunksRef.current = []
    
    try {
      recognitionRef.current.start()
      mediaRecorderRef.current?.start()
      setState('recording')
      
      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Failed to start recording')
      setState('error')
    }
  }, [maxDuration])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    recognitionRef.current?.stop()
    mediaRecorderRef.current?.stop()
    
    setState('complete')
  }, [])

  // Handle done
  const handleDone = () => {
    const finalTranscript = transcript.trim()
    if (finalTranscript) {
      // Create audio blob if available
      const audioBlob = audioChunksRef.current.length > 0
        ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
        : undefined
      
      onComplete(finalTranscript, audioBlob)
    }
  }

  // Clean up
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const fullTranscript = transcript + interimTranscript
  const canSubmit = transcript.trim().length > 0

  // Error state
  if (state === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center"
      >
        <div className="mb-6 text-4xl">⚠️</div>
        <h2 className="mb-2 text-xl font-medium text-foreground">
          Voice Recording Unavailable
        </h2>
        <p className="mb-6 text-muted">
          {error || 'Please try using text input instead.'}
        </p>
        <Button variant="secondary" onClick={onCancel}>
          Use Text Instead
        </Button>
      </motion.div>
    )
  }

  // Initial / permission state
  if (state === 'idle' || state === 'permission') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">🎤</div>
          <h2 className="mb-2 text-xl font-medium text-foreground">
            Voice Recording
          </h2>
          <p className="text-muted">
            Tap to allow microphone access
          </p>
        </div>
        
        <Button
          variant="primary"
          size="lg"
          onClick={requestPermission}
          loading={state === 'permission'}
        >
          {state === 'permission' ? 'Requesting...' : 'Allow Microphone'}
        </Button>
        
        <button
          onClick={onCancel}
          className="mt-6 text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    )
  }

  // Ready state
  if (state === 'ready') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8"
      >
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-medium text-foreground">
            Ready to Record
          </h2>
          <p className="text-muted">
            Tap the button and start speaking
          </p>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startRecording}
          className={cn(
            'h-24 w-24 rounded-full bg-accent text-foreground',
            'flex items-center justify-center text-3xl',
            'shadow-lg shadow-accent/30',
            'transition-all hover:brightness-110'
          )}
          aria-label="Start recording"
        >
          🎤
        </motion.button>
        
        <button
          onClick={onCancel}
          className="mt-8 text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    )
  }

  // Recording / Complete state - use FlowCard for consistency
  return (
    <FlowCard
      currentStep={globalStep}
      totalSteps={totalSteps}
      direction="forward"
      title={state === 'recording' ? 'Recording...' : 'Review your recording'}
      subtitle={`${formatDuration(duration)} recorded`}
      stepKey={`voice-${state}`}
      isValid={canSubmit}
      skipBehavior="optional"
      isLastStep={false}
      onNext={canSubmit ? handleDone : (onSkip ?? handleDone)}
      onBack={onCancel}
      onSkip={onSkip}
      canGoBack={true}
      canGoForward={true}
    >
      <div className="w-full space-y-4">

        {/* Waveform visualization placeholder */}
        <div className="h-16 rounded-lg bg-subtle/30 border border-border overflow-hidden">
          <div className="flex h-full items-center justify-center gap-1">
            {state === 'recording' ? (
              Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-accent rounded-full"
                  animate={{
                    height: [8, 24 + Math.random() * 16, 8],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))
            ) : (
              <span className="text-muted text-sm">Recording complete</span>
            )}
          </div>
        </div>

        {/* Transcript */}
        <div className={cn(
          'min-h-[150px] rounded-xl border border-border bg-subtle/30 p-4',
          isEditing && 'ring-1 ring-accent'
        )}>
          {isEditing ? (
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-full min-h-[130px] bg-transparent text-foreground resize-none focus:outline-none"
              placeholder="Your transcription will appear here..."
            />
          ) : (
            <>
              <p className="text-foreground whitespace-pre-wrap">
                {fullTranscript || (
                  <span className="text-muted">
                    {state === 'recording' 
                      ? 'Listening...' 
                      : 'Your transcription will appear here...'}
                  </span>
                )}
              </p>
              {transcript && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 text-sm text-accent hover:underline"
                >
                  Edit ✏️
                </button>
              )}
            </>
          )}
        </div>

        {/* Recording controls - shown when actively recording */}
        {state === 'recording' && (
          <div className="flex flex-col items-center gap-4 pt-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className={cn(
                'h-16 w-16 rounded-full bg-red-500 text-foreground',
                'flex items-center justify-center',
                'shadow-lg animate-pulse'
              )}
              aria-label="Stop recording"
            >
              <div className="h-6 w-6 rounded bg-white" />
            </motion.button>
            <p className="text-xs text-subtle">Tap to stop recording</p>
          </div>
        )}
      </div>
    </FlowCard>
  )
}


