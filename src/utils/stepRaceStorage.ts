import { 
  FamilyGroup, 
  MemberProfile, 
  DailyChallenge, 
  WinnerRecord, 
  WeeklyTournament, 
  QuestRoute, 
  RelayChallenge, 
  BossMonster, 
  PhotoPost, 
  MysteryChallenge, 
  SeasonalEvent,
  Reaction,
  TauntMessage
} from '../types/stepRace';
import { getTodayLocalDateString } from './raceEngine';

export const STORAGE_KEY_STEP_GROUP = 'famsync_step_group_v2';
export const STORAGE_KEY_STEP_MEMBERS = 'famsync_step_members_v2';
export const STORAGE_KEY_STEP_CHALLENGE = 'famsync_step_challenge_v2';
export const STORAGE_KEY_STEP_WINNERS = 'famsync_step_winners_v2';
export const STORAGE_KEY_STEP_TOURNAMENT = 'famsync_step_tournament_v2';
export const STORAGE_KEY_STEP_QUEST = 'famsync_step_quest_v2';
export const STORAGE_KEY_STEP_ROUTES_LIBRARY = 'famsync_step_routes_library_v3';
export const STORAGE_KEY_STEP_RELAY = 'famsync_step_relay_v2';
export const STORAGE_KEY_STEP_BOSS = 'famsync_step_boss_v2';
export const STORAGE_KEY_STEP_PHOTOS = 'famsync_step_photos_v2';
export const STORAGE_KEY_STEP_MYSTERY = 'famsync_step_mystery_v2';
export const STORAGE_KEY_STEP_EVENTS = 'famsync_step_events_v2';
export const STORAGE_KEY_STEP_REACTIONS = 'famsync_step_reactions_v2';
export const STORAGE_KEY_STEP_TAUNTS = 'famsync_step_taunts_v2';

/**
 * Dynamic Member Resolution Helpers
 * Ensures any member rename propagates immediately everywhere by memberId!
 */
export function getMemberById(members: MemberProfile[], id: string): MemberProfile | undefined {
  return members.find(m => m.id === id);
}

export function getMemberDisplayName(members: MemberProfile[], id: string, fallbackName?: string): string {
  const member = members.find(m => m.id === id);
  if (!member) return fallbackName || 'Family Member';
  if (member.nickname && member.nickname.trim()) {
    return `${member.name} (${member.nickname.trim()})`;
  }
  return member.name;
}

export function getMemberAvatar(members: MemberProfile[], id: string, fallbackAvatar: string = '🏃'): string {
  const member = members.find(m => m.id === id);
  return member ? member.avatar : fallbackAvatar;
}

// 1. Initial Vizag Sample Group
export const SAMPLE_FAMILY_GROUP: FamilyGroup = {
  id: 'group-vizag-1',
  name: 'Vizag Sundaram Family',
  inviteCode: 'VIZAG-10K',
  adminMemberId: 'member-amma',
  dailyStepGoal: 10000,
  createdAt: '2026-11-01T06:00:00.000Z',
  customReward: 'Winner picks Sunday Andhra Thali dinner & Amma gets feet rested!',
  cooperativeMode: 'quest',
  handicapModeEnabled: true,
  handicapAutoByAge: true
};

