// Embodiment Category Questions (12 questions)
// Source: Sensory phenomenology

export const embodimentQuestions = [
  {
    slug: 'sensory-prominence-matrix',
    text: 'Rate how prominent each sense is in your dreams',
    type: 'matrix',
    props: {
      matrixRows: [
        { id: 'vision', label: 'Vision (seeing)' },
        { id: 'hearing', label: 'Hearing (sounds)' },
        { id: 'touch', label: 'Touch (physical sensations)' },
        { id: 'smell', label: 'Smell (scents/odors)' },
        { id: 'taste', label: 'Taste (flavors)' },
      ],
      matrixColumns: [
        { value: 4, label: 'Very' },
        { value: 3, label: 'Somewhat' },
        { value: 2, label: 'Vaguely' },
        { value: 1, label: 'Not at all' },
      ],
    },
    groupId: 'sensory-prominence',
    groupLabel: 'Sensory Prominence in Dreams',
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'pain-in-dreams',
    text: 'How often do you experience pain in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 2,
  },
  {
    slug: 'physical-pleasure-in-dreams',
    text: 'How often do you experience physical pleasure in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 3,
  },
  {
    slug: 'movement-locomotion',
    text: 'I can move freely and naturally in my dreams',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 4,
  },
  {
    slug: 'paralysis-inability-to-move',
    text: 'How often are you paralyzed or unable to move in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'flying-floating-sensations',
    text: 'How often do you experience flying or floating sensations?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 6,
  },
  {
    slug: 'falling-sensations',
    text: 'How often do you experience falling sensations?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 7,
  },
  {
    slug: 'body-transformation',
    text: 'How often does your body transform or change in dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 8,
  },
]

