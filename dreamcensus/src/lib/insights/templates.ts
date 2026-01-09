import type { InsightTemplate, InsightData } from './types'

/**
 * Pool of insight templates evaluated against user data
 * Templates are evaluated in order; all passing templates are sorted by priority
 */
export const INSIGHT_TEMPLATES: InsightTemplate[] = [
  // === WEATHER CONDITION ===
  {
    id: 'weather-radiant',
    category: 'weather',
    condition: (d) => d.chart?.current.condition === 'radiant',
    priority: () => 85,
    label: 'Dream Weather',
    message: () => 'Your dreams have been remarkably positive lately',
  },
  {
    id: 'weather-stormy',
    category: 'weather',
    condition: (d) => d.chart?.current.condition === 'stormy',
    priority: () => 80,
    label: 'Dream Weather',
    message: () => 'Your dreams have been more turbulent — this is often a time of processing',
  },
  {
    id: 'weather-cloudy',
    category: 'weather',
    condition: (d) => d.chart?.current.condition === 'cloudy',
    priority: () => 65,
    label: 'Dream Weather',
    message: () => 'Your dreams have been mixed lately — reflecting life\'s complexity',
  },
  {
    id: 'weather-pleasant',
    category: 'weather',
    condition: (d) => d.chart?.current.condition === 'pleasant',
    priority: () => 70,
    label: 'Dream Weather',
    message: () => 'Your dreams have a pleasant quality this week',
  },
  {
    id: 'weather-calm',
    category: 'weather',
    condition: (d) => d.chart?.current.condition === 'calm',
    priority: () => 60,
    label: 'Dream Weather',
    message: () => 'Your dream landscape has been calm and neutral',
  },

  // === TRENDS ===
  {
    id: 'trend-rising',
    category: 'weather',
    condition: (d) => d.chart?.current.trend === 'rising',
    priority: () => 75,
    label: 'Trend',
    message: () => 'Your dream clarity is improving this week',
  },
  {
    id: 'trend-falling',
    category: 'weather',
    condition: (d) => d.chart?.current.trend === 'falling',
    priority: () => 70,
    label: 'Trend',
    message: () => 'Your dream clarity has dipped — consider focusing on sleep quality',
  },
  {
    id: 'trend-stable',
    category: 'weather',
    condition: (d) => d.chart?.current.trend === 'stable',
    priority: () => 45,
    label: 'Trend',
    message: () => 'Your dream patterns have been consistent',
  },

  // === EMOTIONS ===
  {
    id: 'emotion-dominant',
    category: 'emotion',
    condition: (d) => (d.personal?.emotions[0]?.percentage ?? 0) > 30,
    priority: (d) => 65 + Math.min((d.personal?.emotions[0]?.percentage ?? 0) / 5, 20),
    label: 'Emotional Theme',
    message: (d) => {
      const top = d.personal?.emotions[0]
      return `${capitalize(top?.emotion ?? 'calm')} has been your dominant dream emotion`
    },
  },
  {
    id: 'emotion-variety',
    category: 'emotion',
    condition: (d) => (d.personal?.emotions.length ?? 0) >= 5,
    priority: () => 55,
    label: 'Emotional Range',
    message: (d) => `You've experienced ${d.personal?.emotions.length} different emotions in your recent dreams`,
  },
  {
    id: 'emotion-joy-high',
    category: 'emotion',
    condition: (d) => {
      const joy = d.personal?.emotions.find(e => e.emotion === 'joy')
      return (joy?.percentage ?? 0) > 25
    },
    priority: () => 72,
    label: 'Joyful Dreams',
    message: () => 'Joy is appearing frequently in your dreams',
  },

  // === COMPARISONS (with collective) ===
  {
    id: 'compare-lucid-high',
    category: 'comparison',
    condition: (d) => {
      const personal = d.personal?.lucidPercentage ?? 0
      const collective = d.collective?.lucidPercentage ?? 10
      return personal > collective * 1.5 && personal > 5
    },
    priority: () => 78,
    label: 'Lucid Dreams',
    message: (d) => {
      const collective = d.collective?.lucidPercentage ?? 10
      return `You have more lucid dreams than ${Math.round(100 - collective)}% of dreamers`
    },
  },
  {
    id: 'compare-vivid',
    category: 'comparison',
    condition: (d) => {
      const personal = d.personal?.avgVividness ?? 50
      const collective = d.collective?.avgVividness ?? 50
      return personal > collective + 10
    },
    priority: () => 65,
    label: 'Vividness',
    message: () => 'Your dreams tend to be more vivid than the community average',
  },
  {
    id: 'trending-emotion-match',
    category: 'comparison',
    condition: (d) => {
      const userTop = d.personal?.emotions[0]?.emotion
      const collective = d.collective?.trendingEmotion
      return userTop === collective && !!userTop
    },
    priority: () => 72,
    label: 'Collective Sync',
    message: (d) => `You're resonating with the collective — "${d.collective?.trendingEmotion}" is trending community-wide`,
  },

  // === ACTIVITY ===
  {
    id: 'activity-prolific',
    category: 'activity',
    condition: (d) => (d.personal?.dreamCount ?? 0) >= 7,
    priority: (d) => 50 + Math.min((d.personal?.dreamCount ?? 0), 20),
    label: 'Dream Journal',
    message: (d) => `You've captured ${d.personal?.dreamCount} dreams this week — great consistency!`,
  },
  {
    id: 'activity-starting',
    category: 'activity',
    condition: (d) => {
      const count = d.personal?.dreamCount ?? 0
      return count >= 1 && count <= 3
    },
    priority: () => 45,
    label: 'Getting Started',
    message: () => 'You\'re building your dream journal — recall often improves with practice',
  },
  {
    id: 'streak-milestone-7',
    category: 'activity',
    condition: (d) => d.streakCount === 7,
    priority: () => 82,
    label: 'Milestone',
    message: () => 'One week streak! Consistency builds dream recall',
  },
  {
    id: 'streak-milestone-30',
    category: 'activity',
    condition: (d) => d.streakCount === 30,
    priority: () => 90,
    label: 'Major Milestone',
    message: () => '30-day streak achieved! Your dedication is remarkable',
  },

  // === MILESTONES ===
  {
    id: 'census-quarter',
    category: 'milestone',
    condition: (d) => d.censusProgress >= 25 && d.censusProgress < 50,
    priority: () => 60,
    label: 'Census Progress',
    message: () => 'You\'re a quarter through the Census — your insights help dream research!',
  },
  {
    id: 'census-half',
    category: 'milestone',
    condition: (d) => d.censusProgress >= 50 && d.censusProgress < 75,
    priority: () => 65,
    label: 'Census Milestone',
    message: () => 'Halfway through the Census! Your contributions are making a difference',
  },
  {
    id: 'census-almost',
    category: 'milestone',
    condition: (d) => d.censusProgress >= 75 && d.censusProgress < 100,
    priority: () => 70,
    label: 'Almost There',
    message: (d) => `Just ${d.censusTotal - d.censusAnswered} questions left in the Census`,
  },
  {
    id: 'census-complete',
    category: 'milestone',
    condition: (d) => d.censusProgress === 100,
    priority: () => 75,
    label: 'Census Complete',
    message: () => 'Thank you for completing the Census — you\'re part of dream science history!',
  },

  // === COLLECTIVE SIGNALS (when collective data available) ===
  {
    id: 'collective-nightmare-low',
    category: 'comparison',
    condition: (d) => (d.collective?.nightmareRate ?? 100) < 5,
    priority: () => 55,
    label: 'Community Weather',
    message: () => 'The collective dream weather is peaceful — low nightmare activity this week',
  },
  {
    id: 'collective-lucid-spike',
    category: 'comparison',
    condition: (d) => (d.collective?.lucidPercentage ?? 0) > 15,
    priority: () => 68,
    label: 'Lucid Surge',
    message: (d) => `${Math.round(d.collective?.lucidPercentage ?? 0)}% of community dreams were lucid this week`,
  },

  // === FALLBACK (always true, lowest priority) ===
  {
    id: 'welcome',
    category: 'activity',
    condition: () => true,
    priority: () => 10,
    label: 'Welcome',
    message: () => 'Record your dreams to unlock personalized insights',
  },
]

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
