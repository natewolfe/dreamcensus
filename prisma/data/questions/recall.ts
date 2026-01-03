// Recall Category Questions (10 questions)
// Source: Dream Recall Questionnaire (DRQ)

export const recallQuestions = [
  {
    slug: 'dream-recall-frequency',
    text: 'In the past month, how often did you remember your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'dreams-remembered-clearly',
    text: 'I can remember vivid details from my dreams',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'write-dreams-down',
    text: 'How often do you write down your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 3,
  },
  {
    slug: 'tell-others-about-dreams',
    text: 'How often do you tell others about your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 4,
  },
  {
    slug: 'dreams-recalled-timing',
    text: 'When do you typically recall your dreams?',
    type: 'choice',
    props: {
      options: [
        'Immediately upon waking',
        'Within the first hour',
        'Later in the day',
        'Days later',
        'Varies',
      ],
    },
    isRequired: true,
    sortOrder: 5,
  },
  {
    slug: 'recall-completeness',
    text: 'What best describes your dream recall?',
    type: 'choice',
    props: {
      options: [
        'Complete narratives with all details',
        'Most of the story with some gaps',
        'Key scenes but not the full story',
        'Only fragments and impressions',
        'Just a vague sense something happened',
      ],
    },
    isRequired: true,
    sortOrder: 6,
  },
  {
    slug: 'recall-techniques-used',
    text: 'What techniques do you use to improve dream recall, if any?',
    helpText: 'Select all that apply',
    type: 'multiChoice',
    props: {
      options: [
        'Keep a dream journal',
        'Set recall intention before sleep',
        'Stay still upon waking',
        'Reality checks',
        'Supplements (B6, etc.)',
        'Wake back to bed technique',
        'None',
      ],
      allowOther: true,
    },
    isRequired: false,
    sortOrder: 7,
  },
  {
    slug: 'recall-variation-sleep-duration',
    text: 'Do you recall dreams more often after longer sleep?',
    type: 'frequency',
    props: {
      anchorSet: 'agreement',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 8,
  },
  {
    slug: 'recall-variation-stress',
    text: 'Does stress affect your dream recall?',
    type: 'choice',
    props: {
      options: [
        'I recall more when stressed',
        'I recall less when stressed',
        'No noticeable difference',
        'Not sure',
      ],
    },
    isRequired: false,
    sortOrder: 9,
  },
  {
    slug: 'dream-diary-maintenance',
    text: 'Do you currently keep a dream diary or journal?',
    type: 'choice',
    props: {
      options: [
        'Yes, regularly (daily/weekly)',
        'Yes, occasionally',
        'Used to, but not anymore',
        'Never have',
      ],
    },
    isRequired: true,
    sortOrder: 10,
  },
]

