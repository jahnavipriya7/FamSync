export type Language = 'en' | 'te';

export interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  adminMemberId: string;
  dailyStepGoal: number; // default 10,000
  createdAt: string;
  customReward: string; // e.g. "Winner picks Sunday dinner & Amma gets evening tea served"
  cooperativeMode: 'quest' | 'relay' | 'boss';
  handicapModeEnabled: boolean;
  handicapAutoByAge: boolean;
}

export type AgeBracket = 'child' | 'teen' | 'adult' | 'senior';

export interface MemberProfile {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  age: number;
  relation: string;
  ageBracket: AgeBracket;
  personalGoal: number; // e.g. 10,000 or adjusted by handicap
  handicapMultiplier: number; // e.g. 0.6 for child (6k), 0.5 for senior (5k), 0.9 for teen (9k), 1.0 for adult
  totalWins: number;
  currentStreak: number;
  tournamentPoints: number;
  counterattackUntil?: string; // ISO string if Steal The Lead is active (1-hour window)
  counterattackUsedToday?: boolean;
  tauntsRemainingToday: number; // default 3
  linkedWalkWith?: {
    partnerId: string;
    startedAt: string;
    minutesToday: number;
  };
}

export interface StepEntry {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD in local timezone
  steps: number;
  rawSteps: number;
  isManual: boolean;
  source: 'pedometer' | 'sensor' | 'manual';
  timestamp: string; // ISO string
  verifiedRate: boolean;
}

export interface DailyChallengeMemberProgress {
  memberId: string;
  steps: number;
  rawSteps: number;
  percentage: number;
  reachedGoalAt?: string; // Exact ISO timestamp when 100% was crossed
  isGoalReached: boolean;
  rank: number;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  goal: number;
  membersProgress: Record<string, DailyChallengeMemberProgress>;
  winnerMemberId?: string;
  winnerReachedAt?: string;
  rewardClaimed: boolean;
  mysteryChallengeId?: string;
  mysteryWinnerId?: string;
  lastSyncTimestamp: string;
}

export interface WinnerRecord {
  id: string;
  date: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  steps: number;
  reachedGoalAt: string;
  rewardTitle: string;
  handicapApplied: boolean;
}

export interface TournamentStanding {
  memberId: string;
  memberName: string;
  avatar: string;
  totalPoints: number; // 1st=10, 2nd=6, 3rd=3, goal=+2
  dailyWins: number;
  goalsReached: number;
  totalSteps: number;
}

export interface WeeklyTournament {
  weekId: string; // e.g. "2026-W45" (Monday to Sunday)
  startDate: string;
  endDate: string;
  standings: TournamentStanding[];
  championMemberId?: string;
  isCompleted: boolean;
}

export interface Landmark {
  id: string;
  title: string;
  distanceKm: number;
  stepsRequired: number;
  funFact: string;
  badgeIcon: string;
  unlocked: boolean;
  imageUrl?: string;
}

export interface QuestRoute {
  id: string;
  title: string;
  startLocation: string;
  endLocation: string;
  description: string;
  totalDistanceKm: number;
  totalStepsRequired: number;
  currentSteps: number;
  landmarks: Landmark[];
  completed: boolean;
  isCustom?: boolean;
  memberContributions: Record<string, number>; // memberId -> steps contributed
}

export interface RelayLeg {
  legNumber: number;
  runnerMemberId: string;
  runnerName: string;
  targetSteps: number;
  currentSteps: number;
  status: 'waiting' | 'running' | 'completed';
  completedAt?: string;
}

export interface RelayChallenge {
  date: string; // YYYY-MM-DD
  legs: RelayLeg[];
  teamCompleted: boolean;
  completedAt?: string;
}

export interface DamageEntry {
  memberId: string;
  memberName: string;
  damage: number;
  timestamp: string;
}

export interface BossMonster {
  id: string;
  name: string;
  title: string;
  avatar: string;
  totalHp: number;
  currentHp: number;
  weekNumber: number;
  damageLog: DamageEntry[];
  defeated: boolean;
  escaped: boolean;
  badgeName: string;
}

export interface Reaction {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  targetType: 'leaderboard' | 'photo' | 'win';
  targetId: string;
  emoji: string;
  timestamp: string;
}

export interface TauntMessage {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  message: string;
  timestamp: string;
}

export interface PhotoPost {
  id: string;
  memberId: string;
  memberName: string;
  avatar: string;
  caption: string;
  photoUrl: string; // Base64 compressed image
  location: string;
  timestamp: string;
  likes: string[]; // memberIds who liked
}

export interface MysteryChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'evening_power' | 'early_bird' | 'morning_hustle' | 'sniper_8k' | 'lunch_stroll';
  bonusPoints: number;
  isRevealed: boolean;
}

export interface SeasonalEvent {
  id: string;
  title: string;
  theme: {
    primaryColor: string;
    icon: string;
    banner: string;
  };
  startDate: string;
  endDate: string;
  badgeName: string;
  challengeDescription: string;
  targetFamilySteps: number;
  currentFamilySteps: number;
  isActive: boolean;
}

export interface DailyRecap {
  date: string;
  winner?: {
    name: string;
    avatar: string;
    steps: number;
    reachedAt: string;
  };
  topWalkers: { name: string; avatar: string; steps: number }[];
  totalFamilySteps: number;
  distanceKm: number;
  bossHpRemaining: number;
  questProgressPercent: number;
  mysteryChallengeTitle?: string;
  generatedAt: string;
}
