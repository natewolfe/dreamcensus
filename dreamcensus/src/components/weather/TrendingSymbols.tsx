import Link from 'next/link'
import { Card } from '@/components/ui'
import type { SymbolFrequency } from '@/lib/weather/types'

interface TrendingSymbolsProps {
  symbols: SymbolFrequency[]
}

export function TrendingSymbols({ symbols }: TrendingSymbolsProps) {
  if (symbols.length === 0) {
    return (
      <Card padding="lg">
        <h3 className="text-lg font-medium text-foreground mb-4">Trending Symbols</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏷️</div>
          <p className="text-sm text-muted">
            Symbol data will appear once dreams with tags are captured
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card padding="lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-foreground">Trending Symbols</h3>
          <p className="text-sm text-muted">Most common dream symbols in our community</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {symbols.slice(0, 20).map((symbol) => (
            <Link
              key={symbol.symbol}
              href={`/journal?symbol=${encodeURIComponent(symbol.symbol)}`}
              className="px-3 py-1.5 bg-subtle/30 rounded-full hover:bg-accent/20 transition-colors text-sm"
            >
              <span className="text-foreground">{symbol.symbol}</span>
              <span className="text-muted ml-1.5">({symbol.count})</span>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  )
}

