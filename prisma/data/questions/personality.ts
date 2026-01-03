// Personality Category Questions (12 questions)
// Source: Typeform "The Dreamer" + Boundary Questionnaire elements

export const personalityQuestions = [
  {
    slug: 'date-of-birth',
    text: 'What is your date of birth?',
    type: 'date',
    props: {
      maxDate: new Date().toISOString().split('T')[0],
      showAge: true,
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'primary-language',
    text: 'What is your primary language?',
    type: 'dropdown',
    props: {
      options: [
        'English', 'Arabic', 'Bengali', 'Burmese', 'Czech', 'Dutch', 
        'French', 'German', 'Greek', 'Hakka', 'Hindi', 'Italian', 
        'Japanese', 'Javanese', 'Korean', 'Mandarin', 'Nepali', 
        'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi', 
        'Russian', 'Spanish', 'Thai', 'Turkish', 'Urdu', 'Vietnamese', 
        'Wu', 'Zulu'
      ],
      allowOther: true,
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'dominant-hand',
    text: 'Which is your dominant hand?',
    type: 'choice',
    props: {
      options: ['Left', 'Right', 'Both'],
    },
    isRequired: true,
    sortOrder: 3,
  },
  {
    slug: 'identity-descriptors',
    text: 'How do you identify?',
    helpText: 'Select at least 1, or add your own',
    type: 'tagPool',
    props: {
      tags: [
        'Artist', 'Writer', 'Scientist', 'Engineer', 'Student', 'Parent',
        'Introvert', 'Extrovert', 'Spiritual', 'Religious', 'Atheist', 'Agnostic',
        'Female', 'Male', 'Non-binary', 'Neurodivergent', 'LGBTQ+',
        'Night Owl', 'Early Bird'
      ],
      allowCustomTags: true,
      minTags: 1,
    },
    isRequired: true,
    sortOrder: 4,
  },
  {
    slug: 'day-vs-night',
    text: 'Day vs. Night',
    helpText: 'Which do you identify with more?',
    type: 'imageChoice',
    props: {
      imageOptions: [
        {
          id: 'day',
          label: 'Day',
          imageUrl: '/images/census/day.jpg',
          alt: 'Bright sunlight scene',
        },
        {
          id: 'night',
          label: 'Night',
          imageUrl: '/images/census/night.jpg',
          alt: 'Dark nighttime scene',
        },
      ],
      columns: 2,
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'thinking-vs-feeling',
    text: 'Thinking vs. Feeling',
    helpText: 'Which do you identify with more?',
    type: 'imageChoice',
    props: {
      imageOptions: [
        {
          id: 'thinking',
          label: 'Thinking',
          imageUrl: '/images/census/thinking.jpg',
          alt: 'Person thinking analytically',
        },
        {
          id: 'feeling',
          label: 'Feeling',
          imageUrl: '/images/census/feeling.jpg',
          alt: 'Person experiencing emotions',
        },
      ],
      columns: 2,
    },
    isRequired: true,
    sortOrder: 6,
  },
  {
    slug: 'action-vs-observation',
    text: 'Action vs. Observation',
    helpText: 'Which do you identify with more?',
    type: 'imageChoice',
    props: {
      imageOptions: [
        {
          id: 'action',
          label: 'Action',
          imageUrl: '/images/census/action.jpg',
          alt: 'Person taking action',
        },
        {
          id: 'observation',
          label: 'Observation',
          imageUrl: '/images/census/observation.jpg',
          alt: 'Person observing',
        },
      ],
      columns: 2,
    },
    isRequired: true,
    sortOrder: 7,
  },
  {
    slug: 'vivid-thoughts',
    text: 'I have unusually vivid thoughts',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 8,
  },
  {
    slug: 'mind-wanders',
    text: 'My mind wanders easily',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 9,
  },
  {
    slug: 'lose-track-time',
    text: 'I often lose track of time',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 10,
  },
  {
    slug: 'imagine-being-someone-else',
    text: 'I can easily imagine being someone else',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 11,
  },
  {
    slug: 'thin-boundaries',
    text: 'Boundaries between reality and imagination feel thin to me',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 12,
  },
]

