import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  MemberProfile, 
  WinnerRecord, 
  PhotoPost, 
  TauntMessage, 
  RelayLeg, 
  DamageEntry, 
  QuestRoute 
} from '../types/stepRace';
import { 
  getMemberDisplayName, 
  getMemberAvatar, 
  getMemberById,
  calculateStepsFromDistanceKm,
  calculateDistanceKmFromSteps
} from '../utils/stepRaceStorage';
import { 
  validateMemberName, 
  validateNickname, 
  validateGroupName, 
  validateRouteName, 
  validateLocation, 
  validateDistanceKm, 
  validateLandmarkFact 
} from '../utils/validation';

test('1. Dynamic Rename Propagation: updating member by ID reflects across all history records', () => {
  const initialMembers: MemberProfile[] = [
    {
      id: 'member-amma',
      name: 'Amma (Mother)',
      nickname: '',
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
    }
  ];

  // Records created with old names as fallbacks
  const oldWinner: WinnerRecord = {
    id: 'win-1',
    date: '2026-11-03',
    memberId: 'member-amma',
    memberName: 'Amma (Mother)',
    memberAvatar: '👩‍🏫',
    steps: 10450,
    reachedGoalAt: '2026-11-03T18:20:30.000Z',
    rewardTitle: 'Hot ginger tea served',
    handicapApplied: false
  };

  const oldPhoto: PhotoPost = {
    id: 'photo-1',
    memberId: 'member-amma',
    memberName: 'Amma (Mother)',
    avatar: '👩‍🏫',
    caption: 'Morning walk at RK beach',
    photoUrl: '',
    location: 'RK Beach',
    timestamp: '2026-11-04T07:00:00.000Z',
    likes: []
  };

  const oldTaunt: TauntMessage = {
    id: 'taunt-1',
    fromMemberId: 'member-amma',
    fromMemberName: 'Amma (Mother)',
    toMemberId: 'member-nanna',
    toMemberName: 'Nanna (Father)',
    message: 'Catch me if you can!',
    timestamp: '2026-11-05T08:00:00.000Z'
  };

  const oldRelayLeg: RelayLeg = {
    legNumber: 1,
    runnerMemberId: 'member-amma',
    runnerName: 'Amma (Mother)',
    targetSteps: 3000,
    currentSteps: 3000,
    status: 'completed'
  };

  const oldDamage: DamageEntry = {
    memberId: 'member-amma',
    memberName: 'Amma (Mother)',
    damage: 2100,
    timestamp: '2026-11-06T15:10:00.000Z'
  };

  // Verify initial resolution
  assert.equal(getMemberDisplayName(initialMembers, oldWinner.memberId, oldWinner.memberName), 'Amma (Mother)');
  assert.equal(getMemberAvatar(initialMembers, oldWinner.memberId, oldWinner.memberAvatar), '👩‍🏫');

  // Now, Member renames herself and adds a nickname and changes avatar!
  const updatedMembers: MemberProfile[] = initialMembers.map(m => {
    if (m.id === 'member-amma') {
      return {
        ...m,
        name: 'Padma Sundaram',
        nickname: 'SuperMom',
        avatar: '👑'
      };
    }
    return m;
  });

  // Verify that all past records now dynamically resolve to the updated name, nickname and avatar!
  const resolvedWinnerName = getMemberDisplayName(updatedMembers, oldWinner.memberId, oldWinner.memberName);
  const resolvedWinnerAvatar = getMemberAvatar(updatedMembers, oldWinner.memberId, oldWinner.memberAvatar);
  assert.equal(resolvedWinnerName, 'Padma Sundaram (SuperMom)');
  assert.equal(resolvedWinnerAvatar, '👑');

  const resolvedPhotoAuthor = getMemberDisplayName(updatedMembers, oldPhoto.memberId, oldPhoto.memberName);
  const resolvedPhotoAvatar = getMemberAvatar(updatedMembers, oldPhoto.memberId, oldPhoto.avatar);
  assert.equal(resolvedPhotoAuthor, 'Padma Sundaram (SuperMom)');
  assert.equal(resolvedPhotoAvatar, '👑');

  const resolvedTauntSender = getMemberDisplayName(updatedMembers, oldTaunt.fromMemberId, oldTaunt.fromMemberName);
  assert.equal(resolvedTauntSender, 'Padma Sundaram (SuperMom)');

  const resolvedRelayRunner = getMemberDisplayName(updatedMembers, oldRelayLeg.runnerMemberId, oldRelayLeg.runnerName);
  assert.equal(resolvedRelayRunner, 'Padma Sundaram (SuperMom)');

  const resolvedDamageHero = getMemberDisplayName(updatedMembers, oldDamage.memberId, oldDamage.memberName);
  assert.equal(resolvedDamageHero, 'Padma Sundaram (SuperMom)');
});

