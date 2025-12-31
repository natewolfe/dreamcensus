'use client'

import { useRef, useEffect, useState } from 'react'

interface DrawingCanvasProps {
  onComplete: (dataUrl: string) => void
  onBack: () => void
}

export function DrawingCanvas({ onComplete, onBack }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#b093ff')
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set background
    ctx.fillStyle = '#1a1e3a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineWidth = tool === 'pen' ? 3 : 20
    ctx.lineCap = 'round'
    ctx.strokeStyle = tool === 'pen' ? color : '#1a1e3a'

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#1a1e3a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleComplete = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    onComplete(dataUrl)
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-medium mb-2">Draw Your Dream</h2>
        <p className="text-sm text-[var(--foreground-subtle)]">
          Sketch what you remember
        </p>
      </div>

      {/* Tools */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTool('pen')}
          className={`px-4 py-2 rounded-lg ${tool === 'pen' ? 'bg-[var(--accent)]' : 'bg-[var(--background-elevated)] border border-[var(--border)]'}`}
        >
          ✏️ Pen
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`px-4 py-2 rounded-lg ${tool === 'eraser' ? 'bg-[var(--accent)]' : 'bg-[var(--background-elevated)] border border-[var(--border)]'}`}
        >
          🧹 Eraser
        </button>
        <div className="flex gap-2 ml-auto">
          {['#b093ff', '#c4a2ff', '#69f0ae', '#ffd54f', '#ff5252'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--background)]' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          onClick={clear}
          className="px-4 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)]"
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-[400px] border border-[var(--border)] rounded-xl cursor-crosshair mb-6"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={clear} className="flex-1 btn btn-secondary">
          Clear
        </button>
        <button onClick={handleComplete} className="flex-1 btn btn-primary">
          Save Drawing →
        </button>
      </div>
    </div>
  )
}

