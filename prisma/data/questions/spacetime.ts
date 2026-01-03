// Time & Space Category Questions (8 questions)
// Source: Temporal/spatial phenomenology

export const spacetimeQuestions = [
  {
    slug: 'time-distortion',
    text: 'When you dream, how frequently do you experience time distortion?',
    helpText: 'Time moving unusually fast, slow, or non-linearly',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'past-time-period-dreams',
    text: 'How often do your dreams take place in the past?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 2,
  },
  {
    slug: 'future-time-period-dreams',
    text: 'How often do your dreams take place in the future?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 3,
  },
  {
    slug: 'minutes-to-fully-wake',
    text: 'In minutes, how long does it normally take you to fully wake up?',
    type: 'number',
    props: {
      minValue: 1,
      maxValue: 240,
      unit: 'minutes',
    },
    isRequired: false,
    sortOrder: 4,
  },
  {
    slug: 'multiple-dreams-per-night',
    text: 'When you dream, how frequently do you experience multiple dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'dream-scene-changes',
    text: 'How often do scenes or settings change abruptly in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 6,
  },
  {
    slug: 'specific-locations',
    text: 'My dreams take place in specific, detailed locations',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 7,
  },
  {
    slug: 'impossible-spaces',
    text: 'How often do you experience impossible or paradoxical spaces?',
    helpText: 'E.g., rooms bigger on the inside, non-Euclidean geometry',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 8,
  },
]