test('2. Member Name Validation: checks non-empty, min 2, max 30 characters and trimming', () => {
  // Empty or whitespace
  assert.equal(validateMemberName('').valid, false);
  assert.equal(validateMemberName('   ').valid, false);
  assert.match(validateMemberName('').error || '', /cannot be empty/i);

  // Too short (< 2)
  assert.equal(validateMemberName('A').valid, false);
  assert.match(validateMemberName('A').error || '', /at least 2 characters/i);

  // Too long (> 30)
  const tooLong = 'A'.repeat(31);
  assert.equal(validateMemberName(tooLong).valid, false);
  assert.match(validateMemberName(tooLong).error || '', /cannot exceed 30/i);

  // Valid names
  const valid1 = validateMemberName('Jahnavi');
  assert.equal(valid1.valid, true);
  assert.equal(valid1.sanitizedValue, 'Jahnavi');

  const validWithSpaces = validateMemberName('  Amma Padma  ');
  assert.equal(validWithSpaces.valid, true);
  assert.equal(validWithSpaces.sanitizedValue, 'Amma Padma');
});

test('3. Nickname Validation: optional, max 20 characters and trimming', () => {
  // Optional empty values
  assert.equal(validateNickname(undefined).valid, true);
  assert.equal(validateNickname('').valid, true);
  assert.equal(validateNickname('   ').valid, true);
  assert.equal(validateNickname('').sanitizedValue, '');

  // Too long (> 20)
  const longNick = 'SuperUltraMegaRunner123';
  assert.equal(validateNickname(longNick).valid, false);
  assert.match(validateNickname(longNick).error || '', /cannot exceed 20/i);

  // Valid nickname
  const validNick = validateNickname('  Speedy  ');
  assert.equal(validNick.valid, true);
  assert.equal(validNick.sanitizedValue, 'Speedy');
});

test('4. Family Group Name Validation: checks non-empty, min 2, max 50 characters', () => {
  assert.equal(validateGroupName('').valid, false);
  assert.equal(validateGroupName(' ').valid, false);
  assert.equal(validateGroupName('X').valid, false);
  
  const tooLongGroup = 'G'.repeat(51);
  assert.equal(validateGroupName(tooLongGroup).valid, false);

  const validGroup = validateGroupName('  Vizag Beach Walkers 2026  ');
  assert.equal(validGroup.valid, true);
  assert.equal(validGroup.sanitizedValue, 'Vizag Beach Walkers 2026');
});

