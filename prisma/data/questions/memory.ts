// Memory Category Questions (10 questions)
// Source: Temporal aspects of dream memory

export const memoryQuestions = [
  {
    slug: 'earliest-remembered-dream',
    text: 'The earliest dream you can remember is from when you were...',
    type: 'choice',
    props: {
      options: [
        'Past Lives',
        'Before birth',
        'A baby',
        'A kid',
        'A pre-teen',
        'A teenager',
        'An adult',
        'N/A',
      ],
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'describe-earliest-dream',
    text: 'Briefly describe this earliest dream (if possible):',
    type: 'text',
    props: {
      placeholder: 'The first dream I remember was...',
      maxLength: 500,
    },
    isRequired: false,
    sortOrder: 2,
  },
  {
    slug: 'most-active-dream-period',
    text: 'At which point in your lifetime has your dream-life been most active?',
    type: 'choice',
    props: {
      options: [
        'A baby',
        'A kid',
        'A pre-teen',
        'A teenager',
        'An adult',
        'N/A',
      ],
    },
    isRequired: true,
    sortOrder: 3,
  },
  {
    slug: 'dream-of-past-events',
    text: 'When you dream, how frequently do you re-live past events?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 4,
  },
  {
    slug: 'dream-of-events-from-yesterday',
    text: 'When you dream, how frequently do you dream about events from the day before?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'dream-of-distant-past',
    text: 'I dream about events from my distant past',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 6,
  },
  {
    slug: 'dream-of-deceased-people',
    text: 'How often do deceased loved ones appear in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
      allowNA: true,
    },
    isRequired: false,
    sortOrder: 7,
  },
  {
    slug: 'dream-memories-feel-real',
    text: 'Dream memories feel as real as waking memories',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 8,
  },
  {
    slug: 'confuse-dream-with-reality',
    text: 'How often have you confused a dream with a real memory?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 9,
  },
  {
    slug: 'long-term-dream-retention',
    text: 'I can remember dreams from months or years ago',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 10,
  },
]

