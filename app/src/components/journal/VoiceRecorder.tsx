'use client'

import { useState, useRef } from 'react'

interface VoiceRecorderProps {
  onComplete: (audioBlob: Blob, transcript?: string) => void
  onBack: () => void
}

export function VoiceRecorder({ onComplete, onBack }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleComplete = () => {
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      onComplete(blob)
    }
  }

  return (
    <div className="animate-fade-in max-w-md mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-medium mb-2">Voice Recording</h2>
        <p className="text-sm text-[var(--foreground-subtle)]">
          Record yourself describing your dream
        </p>
      </div>

      {/* Recording UI */}
      <div className="p-12 bg-[var(--background-elevated)] rounded-2xl border border-[var(--border)] text-center mb-6">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="w-24 h-24 rounded-full bg-[var(--accent)] text-white text-4xl hover:scale-110 transition-transform"
          >
            🎙️
          </button>
        )}

        {isRecording && (
          <div>
            <div className="w-24 h-24 rounded-full bg-[var(--error)] text-white text-4xl mx-auto mb-4 animate-pulse flex items-center justify-center">
              🎙️
            </div>
            <button
              onClick={stopRecording}
              className="btn btn-secondary"
            >
              Stop Recording
            </button>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <audio src={audioUrl} controls className="w-full mb-4" />
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setAudioUrl(null)
                  chunksRef.current = []
                }}
                className="btn btn-secondary"
              >
                Re-record
              </button>
              <button
                onClick={handleComplete}
                className="btn btn-primary"
              >
                Use Recording →
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-center text-[var(--foreground-subtle)]">
        Your recording stays on your device until you choose to save it
      </p>
    </div>
  )
}