// 2. Initial Vizag Family Members (Amma, Nanna, Nani, Anna, Chinni)
export const SAMPLE_MEMBERS: MemberProfile[] = [
  {
    id: 'member-amma',
    name: 'Amma (Mother)',
    avatar: '👩‍🏫',
    age: 41,
    relation: 'Mother',
    ageBracket: 'adult',
    personalGoal: 10000,
    handicapMultiplier: 1.0,
    totalWins: 5,
    currentStreak: 6,
    tournamentPoints: 28,
    tauntsRemainingToday: 2
  },
  {
    id: 'member-nanna',
    name: 'Nanna (Father)',
    avatar: '👨‍💼',
    age: 44,
    relation: 'Father',
    ageBracket: 'adult',
    personalGoal: 10000,
    handicapMultiplier: 1.0,
    totalWins: 3,
    currentStreak: 4,
    tournamentPoints: 19,
    tauntsRemainingToday: 3
  },
  {
    id: 'member-nani',
    name: 'Nani (Grandmother)',
    avatar: '👵',
    age: 68,
    relation: 'Grandmother',
    ageBracket: 'senior',
    personalGoal: 5000,
    handicapMultiplier: 0.5,
    totalWins: 4,
    currentStreak: 5,
    tournamentPoints: 24,
    tauntsRemainingToday: 3
  },
  {
    id: 'member-anna',
    name: 'Anna (16)',
    avatar: '🧑‍💻',
    age: 16,
    relation: 'Son',
    ageBracket: 'teen',
    personalGoal: 9000,
    handicapMultiplier: 0.9,
    totalWins: 8,
    currentStreak: 8,
    tournamentPoints: 36,
    tauntsRemainingToday: 1
  },
  {
    id: 'member-chinni',
    name: 'Chinni (10)',
    avatar: '👧',
    age: 10,
    relation: 'Daughter',
    ageBracket: 'child',
    personalGoal: 6000,
    handicapMultiplier: 0.6,
    totalWins: 6,
    currentStreak: 7,
    tournamentPoints: 30,
    tauntsRemainingToday: 2
  }
];

// 3. Initial Active Daily Challenge for Today
export function getInitialDailyChallenge(): DailyChallenge {
  const today = getTodayLocalDateString();
  return {
    date: today,
    goal: 10000,
    membersProgress: {
      'member-anna': {
        memberId: 'member-anna',
        steps: 10250,
        rawSteps: 10250,
        percentage: 113.8,
        reachedGoalAt: `${today}T17:42:15.000Z`,
        isGoalReached: true,
        rank: 1
      },
      'member-nani': {
        memberId: 'member-nani',
        steps: 4850,
        rawSteps: 4850,
        percentage: 97.0, // 4850 / 5000
        reachedGoalAt: undefined,
        isGoalReached: false,
        rank: 2
      },
      'member-amma': {
        memberId: 'member-amma',
        steps: 8420,
        rawSteps: 8420,
        percentage: 84.2,
        reachedGoalAt: undefined,
        isGoalReached: false,
        rank: 3
      },
      'member-chinni': {
        memberId: 'member-chinni',
        steps: 5100,
        rawSteps: 5100,
        percentage: 85.0, // 5100 / 6000
        reachedGoalAt: undefined,
        isGoalReached: false,
        rank: 4
      },
      'member-nanna': {
        memberId: 'member-nanna',
        steps: 6150,
        rawSteps: 6150,
        percentage: 61.5,
        reachedGoalAt: undefined,
        isGoalReached: false,
        rank: 5
      }
    },
    winnerMemberId: 'member-anna',
    winnerReachedAt: `${today}T17:42:15.000Z`,
    rewardClaimed: false,
    mysteryChallengeId: 'mystery-evening-power',
    mysteryWinnerId: undefined,
    lastSyncTimestamp: new Date().toISOString()
  };
}

// 4. Past Winners History
export const SAMPLE_WINNERS: WinnerRecord[] = [
  {
    id: 'win-1',
    date: '2026-11-04',
    memberId: 'member-nani',
    memberName: 'Nani (Grandmother)',
    memberAvatar: '👵',
    steps: 5200,
    reachedGoalAt: '2026-11-04T16:15:00.000Z',
    rewardTitle: 'Nani picked dinner menu & Anna watered all balcony plants',
    handicapApplied: true
  },
  {
    id: 'win-2',
    date: '2026-11-03',
    memberId: 'member-amma',
    memberName: 'Amma (Mother)',
    memberAvatar: '👩‍🏫',
    steps: 10450,
    reachedGoalAt: '2026-11-03T18:20:30.000Z',
    rewardTitle: 'Amma got hot ginger tea served & Nanna washed all vessels',
    handicapApplied: false
  },
  {
    id: 'win-3',
    date: '2026-11-02',
    memberId: 'member-anna',
    memberName: 'Anna (16)',
    memberAvatar: '🧑‍💻',
    steps: 11100,
    reachedGoalAt: '2026-11-02T17:35:10.000Z',
    rewardTitle: 'Anna picked weekend movie stream',
    handicapApplied: true
  }
];

