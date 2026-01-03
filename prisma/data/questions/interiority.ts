// Interiority Category Questions (8 questions)
// Source: Dream Reflection Scale

export const interiorityQuestions = [
  {
    slug: 'reflect-on-dreams',
    text: 'Do you reflect on your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'dreams-influence-waking-life',
    text: 'Would you say your dreams influence your waking life?',
    type: 'binary',
    props: {
      variant: 'yes_no',
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'search-for-dream-meaning',
    text: 'I search for meaning or messages in my dreams',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 3,
  },
  {
    slug: 'dreams-reveal-hidden-feelings',
    text: 'My dreams reveal hidden feelings or thoughts',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 4,
  },
  {
    slug: 'alertness-in-waking-life',
    text: 'How alert are you in your waking life?',
    type: 'choice',
    props: {
      options: ['Very', 'Somewhat', 'Vaguely', 'Not At All'],
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'alertness-in-dreams',
    text: 'How alert are you in your dreams?',
    type: 'choice',
    props: {
      options: ['Very', 'Somewhat', 'Vaguely', 'Not At All'],
    },
    isRequired: true,
    sortOrder: 6,
  },
  {
    slug: 'dreams-important-to-identity',
    text: 'Dreams are an important part of who I am',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 7,
  },
  {
    slug: 'discuss-dreams-with-others',
    text: 'How often do you discuss your dreams with others?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 8,
  },
]

