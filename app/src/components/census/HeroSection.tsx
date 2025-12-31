import { DreamParticles } from '@/components/ui/DreamParticles'

interface HeroSectionProps {
  isReturning: boolean
  userName?: string | null
  totalDreamers?: number
}

export function HeroSection({ isReturning, userName, totalDreamers = 5000 }: HeroSectionProps) {
  return (
    <section className="relative py-16 text-center overflow-hidden">
      {/* Animated dream particles background */}
      <DreamParticles />
      
      <div className="relative z-10">
        {isReturning ? (
          <>
            <h1 className="text-4xl md:text-5xl font-medium mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>
              Welcome back{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto">
              Continue exploring the landscape of your inner world.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-medium mb-4" style={{ fontFamily: 'var(--font-family-display)' }}>
              Explore Your Dream Life
            </h1>
            <p className="text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto">
              A journey through 8 realms of sleep, dreams, and imagination. 
              No right answers—just honest reflection.
            </p>
            <div className="mt-6 text-sm text-[var(--foreground-subtle)]">
              🌙 Join {totalDreamers.toLocaleString()}+ dreamers who've taken the census
            </div>
          </>
        )}
      </div>
    </section>
  )
}

