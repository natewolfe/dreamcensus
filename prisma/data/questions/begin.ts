/**
 * Basics (begin) - Introductory questions
 * The first section in the Self constellation kind
 */

export const beginQuestions = [
  {
    slug: 'age-range',
    text: 'What is your age range?',
    helpText: 'This helps us understand dream patterns across different life stages.',
    type: 'choice',
    props: {
      options: ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'dream-interest',
    text: 'What brings you to the Dream Census?',
    helpText: 'Choose all that apply.',
    type: 'multiChoice',
    props: {
      options: [
        'Curiosity about my dreams',
        'Tracking my dream patterns',
        'Contributing to dream research',
        'Interest in lucid dreaming',
        'Understanding dream meaning',
        'Something else',
      ],
    },
    isRequired: false,
    sortOrder: 2,
  },
  {
    slug: 'dream-frequency-basic',
    text: 'How often do you remember your dreams?',
    type: 'choice',
    props: {
      options: [
        'Rarely or never',
        'A few times a month',
        'A few times a week',
        'Almost every day',
      ],
    },
    isRequired: true,
    sortOrder: 3,
  },
]
