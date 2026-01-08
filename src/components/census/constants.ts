// Census Constants

export const SECTION_KINDS = [
  {
    slug: 'self',
    name: 'Self',
    description: 'About you as a person',
    icon: '🪞',
    color: '#b093ff',
    categorySlugs: ['personality', 'interiority'],
  },
  {
    slug: 'sleep',
    name: 'Sleep',
    description: 'Your sleep patterns and habits',
    icon: '😴',
    color: '#7986cb',
    categorySlugs: ['sleep'],
  },
  {
    slug: 'dreams',
    name: 'Dreams',
    description: 'The dreaming experience',
    icon: '🌙',
    color: '#9575cd',
    categorySlugs: ['recall', 'content', 'lucidity'],
  },
  {
    slug: 'cognition',
    name: 'Cognition',
    description: 'Mental faculties in dreams',
    icon: '🧠',
    color: '#ba68c8',
    categorySlugs: ['imagination', 'memory', 'spacetime'],
  },
  {
    slug: 'feelings',
    name: 'Feelings',
    description: 'Your emotional landscape',
    icon: '💜',
    color: '#ab47bc',
    categorySlugs: ['emotion', 'hope', 'fear'],
  },
  {
    slug: 'experience',
    name: 'Experience',
    description: 'What happens in dreams',
    icon: '✨',
    color: '#ce93d8',
    categorySlugs: ['embodiment', 'relationships', 'symbolism'],
  },
] as const

export type SectionKind = typeof SECTION_KINDS[number]
