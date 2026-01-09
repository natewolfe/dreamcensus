// Hope & Desire Category Questions (6 questions)
// Source: Motivational content

export const hopeQuestions = [
  {
    slug: 'wish-fulfillment-dreams',
    text: 'My dreams fulfill wishes or desires I have',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'dreams-of-success-achievement',
    text: 'I dream about success or achievement',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'dreams-of-romance-love',
    text: 'I dream about romance or love',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 3,
  },
  {
    slug: 'what-would-you-do-in-lucid-dreams',
    text: 'What would you (or do you) choose to do in your lucid dreams?',
    type: 'text',
    props: {
      placeholder: 'If I were lucid in a dream, I would...',
      maxLength: 500,
    },
    isRequired: true,
    sortOrder: 4,
  },
  {
    slug: 'dreams-show-desired-futures',
    text: 'My dreams show me possible or desired futures',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 5,
  },
  {
    slug: 'wake-feeling-hopeful',
    text: 'How often do you wake from dreams feeling hopeful or inspired?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 6,
  },
]

