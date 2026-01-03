import Link from 'next/link'
import { PageHeader } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { TodayClient } from './TodayClient'
import { getTimeGreeting } from '@/lib/utils'
import { getStreak, getWeekDreams } from './actions'

export default async function TodayPage() {
  const greeting = getTimeGreeting()
  const today = new Date()

  // Get prompt stream stats (mock for now)
  const promptsAnswered = 0 // TODO: Get from CategoryProgress after migration

  // Fetch streak and week data
  const [streakCount, weekDreams] = await Promise.all([
    getStreak(),
    getWeekDreams(),
  ])

  // Week days starting Monday
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1

  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      {/* Week Summary — constellation-style tracker */}
      <section className="mb-8" aria-label="Weekly dream tracking">
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Day nodes with connecting track */}
          <div className="relative flex flex-1 items-start justify-between px-1 sm:px-3">
            {/* Track line — positioned to align with nodes */}
            <div 
              className="pointer-events-none absolute inset-x-6 sm:inset-x-8 h-px bg-gradient-to-r from-transparent via-constellation-edge to-transparent"
              style={{ top: 'calc(1rem + 14px + 6px)' }} // label height + margin + half node
            />
            
            {weekDays.map((day, i) => {
              const isToday = i === todayIndex
              const isPast = i < todayIndex
              const hasDream = weekDreams[i]
              
              return (
                <div 
                  key={day} 
                  className="flex flex-col items-center min-w-[2rem] sm:min-w-[2.5rem]"
                >
                  {/* Day label */}
                  <span 
                    className={`mb-3.5 text-[11px] tracking-wide select-none transition-colors duration-200 ${
                      isToday 
                        ? 'font-semibold text-foreground' 
                        : isPast 
                          ? 'font-normal text-muted/60' 
                          : 'font-normal text-subtle/50'
                    }`}
                  >
                    <span className="sm:hidden">{day.charAt(0)}</span>
                    <span className="hidden sm:inline">{day}</span>
                  </span>
                  
                  {/* Node container */}
                  <div className="relative flex h-3 w-3 items-center justify-center">
                    {/* Today's ambient glow */}
                    {isToday && (
                      <div 
                        className="absolute h-8 w-8 animate-pulse rounded-full"
                        style={{ 
                          background: 'radial-gradient(circle, var(--constellation-pulse) 0%, transparent 70%)',
                          animationDuration: '3s'
                        }}
                      />
                    )}
                    
                    {/* Outer ring for today */}
                    {isToday && (
                      <div className="absolute h-5 w-5 rounded-full border border-constellation-edge" />
                    )}
                    
                    {/* Core node */}
                    <div
                      className={`relative z-10 rounded-full transition-all duration-300 ${
                        isToday
                          ? 'h-2.5 w-2.5 bg-constellation-node shadow-[0_0_10px_var(--constellation-node)]'
                          : hasDream
                            ? 'h-2 w-2 bg-constellation-node/70'
                            : isPast
                              ? 'h-1.5 w-1.5 bg-subtle/40'
                              : 'h-1.5 w-1.5 bg-border/80'
                      }`}
                    />
                  </div>
                  
                  {/* "Today" indicator */}
                  {isToday && (
                    <span className="mt-3 text-[9px] font-medium tracking-[0.15em] uppercase text-constellation-node/70">
                      today
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Streak counter — right side, prominent */}
          <div className="flex flex-col items-center pr-1 sm:pr-2">
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted/60">
              Streak
            </span>
            {streakCount > 0 ? (
              <>
                <span className="mt-1 text-2xl sm:text-3xl font-medium tabular-nums text-foreground">
                  {streakCount}
                </span>
                <span className="mt-0.5 text-[10px] tracking-wide text-subtle/70">
                  {streakCount === 1 ? 'day' : 'days'}
                </span>
              </>
            ) : (
              <span className="mt-1.5 text-xs text-muted/60 leading-tight text-center max-w-[4rem]">
                Start today
              </span>
            )}
          </div>
        </div>
      </section>

      <PageHeader
        title={greeting}
        subtitle={today.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      />

      <div className="space-y-6">
        {/* Morning Mode Tile */}
        <Link href="/today/morning" className="block">
          <Card variant="interactive" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 text-2xl">🌅</div>
                <h2 className="text-xl font-semibold">Morning</h2>
                <p className="mt-1 text-muted">Capture your dreams</p>
              </div>
              <span className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
                Begin →
              </span>
            </div>
          </Card>
        </Link>

        {/* Prompt Stream Tile */}
        <TodayClient promptsAnswered={promptsAnswered} />

        {/* Night Mode Tile */}
        <Link href="/today/night" className="block">
          <Card variant="interactive" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 text-2xl">🌙</div>
                <h2 className="text-xl font-semibold">Tonight</h2>
                <p className="mt-1 text-muted">Set an intention for tonight's dreams</p>
              </div>
              <span className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
                Begin →
              </span>
            </div>
          </Card>
        </Link>

        {/* Mini Weather Preview */}
        <Card variant="ghost" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted mb-1">
                Dream Weather
              </h3>
              <p className="text-xs text-subtle">
                Capture more dreams to see patterns
              </p>
            </div>
            <Link href="/weather">
              <Button variant="ghost" size="sm">
                View →
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

