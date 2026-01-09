// Symbolism Category Questions (12 questions)
// Source: Content analysis categories

export const symbolismQuestions = [
  {
    slug: 'recurring-dream-frequency',
    text: 'Do you currently experience recurring dreams?',
    helpText: 'Dreams with the same or similar content that repeat',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 1,
  },
  {
    slug: 'childhood-recurring-dreams',
    text: 'Did you experience recurring dreams during childhood?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 2,
  },
  {
    slug: 'describe-recurring-dream',
    text: 'Describe your most common recurring dream (if applicable):',
    type: 'text',
    props: {
      placeholder: 'In my recurring dream, I always...',
      maxLength: 500,
    },
    isRequired: false,
    sortOrder: 3,
  },
  {
    slug: 'recurring-symbols',
    text: 'Which symbols appear repeatedly in your dreams?',
    helpText: 'Select as many as you like, or add your own',
    type: 'tagPool',
    props: {
      tags: [
        'Water (ocean, river, rain)',
        'Flying/wings',
        'Houses/buildings',
        'Vehicles (cars, trains, planes)',
        'Animals',
        'Teeth',
        'Keys/doors',
        'Mirrors',
        'Darkness/light',
        'Bridges/pathways',
      ],
      allowCustomTags: true,
    },
    isRequired: false,
    sortOrder: 4,
  },
  {
    slug: 'water-symbolism',
    text: 'How often does water appear in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 5,
  },
  {
    slug: 'flying-symbolism',
    text: 'How often do you fly in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: true,
    sortOrder: 6,
  },
  {
    slug: 'teeth-body-symbols',
    text: 'How often do teeth or body parts feature prominently in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 7,
  },
  {
    slug: 'house-building-symbols',
    text: 'How often do houses or buildings appear in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 8,
  },
  {
    slug: 'vehicle-symbols',
    text: 'How often do vehicles (cars, trains, planes) appear in your dreams?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 9,
  },
  {
    slug: 'animal-symbols',
    text: 'Which animals commonly appear in your dreams?',
    helpText: 'Select as many as you like, or add your own',
    type: 'tagPool',
    props: {
      tags: [
        'Dogs',
        'Cats',
        'Birds',
        'Snakes',
        'Spiders/insects',
        'Horses',
        'Fish',
        'Wild animals',
        'Mythical creatures',
      ],
      allowCustomTags: true,
    },
    isRequired: false,
    sortOrder: 10,
  },
  {
    slug: 'seek-symbol-interpretation',
    text: 'How often do you look up the meaning of dream symbols?',
    type: 'frequency',
    props: {
      anchorSet: 'standard',
      frequencySteps: 5,
    },
    isRequired: false,
    sortOrder: 11,
  },
  {
    slug: 'personal-symbol-dictionary',
    text: 'Do you keep track of what certain symbols mean for you personally?',
    type: 'binary',
    props: {
      variant: 'yes_no',
    },
    isRequired: false,
    sortOrder: 12,
  },
]