test('5. Route Name & Location Validation: checks boundary lengths', () => {
  // Route Name: 2 to 60 chars
  assert.equal(validateRouteName('').valid, false);
  assert.equal(validateRouteName('R').valid, false);
  assert.equal(validateRouteName('A'.repeat(61)).valid, false);
  const validRoute = validateRouteName('Vizag to Araku Valley Hill Climb');
  assert.equal(validRoute.valid, true);
  assert.equal(validRoute.sanitizedValue, 'Vizag to Araku Valley Hill Climb');

  // Location: 2 to 50 chars
  assert.equal(validateLocation('', 'Start location').valid, false);
  assert.equal(validateLocation('L', 'Start location').valid, false);
  assert.equal(validateLocation('L'.repeat(51), 'End location').valid, false);
  const validLoc = validateLocation('  Kailasagiri Hilltop  ');
  assert.equal(validLoc.valid, true);
  assert.equal(validLoc.sanitizedValue, 'Kailasagiri Hilltop');
});

test('6. Distance Validation & Step Conversion: 0.75m per step calculations', () => {
  // Negative or 0 or NaN
  assert.equal(validateDistanceKm(0).valid, false);
  assert.equal(validateDistanceKm(-5).valid, false);
  assert.equal(validateDistanceKm('invalid').valid, false);
  assert.equal(validateDistanceKm(50001).valid, false);

  // Valid distance
  const validDist = validateDistanceKm('30.5');
  assert.equal(validDist.valid, true);
  assert.equal(validDist.sanitizedValue, 30.5);

  // Step conversion at 0.75 m/step:
  // 30 km = 30,000 meters / 0.75 = 40,000 steps
  assert.equal(calculateStepsFromDistanceKm(30), 40000);

  // 1,500 km = 1,500,000 meters / 0.75 = 2,000,000 steps
  assert.equal(calculateStepsFromDistanceKm(1500), 2000000);

  // Reverse conversion: 40,000 steps * 0.75 / 1000 = 30 km
  assert.equal(calculateDistanceKmFromSteps(40000), 30);
});

test('7. Landmark Fun Fact Validation: max 250 chars', () => {
  const shortFact = 'Built in 1591 CE, its four minarets stand 48.7 meters high!';
  assert.equal(validateLandmarkFact(shortFact).valid, true);

  const longFact = 'X'.repeat(251);
  assert.equal(validateLandmarkFact(longFact).valid, false);
  assert.match(validateLandmarkFact(longFact).error || '', /cannot exceed 250/i);
});

test('8. Custom Route Creation: valid route with landmarks and step calculation', () => {
  const customRoute: QuestRoute = {
    id: `custom-route-${Date.now()}`,
    title: "Home to Grandma's Village in Anakapalle",
    startLocation: 'MVP Colony, Visakhapatnam',
    endLocation: 'Anakapalle Jaggery Market',
    description: 'Weekend family journey from city home to native village.',
    totalDistanceKm: 45,
    totalStepsRequired: calculateStepsFromDistanceKm(45), // 60,000 steps
    currentSteps: 0,
    completed: false,
    isCustom: true,
    memberContributions: {},
    landmarks: [
      {
        id: 'lm-1',
        title: 'MVP Colony Park',
        distanceKm: 0,
        stepsRequired: calculateStepsFromDistanceKm(0),
        funFact: 'Our morning assembly point near the mango tree.',
        badgeIcon: '🏡',
        unlocked: true
      },
      {
        id: 'lm-2',
        title: 'Gajuwaka Junction',
        distanceKm: 20,
        stepsRequired: calculateStepsFromDistanceKm(20),
        funFact: 'The bustling industrial and commercial crossroad of Visakhapatnam.',
        badgeIcon: '🏭',
        unlocked: false
      },
      {
        id: 'lm-3',
        title: "Grandma's Village, Anakapalle",
        distanceKm: 45,
        stepsRequired: calculateStepsFromDistanceKm(45),
        funFact: 'Famous for the second largest jaggery market in India and warm hospitality!',
        badgeIcon: '👵',
        unlocked: false
      }
    ]
  };

  assert.equal(customRoute.totalStepsRequired, 60000);
  assert.equal(customRoute.landmarks.length, 3);
  assert.equal(customRoute.landmarks[1].stepsRequired, calculateStepsFromDistanceKm(20));
  assert.equal(customRoute.isCustom, true);
});
