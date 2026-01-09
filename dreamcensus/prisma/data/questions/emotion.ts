// Emotion Category Questions (10 questions)
// Source: MADRE emotional content

export const emotionQuestions = [
  {
    slug: 'mood-atmosphere-prominence',
    text: 'In your dreams, how prominent is the mood/atmosphere?',
    type: 'choice',
    props: {
      options: ['Very', 'Somewhat', 'Vaguely', 'Not At All'],
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'most-common-dream-emotion',
    text: 'What is the most common emotion in your dreams?',
    type: 'choice',
    props: {
      options: [
        'Joy/Happiness',
        'Fear/Anxiety',
        'Sadness',
        'Anger',
        'Confusion',
        'Awe/Wonder',
        'Neutral/None',
        'Varies greatly',
      ],
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'joy-happiness-frequency',
    text: 'How often do you experience joy or happiness in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 3,
  },
  {
    slug: 'fear-anxiety-frequency',
    text: 'How often do you experience fear or anxiety in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 4,
  },
  {
    slug: 'sadness-frequency',
    text: 'How often do you experience sadness in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'anger-frequency',
    text: 'How often do you experience anger in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 6,
  },
  {
    slug: 'confusion-frequency',
    text: 'How often do you experience confusion in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 7,
  },
  {
    slug: 'awe-wonder-frequency',
    text: 'How often do you experience awe or wonder in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 8,
  },
  {
    slug: 'emotional-intensity-rating',
    text: 'Rate the typical emotional intensity of your dreams',
    helpText: 'From emotionally flat to overwhelmingly intense',
    type: 'vas',
    props: {
      leftLabel: 'No emotion at all',
      rightLabel: 'Overwhelmingly intense',
    },
    isRequired: false,
    sortOrder: 9,
  },
  {
    slug: 'wake-with-residual-emotion',
    text: 'How often do emotions from your dreams linger after you wake up?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 10,
  },
]

