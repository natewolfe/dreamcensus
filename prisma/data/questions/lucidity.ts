// Lucidity Category Questions (12 questions)
// Source: Lucid Dreaming Frequency Scale (LDFS)

export const lucidityQuestions = [
  {
    slug: 'lucid-dream-frequency',
    text: 'How often do you lucid dream?',
    helpText: 'You\'re aware that you\'re dreaming and can exert control over the dream',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'first-lucid-dream-age',
    text: 'When did you first experience a lucid dream?',
    type: 'choice',
    props: {
      options: [
        'As a child',
        'As a teenager',
        'As an adult',
        'Never have',
        'Not sure',
      ],
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'awareness-without-control',
    text: 'How often are you aware you\'re dreaming but can\'t control the dream?',
    helpText: 'Pre-lucid state',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 3,
  },
  {
    slug: 'control-level-when-lucid',
    text: 'When you are lucid, how much control do you typically have?',
    helpText: 'From no control to complete control',
    type: 'vas',
    props: {
      leftLabel: 'No control at all',
      rightLabel: 'Complete control',
    },
    isRequired: false,
    sortOrder: 4,
  },
  {
    slug: 'lucid-dream-induction',
    text: 'Do you actively try to induce lucid dreams?',
    type: 'binary',
    props: {
      variant: 'yes_no',
    },
    isRequired: false,
    sortOrder: 5,
  },
  {
    slug: 'induction-techniques-used',
    text: 'Which lucid dreaming techniques do you use?',
    helpText: 'Select all that apply',
    type: 'multiChoice',
    props: {
      options: [
        'Reality checks',
        'MILD (Mnemonic Induction)',
        'WILD (Wake Initiated)',
        'WBTB (Wake Back to Bed)',
        'Dream journal',
        'Supplements',
        'Technology/apps',
        'None',
      ],
      allowOther: true,
    },
    isRequired: false,
    sortOrder: 6,
    showWhen: {
      questionId: 'lucid-dream-induction',
      operator: 'eq',
      value: 'yes',
    },
  },
  {
    slug: 'false-awakening-frequency',
    text: 'When you dream, how frequently do you experience false awakenings?',
    helpText: 'You dream that you woke up, but you\'re still dreaming',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 7,
  },
  {
    slug: 'reality-testing-in-dreams',
    text: 'How often do you perform reality checks within your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 8,
  },
  {
    slug: 'maintain-lucidity-duration',
    text: 'When lucid, how long can you typically maintain awareness?',
    type: 'choice',
    props: {
      options: [
        'Just a few seconds',
        'About a minute',
        'Several minutes',
        'Most of the dream',
        'The entire dream',
        'N/A - I don\'t lucid dream',
      ],
    },
    isRequired: false,
    sortOrder: 9,
  },
  {
    slug: 'actions-in-lucid-dreams',
    text: 'What do you typically do when lucid?',
    helpText: 'Select all that apply',
    type: 'multiChoice',
    props: {
      options: [
        'Fly',
        'Explore dream world',
        'Talk to dream characters',
        'Change the environment',
        'Seek answers/insights',
        'Practice skills',
        'Have adventures',
        'Experiment with abilities',
      ],
      allowOther: true,
    },
    isRequired: false,
    sortOrder: 10,
  },
  {
    slug: 'lucid-dream-goals',
    text: 'What are your goals or intentions for lucid dreaming?',
    type: 'text',
    props: {
      placeholder: 'I want to use lucid dreaming to...',
      maxLength: 500,
    },
    isRequired: false,
    sortOrder: 11,
  },
  {
    slug: 'return-to-dream-after-waking',
    text: 'Can you return to a dream after waking?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 12,
  },
]

