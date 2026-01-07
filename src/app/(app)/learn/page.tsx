import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui'
import Link from 'next/link'
import type { DreamSchoolTopic } from '@/components/school/types'

const ALL_TOPICS: DreamSchoolTopic[] = [
  {
    id: 'lucid-dreaming',
    title: 'Lucid Dreaming',
    subtitle: 'Becoming aware in dreams',
    icon: '✨',
    color: 'from-violet-500/20 to-purple-600/10',
    href: '/learn/lucid-dreaming',
  },
  {
    id: 'dream-recall',
    title: 'Better Recall',
    subtitle: 'Remember more dreams',
    icon: '🧠',
    color: 'from-cyan-500/20 to-teal-600/10',
    href: '/learn/recall',
  },
  {
    id: 'sleep-science',
    title: 'Sleep Science',
    subtitle: 'How dreams work',
    icon: '🔬',
    color: 'from-amber-500/20 to-orange-600/10',
    href: '/learn/science',
  },
  {
    id: 'sleep-paralysis',
    title: 'Sleep Paralysis',
    subtitle: 'Understanding the phenomenon',
    icon: '🌀',
    color: 'from-indigo-500/20 to-blue-600/10',
    href: '/learn/sleep-paralysis',
  },
  {
    id: 'dream-interpretation',
    title: 'Interpretation',
    subtitle: 'Meaning in your dreams',
    icon: '🔮',
    color: 'from-purple-500/20 to-pink-600/10',
    href: '/learn/interpretation',
  },
  {
    id: 'rem-sleep',
    title: 'REM Sleep',
    subtitle: 'The science of dreaming',
    icon: '💤',
    color: 'from-blue-500/20 to-cyan-600/10',
    href: '/learn/rem-sleep',
  },
]

export default function LearnPage() {
  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 md:px-6 py-8 md:pb-16">
      <PageHeader
        title="Dream School"
        subtitle="Learn about sleep, dreams, and more"
      />

      <div className="space-y-8">
        {/* Introduction */}
        <Card padding="lg" className="bg-gradient-to-br from-accent/5 to-transparent">
          <span className="text-muted leading-relaxed">
            Explore research-based knowledge about dreaming, sleep science, consciousness, 
            lucid dreaming techniques, and practical tips to improve your dream recall and 
            understanding.
          </span>
        </Card>

        {/* Topics Grid */}
        <section aria-label="Learning topics" className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Topics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_TOPICS.map((topic) => (
              <Link key={topic.id} href={topic.href}>
                <Card 
                  padding="sm" 
                  variant="interactive"
                  className="h-full"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{topic.icon}</span>
                      <div className="flex-1">
                        <span className="block text-base font-semibold text-foreground mb-1">
                          {topic.title}
                        </span>
                        <span className="block text-sm text-muted">
                          {topic.subtitle}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-end justify-end mt-auto pt-2 w-full border-t border-border/50">
                      <span className="text-sm text-accent hover:text-accent/80 transition-colors duration-300">
                        Explore →
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <Card padding="lg" variant="ghost">
          <div className="text-center py-8">
            <p className="text-sm text-muted mb-2">
              📚 More articles and resources coming soon
            </p>
            <p className="text-xs text-subtle">
              We're building a comprehensive library of dream science and practical guides
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

