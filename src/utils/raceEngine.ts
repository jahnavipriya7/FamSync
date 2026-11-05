import { 
  DailyChallenge, 
  DailyChallengeMemberProgress, 
  MemberProfile, 
  AgeBracket, 
  RelayChallenge, 
  BossMonster 
} from '../types/stepRace';

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getTodayLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns remaining hours, minutes, and seconds until the local midnight reset.
 */
export function getTimeUntilLocalMidnight(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { hours, minutes, seconds, formatted };
}

/**
 * Calculates handicap goal and percentage based on age bracket or custom setting.
 */
export function calculateHandicapGoal(age: number, baseGoal: number = 10000): { personalGoal: number; multiplier: number; ageBracket: AgeBracket } {
  let ageBracket: AgeBracket = 'adult';
  let multiplier = 1.0;

  if (age <= 12) {
    ageBracket = 'child';
    multiplier = 0.6; // 6,000 steps
  } else if (age <= 17) {
    ageBracket = 'teen';
    multiplier = 0.9; // 9,000 steps
  } else if (age >= 60) {
    ageBracket = 'senior';
    multiplier = 0.5; // 5,000 steps
  } else {
    ageBracket = 'adult';
    multiplier = 1.0; // 10,000 steps
  }

  const personalGoal = Math.round(baseGoal * multiplier);
  return { personalGoal, multiplier, ageBracket };
}

/**
 * Determine daily winner breaking ties by earliest exact ISO timestamp.
 * If nobody has reached 100% of their goal, returns undefined (no winner).
 */
export function determineDailyWinner(
  challenge: DailyChallenge,
  handicapMode: boolean = false
): { winnerId?: string; winnerReachedAt?: string } {
  const progressList = Object.values(challenge.membersProgress);
  
  // Eligible candidates are members who reached the goal (100% or >= goal steps)
  const finishers = progressList.filter(p => {
    if (handicapMode) {
      return p.percentage >= 100;
    }
    return p.steps >= challenge.goal;
  });

  if (finishers.length === 0) {
    return { winnerId: undefined, winnerReachedAt: undefined };
  }

  // Sort by reachedGoalAt timestamp ascending. Earliest timestamp wins!
  finishers.sort((a, b) => {
    const timeA = a.reachedGoalAt ? new Date(a.reachedGoalAt).getTime() : Infinity;
    const timeB = b.reachedGoalAt ? new Date(b.reachedGoalAt).getTime() : Infinity;
    return timeA - timeB;
  });

  const winner = finishers[0];
  return {
    winnerId: winner.memberId,
    winnerReachedAt: winner.reachedGoalAt
  };
}

/**
 * Ranks all members for the challenge leaderboard.
 */
export function rankMembers(
  membersProgress: Record<string, DailyChallengeMemberProgress>,
  handicapMode: boolean = false
): DailyChallengeMemberProgress[] {
  const list = Object.values(membersProgress);
  
  list.sort((a, b) => {
    if (handicapMode) {
      // Primary sort: Percentage descending
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      // Secondary sort: Earliest goal reached timestamp
      if (a.reachedGoalAt && b.reachedGoalAt) {
        return new Date(a.reachedGoalAt).getTime() - new Date(b.reachedGoalAt).getTime();
      }
      return b.steps - a.steps;
    } else {
      // Primary sort: Raw steps descending
      if (b.steps !== a.steps) return b.steps - a.steps;
      if (a.reachedGoalAt && b.reachedGoalAt) {
        return new Date(a.reachedGoalAt).getTime() - new Date(b.reachedGoalAt).getTime();
      }
      return 0;
    }
  });

  return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
}

/**
 * Checks if a member was passed on the leaderboard and triggers a 1-hour Counterattack (1.5x).
 * Counterattack can be triggered at most once per member per day.
 */
export function checkCounterattackTrigger(
  previousRanks: Record<string, number>,
  newRanks: Record<string, number>,
  member: MemberProfile
): { triggered: boolean; counterattackUntil?: string } {
  const oldRank = previousRanks[member.id];
  const currentRank = newRanks[member.id];

  // If member dropped in rank (e.g. from rank 1 to 2, or 2 to 3)
  if (oldRank && currentRank && currentRank > oldRank) {
    // Check if not already used today and no active window
    const now = new Date();
    const isCurrentlyActive = member.counterattackUntil && new Date(member.counterattackUntil) > now;
    
    if (!member.counterattackUsedToday && !isCurrentlyActive) {
      const windowEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour
      return { triggered: true, counterattackUntil: windowEnd };
    }
  }

  return { triggered: false };
}

/**
 * Advances relay challenge legs when runners sync steps.
 */
export function updateRelayProgress(relay: RelayChallenge, runnerMemberId: string, stepsToAdd: number): RelayChallenge {
  const updatedLegs = relay.legs.map(leg => {
    if (leg.runnerMemberId === runnerMemberId && leg.status === 'running') {
      const newSteps = leg.currentSteps + stepsToAdd;
      const isComplete = newSteps >= leg.targetSteps;
      return {
        ...leg,
        currentSteps: newSteps,
        status: isComplete ? ('completed' as const) : ('running' as const),
        completedAt: isComplete ? (leg.completedAt || new Date().toISOString()) : undefined
      };
    }
    return leg;
  });

  // Check if current running leg just completed, unlock next waiting leg
  let foundRunning = false;
  let allDone = true;

  for (let i = 0; i < updatedLegs.length; i++) {
    if (updatedLegs[i].status === 'completed') {
      continue;
    }
    allDone = false;
    if (!foundRunning) {
      updatedLegs[i].status = 'running';
      foundRunning = true;
    }
  }

  return {
    ...relay,
    legs: updatedLegs,
    teamCompleted: allDone,
    completedAt: allDone ? (relay.completedAt || new Date().toISOString()) : undefined
  };
}

/**
 * Applies damage to Boss Monster with anti-cheat damage cap per sync.
 */
export function applyBossDamage(
  boss: BossMonster, 
  memberId: string, 
  memberName: string, 
  steps: number
): { boss: BossMonster; damageDealt: number } {
  // Cap damage per single sync at 3,000 to prevent sudden massive exploits
  const damageDealt = Math.min(3000, Math.max(0, steps));
  const newHp = Math.max(0, boss.currentHp - damageDealt);
  const defeated = newHp <= 0;

  const newLog = [
    {
      memberId,
      memberName,
      damage: damageDealt,
      timestamp: new Date().toISOString()
    },
    ...boss.damageLog.slice(0, 49) // keep last 50 entries
  ];

  return {
    damageDealt,
    boss: {
      ...boss,
      currentHp: newHp,
      defeated,
      damageLog: newLog
    }
  };
}

/**
 * Checks if local midnight has passed since last check.
 */
export function hasMidnightPassed(lastDateStr: string): boolean {
  const todayStr = getTodayLocalDateString();
  return todayStr !== lastDateStr;
}
