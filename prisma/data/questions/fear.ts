// Fear & Aversion Category Questions (10 questions)
// Source: MADRE nightmares + threat simulation

export const fearQuestions = [
  {
    slug: 'nightmare-frequency',
    text: 'How often do you experience nightmares?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'childhood-nightmare-frequency',
    text: 'How often did you experience nightmares during childhood?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'night-terrors',
    text: 'Do you experience night terrors (intense fear episodes during sleep)?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 3,
  },
  {
    slug: 'being-chased-dreams',
    text: 'How often do you dream about being chased?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 4,
  },
  {
    slug: 'falling-dreams',
    text: 'How often do you dream about falling?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'death-in-dreams',
    text: 'When you dream, how frequently do you die?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 6,
  },
  {
    slug: 'near-death-experiences',
    text: 'When you dream, how frequently do you experience near-death?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 7,
  },
  {
    slug: 'wake-from-nightmare-distressed',
    text: 'How often do you wake from nightmares feeling distressed?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 8,
  },
  {
    slug: 'nightmare-themes',
    text: 'What are common themes in your nightmares?',
    helpText: 'Select all that apply',
    type: 'multiChoice',
    props: {
      options: [
        'Being chased/attacked',
        'Injury or death',
        'Loss of loved ones',
        'Being trapped/paralyzed',
        'Falling',
        'Natural disasters',
        'Failure/humiliation',
        'Abandonment',
        'Supernatural threats',
      ],
      allowOther: true,
    },
    isRequired: false,
    sortOrder: 9,
  },
  {
    slug: 'nightmare-coping-strategies',
    text: 'How do you cope with nightmares?',
    helpText: 'Select all that apply',
    type: 'multiChoice',
    props: {
      options: [
        'Try to go back to sleep',
        'Stay awake for a while',
        'Talk to someone',
        'Write them down',
        'Practice lucid dreaming',
        'Seek professional help',
        'They don\'t bother me',
      ],
      allowOther: true,
    },
    isRequired: false,
    sortOrder: 10,
  },
]

