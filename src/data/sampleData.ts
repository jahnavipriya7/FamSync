import { ChildProfile, EarnRequest, DayUsageLog, AIParentInsight, QuizQuestion } from '../types';

export const SAMPLE_CHILDREN: ChildProfile[] = [
  {
    id: 'child-anna',
    name: 'Anna',
    age: 16,
    avatar: '🧑‍💻',
    dailyLimitMin: 90,
    usedTodayMin: 55,
    bonusEarnedTodayMin: 15,
    categorySplitToday: {
      study: 25,
      games: 15,
      videos: 10,
      social: 5
    },
    schoolLock: { start: '08:30', end: '15:30', enabled: true },
    tuitionLock: { start: '17:00', end: '19:00', enabled: true },
    bedtimeLock: { start: '21:30', end: '06:30', enabled: true },
    examMode: { enabled: true, daysRemaining: 12 },
    streakDays: 6,
    choresCompletedCount: 4,
    isSample: true
  },
  {
    id: 'child-chinni',
    name: 'Chinni',
    age: 10,
    avatar: '👧',
    dailyLimitMin: 75,
    usedTodayMin: 45,
    bonusEarnedTodayMin: 20,
    categorySplitToday: {
      study: 20,
      games: 15,
      videos: 10,
      social: 0
    },
    schoolLock: { start: '08:30', end: '15:30', enabled: true },
    tuitionLock: { start: '17:00', end: '19:00', enabled: true },
    bedtimeLock: { start: '21:00', end: '06:30', enabled: true },
    examMode: { enabled: false, daysRemaining: 0 },
    streakDays: 8,
    choresCompletedCount: 6,
    isSample: true
  }
];

export const SAMPLE_EARN_REQUESTS: EarnRequest[] = [
  {
    id: 'req-1',
    childId: 'child-chinni',
    childName: 'Chinni',
    type: 'reading',
    title: 'Read Amar Chitra Katha for 10 min',
    requestedMin: 10,
    note: 'Read the story of Tenali Rama and the thieves.',
    status: 'pending',
    createdAt: '2026-11-05T18:15:00.000Z',
    isSample: true
  },
  {
    id: 'req-2',
    childId: 'child-anna',
    childName: 'Anna',
    type: 'elder_skill',
    title: 'Learned cycle puncture water-bowl test from Nanna',
    requestedMin: 15,
    note: 'Found the tube leak with water bubbles, sandpapered the spot, and glued the patch.',
    status: 'pending',
    createdAt: '2026-11-05T18:40:00.000Z',
    isSample: true
  },
  {
    id: 'req-3',
    childId: 'child-chinni',
    childName: 'Chinni',
    type: 'chore',
    title: 'Watered balcony potted tulsi & jasmine plants with Nani',
    requestedMin: 10,
    note: 'Cleared dry fallen leaves and watered all 6 pots gently.',
    status: 'approved',
    createdAt: '2026-11-04T17:30:00.000Z',
    approvedBy: 'Amma',
    isSample: true
  },
  {
    id: 'req-4',
    childId: 'child-anna',
    childName: 'Anna',
    type: 'elder_skill',
    title: 'Learned traditional pepper rasam tadka from Nani',
    requestedMin: 15,
    note: 'Crushed cumin and black pepper in mortar; added ghee mustard tadka.',
    status: 'approved',
    createdAt: '2026-11-03T11:00:00.000Z',
    approvedBy: 'Nani',
    isSample: true
  }
];