// 5. Weekly Tournament Standings
export const SAMPLE_TOURNAMENT: WeeklyTournament = {
  weekId: '2026-W45',
  startDate: '2026-11-02',
  endDate: '2026-11-08',
  isCompleted: false,
  championMemberId: 'member-anna',
  standings: [
    {
      memberId: 'member-anna',
      memberName: 'Anna (16)',
      avatar: '🧑‍💻',
      totalPoints: 36,
      dailyWins: 3,
      goalsReached: 4,
      totalSteps: 43200
    },
    {
      memberId: 'member-chinni',
      memberName: 'Chinni (10)',
      avatar: '👧',
      totalPoints: 30,
      dailyWins: 2,
      goalsReached: 4,
      totalSteps: 24800
    },
    {
      memberId: 'member-amma',
      memberName: 'Amma (Mother)',
      avatar: '👩‍🏫',
      totalPoints: 28,
      dailyWins: 2,
      goalsReached: 3,
      totalSteps: 38400
    },
    {
      memberId: 'member-nani',
      memberName: 'Nani (Grandmother)',
      avatar: '👵',
      totalPoints: 24,
      dailyWins: 1,
      goalsReached: 4,
      totalSteps: 22100
    },
    {
      memberId: 'member-nanna',
      memberName: 'Nanna (Father)',
      avatar: '👨‍💼',
      totalPoints: 19,
      dailyWins: 0,
      goalsReached: 2,
      totalSteps: 31500
    }
  ]
};

export function calculateStepsFromDistanceKm(distanceKm: number): number {
  return Math.round((distanceKm * 1000) / 0.75);
}

export function calculateDistanceKmFromSteps(steps: number): number {
  return parseFloat(((steps * 0.75) / 1000).toFixed(2));
}

