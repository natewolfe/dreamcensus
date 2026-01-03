import { Button } from '@/components/ui'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <span className="text-lg font-bold">DC</span>
            </div>
            <span className="text-lg font-semibold">Dream Census</span>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link href="/onboarding">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6">
            A ritual for understanding your dreams
          </h1>
          
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Capture, reflect, and connect with your inner life through a daily practice.
            Contribute to open research while maintaining complete privacy.
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <Link href="/onboarding">
              <Button size="lg">
                Get Started →
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-8 md:grid-cols-3 mt-20 text-left">
            <div>
              <div className="mb-3 text-4xl">🌅</div>
              <h3 className="text-lg font-semibold mb-2">Morning Mode</h3>
              <p className="text-sm text-muted">
                Low-stimulation, voice-first capture designed for the fragile moments after waking
              </p>
            </div>

            <div>
              <div className="mb-3 text-4xl">📊</div>
              <h3 className="text-lg font-semibold mb-2">Personal Insights</h3>
              <p className="text-sm text-muted">
                Track patterns, themes, and symbols in your dream life over time
              </p>
            </div>

            <div>
              <div className="mb-3 text-4xl">🔬</div>
              <h3 className="text-lg font-semibold mb-2">Research Grade</h3>
              <p className="text-sm text-muted">
                Opt-in to contribute to collective understanding with privacy-preserving aggregation
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted">
            <p>&copy; 2026 Dream Census. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

