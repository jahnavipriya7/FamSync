import { FamilyGameChallenge } from '../types';

export const DAILY_GAMES_ROTATION: FamilyGameChallenge[] = [
  {
    id: 'game-sun',
    gameType: 'Ludo',
    title: 'Sunday Ludo Royal Championship',
    icon: '🎲',
    suggestedPlayers: 'All 4: Amma, Nanna, Chinni, Anna',
    durationMin: 20,
    quickRules: [
      'Each player picks 2 tokens to make the round faster (15-20 min max).',
      'Roll a 6 to bring your token out onto the board track.',
      'First player to get both tokens into the center home triangle wins!'
    ],
    funTwist: 'Every time you roll a 6, tell 1 good thing that happened at school or work this week!',
    loserChore: 'Shoe Rack Air-Traffic Controller (align all family footwear neatly)',
    dayLabel: 'Sunday Special'
  },
  {
    id: 'game-mon',
    gameType: 'Snakes & Ladders',
    title: 'Monday Snakes & Ladders: The Virtue Climb',
    icon: '🪜',
    suggestedPlayers: 'Chinni (10) + Nani (Grandmother) + Anna',
    durationMin: 15,
    quickRules: [
      'Take turns rolling the digital or physical dice.',
      'Ladders lift you forward; snake heads slide you back down.',
      'First to reach square 100 wins!'
    ],
    funTwist: 'If you land on a ladder, answer 1 fast math or general knowledge question to climb!',
    loserChore: 'Sock Detective (match and roll all stray clean socks in the basket)',
    dayLabel: 'Monday Challenge'
  },
  {
    id: 'game-tue',
    gameType: 'Carrom',
    title: 'Tuesday Carrom Striker Blitz',
    icon: '🎯',
    suggestedPlayers: 'Anna (16) vs Nanna vs Chinni',
    durationMin: 15,
    quickRules: [
      'Pocket white coins (+10 pts) and black coins (+5 pts).',
      'The red Queen (+25 pts) must be covered with another coin on the very next shot.',
      'First to reach 30 points wins the duel.'
    ],
    funTwist: 'Strike with your non-dominant hand for 1 shot to earn double style points!',
    loserChore: 'Dining Table Sweeper (clear chargers, papers, and wipe dining table clean)',
    dayLabel: 'Tuesday Challenge'
  },
  {
    id: 'game-wed',
    gameType: 'Ashta Chamma',
    title: 'Wednesday Ashta Chamma (Traditional Andhra Race)',
    icon: '🐚',
    suggestedPlayers: 'Chinni + Nani (Grandmother) + Amma',
    durationMin: 15,
    quickRules: [
      'Traditional 5x5 board game using 4 cowrie shells or dice numbers (1, 2, 3, 4, 8).',
      'Roll Ashta (8) or Chamma (4) to enter the inner ring.',
      'First to safely lead all pawns into the central square wins.'
    ],
    funTwist: 'Nani shares 1 heritage childhood story from her village days before the game starts!',
    loserChore: 'Balcony Botanical Caretaker (water all 6 potted tulsi and flower pots)',
    dayLabel: 'Wednesday Challenge'
  },
  {
    id: 'game-thu',
    gameType: 'Antakshari & Charades',
    title: 'Thursday Telugu Cinema & Music Charades',
    icon: '🎬',
    suggestedPlayers: 'Team Kids (Anna + Chinni) vs Team Elders (Amma + Nani)',
    durationMin: 15,
    quickRules: [
      'Round 1: Sing Telugu film songs starting with the ending letter of the previous song.',
      'Round 2: Act out a famous movie or daily chore without speaking; team guesses in 60s.',
      'Team with most correct guesses wins.'
    ],
    funTwist: 'Grandmother Nani can sing an Annamacharya keerthana as a golden wildcard!',
    loserChore: 'Masala Dabba Alignment (wipe and center the spice box containers neatly)',
    dayLabel: 'Thursday Challenge'
  },
  {
    id: 'game-fri',
    gameType: 'Chess',
    title: 'Friday Speed Chess Clash',
    icon: '♟️',
    suggestedPlayers: 'Anna (16) vs Nanna (Father)',
    durationMin: 15,
    quickRules: [
      'Speed chess: each player has 7 minutes total thinking time.',
      'Standard rules: checkmate wins, stalemate draws.',
      'Focus on center board control and king safety (castling).'
    ],
    funTwist: 'Explain your best tactical trap out loud to Chinni so she learns the strategy!',
    loserChore: 'Fridge Magnet & Note Organizer (clean expired post-it notes and align magnets)',
    dayLabel: 'Friday Challenge'
  },
  {
    id: 'game-sat',
    gameType: 'Ludo',
    title: 'Saturday Weekend Ludo Grand Finale',
    icon: '👑',
    suggestedPlayers: 'Full Family: Parents, Grandparents & Kids',
    durationMin: 20,
    quickRules: [
      'Fast 2-token per player rule.',
      'Safe colored star squares protect you from being captured.',
      'First team or player to reach center home wins +20 points.'
    ],
    funTwist: 'Loser gets to choose what sweet Andhra dessert Amma and Nani prepare tomorrow!',
    loserChore: 'Newspaper & Book Stacker (stack all daily newspapers and textbooks into neat piles)',
    dayLabel: 'Saturday Special'
  },
  {
    id: 'game-tictactoe',
    gameType: 'Tic-Tac-Toe',
    title: 'Tic-Tac-Toe Family Championship Duel',
    icon: '⭕',
    suggestedPlayers: 'Kids (Anna vs Chinni) or Parents vs Kids',
    durationMin: 10,
    quickRules: [
      'Take turns placing X or O on the 3x3 grid.',
      'Get 3 in a row horizontally, vertically, or diagonally to win.',
      'Best of 3 rounds decides the family champion.'
    ],
    funTwist: 'Whenever you block a winning line, shout "Vizag Defense!" with both hands up!',
    loserChore: 'Water Bottle Refill Captain (fill all 4 dinner water bottles from RO filter)',
    dayLabel: 'AI Quick Match'
  }
];

