import test from 'node:test';
import assert from 'node:assert/strict';

import {
  determineDailyWinner,
  calculateHandicapGoal,
  rankMembers,
  checkCounterattackTrigger,
  updateRelayProgress,
  applyBossDamage,
  hasMidnightPassed
} from '../utils/raceEngine.ts';

import { validateStepEntry } from '../utils/stepTracking.ts';
import { DailyChallenge, MemberProfile, RelayChallenge, BossMonster } from '../types/stepRace.ts';

test('1. Winner determination: First member to reach 10,000 steps wins', () => {
  const challenge: DailyChallenge = {
    date: '2026-11-06',
    goal: 10000,
    membersProgress: {
      'p1': {
        memberId: 'p1',
        steps: 10200,
        rawSteps: 10200,
        percentage: 102,
        reachedGoalAt: '2026-11-06T14:30:00.000Z',
        isGoalReached: true,
        rank: 1
      },
      'p2': {
        memberId: 'p2',
        steps: 8500,
        rawSteps: 8500,
        percentage: 85,
        reachedGoalAt: undefined,
        isGoalReached: false,
        rank: 2
      }
    },
    rewardClaimed: false,
    lastSyncTimestamp: '2026-11-06T15:00:00.000Z'
  };

  const result = determineDailyWinner(challenge, false);
  assert.equal(result.winnerId, 'p1');
  assert.equal(result.winnerReachedAt, '2026-11-06T14:30:00.000Z');
});

test('2. Tie-breaking: Member with earlier timestamp wins even if another has more steps', () => {
  const challenge: DailyChallenge = {
    date: '2026-11-06',
    goal: 10000,
    membersProgress: {
      'anna': {
        memberId: 'anna',
        steps: 12500, // Higher total steps, but finished at 18:00
        rawSteps: 12500,
        percentage: 125,
        reachedGoalAt: '2026-11-06T18:00:00.000Z',
        isGoalReached: true,
        rank: 1
      },
      'amma': {
        memberId: 'amma',
        steps: 10100, // Lower steps, but finished earlier at 16:30!
        rawSteps: 10100,
        percentage: 101,
        reachedGoalAt: '2026-11-06T16:30:00.000Z',
        isGoalReached: true,
        rank: 2
      }
    },
    rewardClaimed: false,
    lastSyncTimestamp: '2026-11-06T18:30:00.000Z'
  };

  const result = determineDailyWinner(challenge, false);
  // Amma reached 10,000 first, so Amma wins!
  assert.equal(result.winnerId, 'amma');
  assert.equal(result.winnerReachedAt, '2026-11-06T16:30:00.000Z');
});

test('3. Nobody reaches goal: No winner returned', () => {
  const challenge: DailyChallenge = {
    date: '2026-11-06',
    goal: 10000,
    membersProgress: {
      'p1': {
        memberId: 'p1',
        steps: 9200,
        rawSteps: 9200,
        percentage: 92,
        reachedGoalAt: undefined,
        isGoalReached: false,
        rank: 1
      }
    },
    rewardClaimed: false,
    lastSyncTimestamp: '2026-11-06T18:30:00.000Z'
  };

  const result = determineDailyWinner(challenge, false);
  assert.equal(result.winnerId, undefined);
  assert.equal(result.winnerReachedAt, undefined);
});

test('4. Handicap Mode: Calculates personal goals and ranks by % of target', () => {
  const seniorHandicap = calculateHandicapGoal(68, 10000);
  assert.equal(seniorHandicap.ageBracket, 'senior');
  assert.equal(seniorHandicap.multiplier, 0.5);
  assert.equal(seniorHandicap.personalGoal, 5000);

  const childHandicap = calculateHandicapGoal(10, 10000);
  assert.equal(childHandicap.ageBracket, 'child');
  assert.equal(childHandicap.multiplier, 0.6);
  assert.equal(childHandicap.personalGoal, 6000);

  // Nani (4,900 / 5,000 = 98%) vs Nanna (8,000 / 10,000 = 80%)
  const progressMap = {
    'nani': {
      memberId: 'nani',
      steps: 4900,
      rawSteps: 4900,
      percentage: 98,
      isGoalReached: false,
      rank: 0
    },
    'nanna': {
      memberId: 'nanna',
      steps: 8000,
      rawSteps: 8000,
      percentage: 80,
      isGoalReached: false,
      rank: 0
    }
  };

  const ranked = rankMembers(progressMap, true);
  // In handicap mode, Nani ranks #1 with 98%
  assert.equal(ranked[0].memberId, 'nani');
  assert.equal(ranked[0].rank, 1);
});

test('5. Anti-Cheat: Rejects implausible jumps (>150 steps/min)', () => {
  const lastSync = '2026-11-06T12:00:00.000Z';
  const nowAfter10Min = '2026-11-06T12:10:00.000Z'; // 10 minutes later

  // 10 minutes later, trying to sync 3,500 steps (350 steps/min > 150 limit)
  const validation = validateStepEntry(3500, lastSync, false, nowAfter10Min);
  assert.equal(validation.valid, false);
  assert.match(validation.reason || '', /exceeds plausible human limit/);

  // Plausible: 10 minutes later, 1,000 steps (100 steps/min <= 150 limit)
  const plausible = validateStepEntry(1000, lastSync, false, nowAfter10Min);
  assert.equal(plausible.valid, true);
});

test('6. Steal the Lead: Triggers 1-hour counterattack window when overtaken, prevents duplicate use', () => {
  const member: MemberProfile = {
    id: 'm1',
    name: 'Amma',
    avatar: '👩‍🏫',
    age: 41,
    relation: 'Mother',
    ageBracket: 'adult',
    personalGoal: 10000,
    handicapMultiplier: 1.0,
    totalWins: 2,
    currentStreak: 3,
    tournamentPoints: 10,
    tauntsRemainingToday: 3,
    counterattackUsedToday: false
  };

  // Old rank was 1, new rank dropped to 2 (overtaken!)
  const oldRanks = { 'm1': 1 };
  const newRanks = { 'm1': 2 };

  const trigger = checkCounterattackTrigger(oldRanks, newRanks, member);
  assert.equal(trigger.triggered, true);
  assert.ok(trigger.counterattackUntil);

  // If already used today, it must NOT trigger again
  const memberUsed: MemberProfile = {
    ...member,
    counterattackUsedToday: true
  };
  const secondTrigger = checkCounterattackTrigger(oldRanks, newRanks, memberUsed);
  assert.equal(secondTrigger.triggered, false);
});

test('7. Relay Challenge: Unlocks next runner only after previous leg completes', () => {
  const relay: RelayChallenge = {
    date: '2026-11-06',
    teamCompleted: false,
    legs: [
      {
        legNumber: 1,
        runnerMemberId: 'amma',
        runnerName: 'Amma',
        targetSteps: 2000,
        currentSteps: 1500,
        status: 'running'
      },
      {
        legNumber: 2,
        runnerMemberId: 'anna',
        runnerName: 'Anna',
        targetSteps: 3000,
        currentSteps: 0,
        status: 'waiting'
      }
    ]
  };

  // Amma adds 600 steps -> 2100 steps -> completes leg 1
  const updated = updateRelayProgress(relay, 'amma', 600);
  assert.equal(updated.legs[0].status, 'completed');
  assert.equal(updated.legs[1].status, 'running'); // Anna is now unlocked!
  assert.equal(updated.teamCompleted, false);
});

test('8. Daily Reset: Detects midnight rollover across date strings', () => {
  assert.equal(hasMidnightPassed('2026-11-05'), true);
});