// 6. Pre-built Default Route Templates (always available as editable templates)
export const DEFAULT_ROUTES_TEMPLATES: QuestRoute[] = [
  {
    id: 'quest-hyd-delhi',
    title: 'Grand Deccan to Capital Quest (Hyderabad ➔ Delhi)',
    startLocation: 'Charminar, Hyderabad',
    endLocation: 'India Gate, New Delhi',
    description: 'Walking virtually from Charminar, Hyderabad through Nagpur and Agra all the way to India Gate, Delhi (~1,500 km).',
    totalDistanceKm: 1500,
    totalStepsRequired: 2000000, // at 0.75m/step = 1,500,000 meters = 1,500 km
    currentSteps: 453000,
    completed: false,
    isCustom: false,
    memberContributions: {
      'member-anna': 128000,
      'member-amma': 105000,
      'member-nanna': 89000,
      'member-chinni': 71000,
      'member-nani': 60000
    },
    landmarks: [
      {
        id: 'lm-hyd',
        title: 'Charminar, Hyderabad',
        distanceKm: 0,
        stepsRequired: 0,
        funFact: 'Built in 1591 CE, its four minarets stand 48.7 meters high!',
        badgeIcon: '🏛️',
        unlocked: true
      },
      {
        id: 'lm-nagpur',
        title: 'Zero Mile Stone, Nagpur',
        distanceKm: 500,
        stepsRequired: 666666,
        funFact: 'Nagpur is the Orange City and the geographical center of India.',
        badgeIcon: '🍊',
        unlocked: false
      },
      {
        id: 'lm-bhopal',
        title: 'Upper Lake & Sanchi Stupa, Bhopal',
        distanceKm: 850,
        stepsRequired: 1133333,
        funFact: 'Sanchi Stupa is one of the oldest stone structures in India commissioned by Ashoka.',
        badgeIcon: '🛕',
        unlocked: false
      },
      {
        id: 'lm-gwalior',
        title: 'Gwalior Historic Fort',
        distanceKm: 1200,
        stepsRequired: 1600000,
        funFact: 'Described by Mughal Emperor Babur as the pearl among jewels of Indian fortresses!',
        badgeIcon: '🏰',
        unlocked: false
      },
      {
        id: 'lm-agra',
        title: 'Taj Mahal & Yamuna Bank, Agra',
        distanceKm: 1350,
        stepsRequired: 1800000,
        funFact: 'One of the Seven Wonders of the World, built of white Makrana marble.',
        badgeIcon: '🕌',
        unlocked: false
      },
      {
        id: 'lm-delhi',
        title: 'India Gate, New Delhi',
        distanceKm: 1500,
        stepsRequired: 2000000,
        funFact: 'Victory destination! 42-meter high memorial built in 1931.',
        badgeIcon: '🚩',
        unlocked: false
      }
    ]
  },
  {
    id: 'quest-vizag-coastal',
    title: 'Vizag Coastal Trail (RK Beach ➔ Bheemili Beach)',
    startLocation: 'RK Beach, Visakhapatnam',
    endLocation: 'Bheemili Beach, Bheemunipatnam',
    description: 'Scenic Bay of Bengal coastal walk passing Submarine Museum, Kailasagiri hill, Rishikonda, and historic Dutch cemetery.',
    totalDistanceKm: 30,
    totalStepsRequired: 40000,
    currentSteps: 0,
    completed: false,
    isCustom: false,
    memberContributions: {},
    landmarks: [
      {
        id: 'lm-rk-beach',
        title: 'RK Beach & Kursura Submarine',
        distanceKm: 0,
        stepsRequired: 0,
        funFact: 'INS Kursura was India’s premier submarine preserved on beach sands!',
        badgeIcon: '⚓',
        unlocked: true
      },
      {
        id: 'lm-kailasagiri',
        title: 'Kailasagiri Hilltop Viewpoint',
        distanceKm: 8,
        stepsRequired: 10667,
        funFact: 'Perched at 360 ft overlooking the Bay of Bengal with giant Shiva-Parvati statues.',
        badgeIcon: '⛰️',
        unlocked: false
      },
      {
        id: 'lm-rishikonda',
        title: 'Rishikonda Golden Sands',
        distanceKm: 18,
        stepsRequired: 24000,
        funFact: 'Known as the Jewel of the East Coast with water sports and scenic dunes.',
        badgeIcon: '🏖️',
        unlocked: false
      },
      {
        id: 'lm-bheemili',
        title: 'Bheemili Dutch Fort & Beach',
        distanceKm: 30,
        stepsRequired: 40000,
        funFact: 'One of the oldest Dutch settlements in India founded in the 17th century.',
        badgeIcon: '⛵',
        unlocked: false
      }
    ]
  },
  {
    id: 'quest-eastern-ghats',
    title: 'Eastern Ghats Pilgrimage (Simhachalam ➔ Araku Valley)',
    startLocation: 'Simhachalam Temple, Vizag',
    endLocation: 'Borra Caves & Araku Coffee Plantations',
    description: 'Trek from the historic Narasimha temple at Simhachalam through misty Ananthagiri hills up to the deep limestone Borra Caves.',
    totalDistanceKm: 120,
    totalStepsRequired: 160000,
    currentSteps: 0,
    completed: false,
    isCustom: false,
    memberContributions: {},
    landmarks: [
      {
        id: 'lm-simhachalam',
        title: 'Simhachalam Hill Shrine',
        distanceKm: 0,
        stepsRequired: 0,
        funFact: 'Ancient 11th century temple dedicated to Lord Varaha Lakshmi Narasimha.',
        badgeIcon: '🛕',
        unlocked: true
      },
      {
        id: 'lm-skota',
        title: 'Srungavarapukota Foothills',
        distanceKm: 45,
        stepsRequired: 60000,
        funFact: 'Gateway valley surrounded by mango groves and emerald paddy fields.',
        badgeIcon: '🌾',
        unlocked: false
      },
      {
        id: 'lm-tyda',
        title: 'Tyda Jungle Bells Camp',
        distanceKm: 80,
        stepsRequired: 106667,
        funFact: 'Eco-tourism hub in the Eastern Ghats with rich bird life and wooden cottages.',
        badgeIcon: '🏕️',
        unlocked: false
      },
      {
        id: 'lm-borra',
        title: 'Borra Caves & Araku Valley',
        distanceKm: 120,
        stepsRequired: 160000,
        funFact: 'Million-year-old limestone caves featuring stalactites and stalagmites!',
        badgeIcon: '🦇',
        unlocked: false
      }
    ]
  }
];

