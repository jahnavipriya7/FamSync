export type UserPersona = 'parent' | 'grandparent' | 'child';
export type ScreenCategory = 'study' | 'games' | 'videos' | 'social';
export type ScreenType = 'home' | 'step-race' | 'games' | 'coop' | 'social' | 'tournaments' | 'parent' | 'child' | 'report' | 'about';
export type Language = 'en' | 'te';

export * from './stepRace';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  dailyLimitMin: number; // default 90 min
  usedTodayMin: number;
  bonusEarnedTodayMin: number; // daily cap 30 min
  categorySplitToday: Record<ScreenCategory, number>; // in minutes
  schoolLock: { start: string; end: string; enabled: boolean }; // e.g. "08:30" - "15:30"
  tuitionLock: { start: string; end: string; enabled: boolean }; // e.g. "17:00" - "19:00"
  bedtimeLock: { start: string; end: string; enabled: boolean }; // e.g. "21:30" - "06:30"
  examMode: { enabled: boolean; daysRemaining: number };
  streakDays: number;
  choresCompletedCount: number;
  isSample?: boolean;
}

export interface EarnRequest {
  id: string;
  childId: string;
  childName: string;
  type: 'reading' | 'elder_skill' | 'chore';
  title: string;
  requestedMin: number;
  note?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  approvedBy?: string;
  isSample?: boolean;
}

export interface DayUsageLog {
  dayName: string; // "Mon", "Tue", etc.
  date: string;
  childId: string;
  totalUsedMin: number;
  studyMin: number;
  entertainmentMin: number;
  limitMin: number;
  bonusEarnedMin: number;
  choresDone: number;
}

export interface AIParentInsight {
  summary: string;
  concerns: string[];
  suggested_limit_min: number;
  earn_tasks: { title: string; bonus_min: number; why: string }[];
  conversation_starter: string;
  weekend_chore: { title: string; duration_min: number; safety_note: string };
  generatedAt: string;
  source: 'gemini-live' | 'local-engine';
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer_index: number;
}

export interface FamilyGameChallenge {
  id: string;
  gameType: 'Ludo' | 'Chess' | 'Tic-Tac-Toe' | 'Snakes & Ladders' | 'Carrom' | 'Ashta Chamma' | 'Antakshari & Charades' | 'Quiz Duel';
  title: string;
  icon: string;
  suggestedPlayers: string;
  durationMin: number;
  quickRules: string[];
  funTwist: string;
  loserChore: string;
  dayLabel: string;
}
