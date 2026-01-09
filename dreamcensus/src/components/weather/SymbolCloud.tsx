'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { SymbolFrequency } from '@/lib/weather/types'

interface SymbolCloudProps {
  data: SymbolFrequency[]
  onSymbolClick?: (symbol: string) => void
}

export function SymbolCloud({ data, onSymbolClick }: SymbolCloudProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p className="text-sm">No symbols tagged yet</p>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  const getFontSize = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.7) return 'text-2xl'
    if (ratio > 0.4) return 'text-xl'
    if (ratio > 0.2) return 'text-lg'
    return 'text-base'
  }

  const getOpacity = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.7) return 'opacity-100'
    if (ratio > 0.4) return 'opacity-80'
    if (ratio > 0.2) return 'opacity-60'
    return 'opacity-40'
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {data.map((item, index) => (
        <motion.button
          key={item.symbol}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSymbolClick?.(item.symbol)}
          className={cn(
            getFontSize(item.count),
            getOpacity(item.count),
            'text-accent hover:text-accent/80 transition-all',
            'font-medium'
          )}
          title={`${item.symbol} (${item.count} times)`}
        >
          {item.symbol}
        </motion.button>
      ))}
    </div>
  )
}