export const SAMPLE_QUEST: QuestRoute = {
  ...DEFAULT_ROUTES_TEMPLATES[0]
};

// 7. Cooperative Relay Challenge
export const SAMPLE_RELAY: RelayChallenge = {
  date: getTodayLocalDateString(),
  teamCompleted: false,
  legs: [
    {
      legNumber: 1,
      runnerMemberId: 'member-amma',
      runnerName: 'Amma (Mother)',
      targetSteps: 3000,
      currentSteps: 3000,
      status: 'completed',
      completedAt: '2026-11-06T09:30:00.000Z'
    },
    {
      legNumber: 2,
      runnerMemberId: 'member-chinni',
      runnerName: 'Chinni (10)',
      targetSteps: 2000,
      currentSteps: 2000,
      status: 'completed',
      completedAt: '2026-11-06T12:45:00.000Z'
    },
    {
      legNumber: 3,
      runnerMemberId: 'member-anna',
      runnerName: 'Anna (16)',
      targetSteps: 3000,
      currentSteps: 3000,
      status: 'completed',
      completedAt: '2026-11-06T16:20:00.000Z'
    },
    {
      legNumber: 4,
      runnerMemberId: 'member-nanna',
      runnerName: 'Nanna (Father)',
      targetSteps: 2000,
      currentSteps: 1450,
      status: 'running',
      completedAt: undefined
    }
  ]
};

// 8. Cooperative Boss Battle: "The Screen Sloth"
export const SAMPLE_BOSS: BossMonster = {
  id: 'boss-screen-sloth',
  name: 'The Screen Sloth',
  title: 'Weekly Monster of Inertia & Sofa Laziness',
  avatar: '🦥',
  totalHp: 35000, // 7,000 HP * 5 family members
  currentHp: 14200,
  weekNumber: 45,
  defeated: false,
  escaped: false,
  badgeName: 'Sloth Slayer Crest',
  damageLog: [
    {
      memberId: 'member-anna',
      memberName: 'Anna (16)',
      damage: 2800,
      timestamp: '2026-11-06T17:40:00.000Z'
    },
    {
      memberId: 'member-amma',
      memberName: 'Amma',
      damage: 2100,
      timestamp: '2026-11-06T15:10:00.000Z'
    },
    {
      memberId: 'member-nani',
      memberName: 'Nani',
      damage: 1500,
      timestamp: '2026-11-06T11:20:00.000Z'
    }
  ]
};