export const SAMPLE_7DAY_USAGE_LOGS: DayUsageLog[] = [
  // Anna
  { dayName: 'Fri', date: 'Oct 31', childId: 'child-anna', totalUsedMin: 85, studyMin: 35, entertainmentMin: 50, limitMin: 90, bonusEarnedMin: 20, choresDone: 1 },
  { dayName: 'Sat', date: 'Nov 01', childId: 'child-anna', totalUsedMin: 90, studyMin: 20, entertainmentMin: 70, limitMin: 90, bonusEarnedMin: 25, choresDone: 1 },
  { dayName: 'Sun', date: 'Nov 02', childId: 'child-anna', totalUsedMin: 88, studyMin: 30, entertainmentMin: 58, limitMin: 90, bonusEarnedMin: 15, choresDone: 0 },
  { dayName: 'Mon', date: 'Nov 03', childId: 'child-anna', totalUsedMin: 65, studyMin: 40, entertainmentMin: 25, limitMin: 90, bonusEarnedMin: 15, choresDone: 1 },
  { dayName: 'Tue', date: 'Nov 04', childId: 'child-anna', totalUsedMin: 70, studyMin: 45, entertainmentMin: 25, limitMin: 90, bonusEarnedMin: 20, choresDone: 0 },
  { dayName: 'Wed', date: 'Nov 05', childId: 'child-anna', totalUsedMin: 60, studyMin: 35, entertainmentMin: 25, limitMin: 90, bonusEarnedMin: 15, choresDone: 1 },
  { dayName: 'Today', date: 'Nov 06', childId: 'child-anna', totalUsedMin: 55, studyMin: 25, entertainmentMin: 30, limitMin: 90, bonusEarnedMin: 15, choresDone: 0 },

  // Chinni
  { dayName: 'Fri', date: 'Oct 31', childId: 'child-chinni', totalUsedMin: 65, studyMin: 25, entertainmentMin: 40, limitMin: 75, bonusEarnedMin: 10, choresDone: 1 },
  { dayName: 'Sat', date: 'Nov 01', childId: 'child-chinni', totalUsedMin: 75, studyMin: 15, entertainmentMin: 60, limitMin: 75, bonusEarnedMin: 20, choresDone: 1 },
  { dayName: 'Sun', date: 'Nov 02', childId: 'child-chinni', totalUsedMin: 70, studyMin: 20, entertainmentMin: 50, limitMin: 75, bonusEarnedMin: 15, choresDone: 1 },
  { dayName: 'Mon', date: 'Nov 03', childId: 'child-chinni', totalUsedMin: 50, studyMin: 30, entertainmentMin: 20, limitMin: 75, bonusEarnedMin: 10, choresDone: 1 },
  { dayName: 'Tue', date: 'Nov 04', childId: 'child-chinni', totalUsedMin: 55, studyMin: 30, entertainmentMin: 25, limitMin: 75, bonusEarnedMin: 15, choresDone: 0 },
  { dayName: 'Wed', date: 'Nov 05', childId: 'child-chinni', totalUsedMin: 48, studyMin: 28, entertainmentMin: 20, limitMin: 75, bonusEarnedMin: 10, choresDone: 1 },
  { dayName: 'Today', date: 'Nov 06', childId: 'child-chinni', totalUsedMin: 45, studyMin: 20, entertainmentMin: 25, limitMin: 75, bonusEarnedMin: 20, choresDone: 1 }
];

export const SAMPLE_AI_PARENT_INSIGHT: AIParentInsight = {
  summary: 'Your Vizag household managed exam pressure well this week. Anna’s tuition hours (5-7 PM) were completely protected from video distractions, and Chinni earned 75 extra minutes through book reading and plant care with Nani.',
  concerns: [
    'Anna had 1 late evening session close to the 9:30 PM bedtime lock on Sunday.',
    'Chinni is asking for gaming right before 5 PM tuition starts.'
  ],
  suggested_limit_min: 75,
  earn_tasks: [
    {
      title: 'Balcony Flower Watering with Nani',
      bonus_min: 10,
      why: 'Calms eye strain after 2 hours of maths tuition.'
    },
    {
      title: 'Read 2 Chapters of Telugu or English Storybook',
      bonus_min: 10,
      why: 'Builds literacy while earning phone time peacefully.'
    },
    {
      title: 'Folding School Uniforms into Wardrobe',
      bonus_min: 10,
      why: 'Teaches tidy self-reliance without arguments.'
    }
  ],
  conversation_starter: 'Ask Anna at dinner how the cycle tire puncture test with water bubbles worked, instead of asking about his phone time.',
  weekend_chore: {
    title: 'Shoe Rack Air-Traffic Controller',
    duration_min: 15,
    safety_note: 'Wash hands thoroughly with soap after organizing footwear.'
  },
  generatedAt: new Date().toISOString(),
  source: 'local-engine'
};

export const WEEKEND_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    q: 'When making traditional Andhra rasam, what is the best way to release the essential oils of black pepper and cumin?',
    options: [
      'Boil them whole in cold water',
      'Crush them freshly in a stone mortar or coarse grinder',
      'Fry them until burnt black',
      'Add sugar before boiling'
    ],
    answer_index: 1
  },
  {
    q: 'To find a tiny leak in a bicycle or scooter inner tube, what safe household trick works best?',
    options: [
      'Hold a burning matchstick near the tire',
      'Submerge the pumped tube in a bucket of water and watch for air bubbles',
      'Poke holes with a safety pin',
      'Listen with your ear while riding'
    ],
    answer_index: 1
  },
  {
    q: 'At the Visakhapatnam Rythu Bazaar, how can you identify fresh country drumsticks (Munakkada)?',
    options: [
      'They should bend slightly without snapping and have smooth green skin',
      'They should be rock-hard and yellow',
      'They should rattle with dry seeds inside',
      'They should be slimy'
    ],
    answer_index: 0
  },
  {
    q: 'Why is it important to stop looking at mobile screens at least 30 minutes before bedtime?',
    options: [
      'The phone battery discharges faster at night',
      'Blue light tricks the brain into staying awake by suppressing sleep hormones (melatonin)',
      'The screen gets colder in the dark',
      'Internet speed drops automatically'
    ],
    answer_index: 1
  },
  {
    q: 'Before touching an electrical switch or resetting an MCB trip at home, what must you always do?',
    options: [
      'Wear dry rubber slippers and make sure hands are completely dry',
      'Stand in water for good grounding',
      'Use a wet cloth for better grip',
      'Keep metal keys in your pocket'
    ],
    answer_index: 0
  }
];
