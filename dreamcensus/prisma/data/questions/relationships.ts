// Relationships Category Questions (8 questions)
// Source: Social content in dreams

export const relationshipsQuestions = [
  {
    slug: 'relationship-prominence',
    text: 'In your dreams, how prominent are relationships?',
    type: 'choice',
    props: {
      options: ['Very', 'Somewhat', 'Vaguely', 'Not At All'],
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'family-members-in-dreams',
    text: 'How often do family members appear in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'friends-in-dreams',
    text: 'How often do friends appear in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 3,
  },
  {
    slug: 'romantic-partner-in-dreams',
    text: 'How often does a romantic partner appear in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
      allowNA: true,
    },
    isRequired: false,
    sortOrder: 4,
  },
  {
    slug: 'conflict-in-dream-relationships',
    text: 'How often do you experience conflict with others in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'intimacy-sexuality',
    text: 'How often do you experience intimacy or sexuality in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 6,
  },
  {
    slug: 'shared-dreams',
    text: 'Have you ever had a dream that someone else also reported having?',
    helpText: 'Shared or mutual dreams',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 7,
  },
  {
    slug: 'visitation-dreams-deceased',
    text: 'How often do you experience visitation dreams (feeling deceased loved ones visit)?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
      allowNA: true,
    },
    isRequired: false,
    sortOrder: 8,
  },
]

