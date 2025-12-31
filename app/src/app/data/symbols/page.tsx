import { Suspense } from 'react'
import { AppShell } from '@/components/layout'
import { getSymbolFrequency } from '@/lib/data/aggregates'

export const metadata = {
  title: 'Symbol Browser | Dream Census',
  description: 'Explore dream symbol taxonomy',
}

async function SymbolsContent() {
  const symbols = await getSymbolFrequency()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-medium mb-8" style={{ fontFamily: 'var(--font-family-display)' }}>
        Dream Symbols
      </h1>

      {symbols.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {symbols.map((symbol) => (
            <div
              key={symbol.name}
              className="p-6 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-all"
            >
              <div className="text-2xl font-medium mb-1">{symbol.name}</div>
              <div className="text-sm text-[var(--foreground-subtle)]">
                {symbol.count} dreams
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏷️</div>
          <h2 className="text-2xl font-medium mb-2">No Symbols Yet</h2>
          <p className="text-[var(--foreground-muted)]">
            Symbols will appear as dreams are analyzed
          </p>
        </div>
      )}
    </div>
  )
}

export default function DataSymbolsPage() {
  return (
    <AppShell activeNav="data">
      <Suspense
        fallback={
          <div className="text-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto" />
          </div>
        }
      >
        <SymbolsContent />
      </Suspense>
    </AppShell>
  )
}