export function getTodayGameChallenge(): FamilyGameChallenge {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  return DAILY_GAMES_ROTATION[dayIndex] || DAILY_GAMES_ROTATION[0];
}

export function generateRandomGameChallenge(childName: string = 'Chinni'): FamilyGameChallenge {
  const pool = DAILY_GAMES_ROTATION;
  const randomPick = pool[Math.floor(Math.random() * pool.length)];
  const twists = [
    'Every time a point or move is scored, recite 1 new English or Telugu vocabulary word!',
    'The player with the lowest score at halftime gets a free coaching tip from Nani.',
    'Play standing on one leg for 30 seconds when you land on a danger square or lose a piece!',
    'Sing a 10-second Telugu film tune whenever you make a capture or block!',
    'Winner gets first choice of Sunday breakfast dish (Dosa / Idli / Poori)!',
    'Before starting, all players must say 1 thing they appreciate about each other.'
  ];
  const chores = [
    'Shoe Rack Air-Traffic Controller (align all family footwear neatly)',
    'Sock Detective: The Great Pair Mystery (match and fold 10 pairs of socks)',
    'Dining Table Tech Sweeper (unplug chargers and wipe table surface)',
    'Balcony Botanical Caretaker (water all potted plants with a plastic mug)',
    'Masala Dabba Alignment (center all mini spice bowls in the kitchen box)',
    'Water Bottle Refill Captain (fill all 4 dinner bottles from the RO filter)'
  ];

  return {
    ...randomPick,
    id: `game-rand-${Date.now()}`,
    dayLabel: 'AI Generated Random Game',
    funTwist: twists[Math.floor(Math.random() * twists.length)],
    loserChore: chores[Math.floor(Math.random() * chores.length)]
  };
}