// 9. Photo Check-Ins Feed
export const SAMPLE_PHOTOS: PhotoPost[] = [
  {
    id: 'photo-1',
    memberId: 'member-amma',
    memberName: 'Amma',
    avatar: '👩‍🏫',
    caption: 'Brisk morning walk along RK Beach Road! Cool Vizag sea breeze keeps the energy high.',
    photoUrl: '', // In UI we render an SVG/Canvas placeholder card if URL empty
    location: 'RK Beach Road, Visakhapatnam',
    timestamp: '2026-11-06T07:15:00.000Z',
    likes: ['member-nanna', 'member-anna', 'member-chinni']
  },
  {
    id: 'photo-2',
    memberId: 'member-nani',
    memberName: 'Nani',
    avatar: '👵',
    caption: 'Evening temple walk with Chinni. 4,800 steps achieved without tiredness!',
    photoUrl: '',
    location: 'Simhachalam Foothills Trail, Vizag',
    timestamp: '2026-11-05T18:40:00.000Z',
    likes: ['member-amma', 'member-anna']
  }
];

// 10. Mystery Challenge
export const SAMPLE_MYSTERY: MysteryChallenge = {
  id: 'mystery-evening-power',
  title: 'Evening Power Walkers (6:00 PM - 8:00 PM)',
  description: 'Member who logs the most steps between 6 PM and 8 PM wins +5 tournament bonus points!',
  icon: '⚡',
  type: 'evening_power',
  bonusPoints: 5,
  isRevealed: true
};

// 11. Seasonal Events
export const SAMPLE_EVENTS: SeasonalEvent[] = [
  {
    id: 'event-sankranti',
    title: 'Sankranti Kite Dash 🪁',
    theme: {
      primaryColor: '#f59e0b',
      icon: '🪁',
      banner: 'Harvest Celebration Sprint'
    },
    startDate: '2027-01-12',
    endDate: '2027-01-16',
    badgeName: 'Golden Patang Master',
    challengeDescription: 'Family completes 50,000 steps together across Bhogi, Sankranti, and Kanuma festival days!',
    targetFamilySteps: 50000,
    currentFamilySteps: 0,
    isActive: false
  },
  {
    id: 'event-diwali',
    title: 'Diwali Light Run 🪔',
    theme: {
      primaryColor: '#ef4444',
      icon: '🪔',
      banner: 'Festival of Lights Stepathon'
    },
    startDate: '2026-11-01',
    endDate: '2026-11-08',
    badgeName: 'Diya Spark Champion',
    challengeDescription: 'Burn festive sweet calories with 40,000 combined family steps this Diwali week!',
    targetFamilySteps: 40000,
    currentFamilySteps: 28400,
    isActive: true
  }
];

// 12. Friendly Taunts presets
export const PRESET_TAUNTS = [
  'Catch me if you can! My walking shoes are on fire! 🔥',
  'Is that all you got? I am already at the finish line! 🏃',
  'Sunday dinner is on you tonight! 🍽️',
  'One more mile and I take the crown! 👑',
  'Teamwork makes the dream work, but I am still winning! ⚡'
];

export const SAMPLE_REACTIONS: Reaction[] = [
  {
    id: 'rx-1',
    fromMemberId: 'member-chinni',
    fromMemberName: 'Chinni',
    targetType: 'win',
    targetId: 'member-anna',
    emoji: '🏆',
    timestamp: '2026-11-06T17:45:00.000Z'
  },
  {
    id: 'rx-2',
    fromMemberId: 'member-nanna',
    fromMemberName: 'Nanna',
    targetType: 'leaderboard',
    targetId: 'member-nani',
    emoji: '👏',
    timestamp: '2026-11-06T18:00:00.000Z'
  }
];

export const SAMPLE_TAUNTS: TauntMessage[] = [
  {
    id: 'taunt-1',
    fromMemberId: 'member-anna',
    fromMemberName: 'Anna',
    toMemberId: 'member-nanna',
    toMemberName: 'Nanna',
    message: 'Catch me if you can! My walking shoes are on fire! 🔥',
    timestamp: '2026-11-06T16:50:00.000Z'
  }
];

/**
 * Storage helpers with migration and fallback
 */
export function loadStepRaceData() {
  try {
    const group = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_GROUP) || 'null') || SAMPLE_FAMILY_GROUP;
    const members = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_MEMBERS) || 'null') || SAMPLE_MEMBERS;
    let challenge = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_CHALLENGE) || 'null');
    
    // Check if challenge is for today, otherwise create fresh daily challenge
    const today = getTodayLocalDateString();
    if (!challenge || challenge.date !== today) {
      challenge = getInitialDailyChallenge();
      localStorage.setItem(STORAGE_KEY_STEP_CHALLENGE, JSON.stringify(challenge));
    }

    const winners = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_WINNERS) || 'null') || SAMPLE_WINNERS;
    const tournament = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_TOURNAMENT) || 'null') || SAMPLE_TOURNAMENT;
    let quest: QuestRoute = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_QUEST) || 'null') || SAMPLE_QUEST;
    
    // Migration for quest startLocation and endLocation
    if (!quest.startLocation || !quest.endLocation) {
      quest.startLocation = quest.startLocation || 'Charminar, Hyderabad';
      quest.endLocation = quest.endLocation || 'India Gate, New Delhi';
      quest.isCustom = quest.isCustom ?? false;
      localStorage.setItem(STORAGE_KEY_STEP_QUEST, JSON.stringify(quest));
    }

    // Load routes library with fallback to DEFAULT_ROUTES_TEMPLATES
    let routesLibrary: QuestRoute[] = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_ROUTES_LIBRARY) || 'null');
    if (!routesLibrary || !Array.isArray(routesLibrary) || routesLibrary.length === 0) {
      routesLibrary = DEFAULT_ROUTES_TEMPLATES;
      localStorage.setItem(STORAGE_KEY_STEP_ROUTES_LIBRARY, JSON.stringify(routesLibrary));
    } else {
      // Ensure all default templates exist in library
      DEFAULT_ROUTES_TEMPLATES.forEach(tmpl => {
        if (!routesLibrary.some(r => r.id === tmpl.id)) {
          routesLibrary.push(tmpl);
        }
      });
      // Ensure startLocation and endLocation exist on all loaded routes
      routesLibrary = routesLibrary.map(r => ({
        ...r,
        startLocation: r.startLocation || 'Origin City',
        endLocation: r.endLocation || 'Destination City',
        isCustom: r.isCustom ?? false
      }));
    }

    const relay = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_RELAY) || 'null') || SAMPLE_RELAY;
    const boss = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_BOSS) || 'null') || SAMPLE_BOSS;
    const photos = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_PHOTOS) || 'null') || SAMPLE_PHOTOS;
    const mystery = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_MYSTERY) || 'null') || SAMPLE_MYSTERY;
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_EVENTS) || 'null') || SAMPLE_EVENTS;
    const reactions = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_REACTIONS) || 'null') || SAMPLE_REACTIONS;
    const taunts = JSON.parse(localStorage.getItem(STORAGE_KEY_STEP_TAUNTS) || 'null') || SAMPLE_TAUNTS;

    return {
      group,
      members,
      challenge,
      winners,
      tournament,
      quest,
      routesLibrary,
      relay,
      boss,
      photos,
      mystery,
      events,
      reactions,
      taunts
    };
  } catch (err) {
    console.warn('Error loading step race data, falling back to samples:', err);
    return {
      group: SAMPLE_FAMILY_GROUP,
      members: SAMPLE_MEMBERS,
      challenge: getInitialDailyChallenge(),
      winners: SAMPLE_WINNERS,
      tournament: SAMPLE_TOURNAMENT,
      quest: SAMPLE_QUEST,
      routesLibrary: DEFAULT_ROUTES_TEMPLATES,
      relay: SAMPLE_RELAY,
      boss: SAMPLE_BOSS,
      photos: SAMPLE_PHOTOS,
      mystery: SAMPLE_MYSTERY,
      events: SAMPLE_EVENTS,
      reactions: SAMPLE_REACTIONS,
      taunts: SAMPLE_TAUNTS
    };
  }
}
