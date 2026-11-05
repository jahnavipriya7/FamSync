/**
 * Intelligent local coach fallback for Visakhapatnam Indian families.
 * Handles:
 * 1. match: who to ask
 * 2. quiz: 5 questions
 * 3. chore: age-safe chore with fun title
 */

export function runLocalCoach(mode, payload) {
  const timestamp = new Date().toISOString();

  if (mode === 'match') {
    const goal = (payload.goal || '').toLowerCase();
    const members = payload.members || [];

    let bestTeacher = 'Nani';
    let backupTeacher = 'Amma';
    let reason = 'Nani has decades of lived experience and heritage kitchen wisdom.';

    if (goal.includes('rasam') || goal.includes('cook') || goal.includes('pickle') || goal.includes('avakaya') || goal.includes('pulusu') || goal.includes('song')) {
      bestTeacher = 'Nani';
      backupTeacher = 'Amma';
      reason = 'Nani has over 40 years of mastery in heritage Andhra home cooking and loves teaching hands-on.';
    } else if (goal.includes('cycle') || goal.includes('puncture') || goal.includes('fuse') || goal.includes('electrical') || goal.includes('tax') || goal.includes('bike') || goal.includes('scooter') || goal.includes('bank')) {
      bestTeacher = 'Nanna';
      backupTeacher = 'Anna';
      reason = 'Nanna manages all vehicle and electrical upkeep in the house and explains safety step-by-step.';
    } else if (goal.includes('budget') || goal.includes('bazaar') || goal.includes('vegetable') || goal.includes('fold') || goal.includes('uniform') || goal.includes('stitch') || goal.includes('clean')) {
      bestTeacher = 'Amma';
      backupTeacher = 'Nani';
      reason = 'Amma is the master of home organization and smart Rythu Bazaar shopping.';
    } else if (goal.includes('phone') || goal.includes('app') || goal.includes('wifi') || goal.includes('video') || goal.includes('canva') || goal.includes('photo') || goal.includes('computer')) {
      bestTeacher = 'Anna';
      backupTeacher = 'Nanna';
      reason = 'Anna understands modern apps and digital shortcuts best in the household.';
    } else if (goal.includes('origami') || goal.includes('draw') || goal.includes('boat') || goal.includes('game') || goal.includes('bird')) {
      bestTeacher = 'Chinni';
      backupTeacher = 'Nani';
      reason = 'Chinni is creative with paper crafts and has patient step-by-step enthusiasm.';
    }

    return {
      best_teacher: bestTeacher,
      reason,
      backup_teacher: backupTeacher,
      suggested_session: {
        title: `15-Minute ${payload.goal || 'Life Skill'} Micro-Session`,
        duration_min: 15,
        steps: [
          'Gather the 2-3 essential tools or ingredients needed for this task.',
          'Teacher demonstrates the core technique for 5 minutes while learner observes.',
          'Learner performs the task hands-on with immediate friendly coaching.'
        ]
      },
      generatedAt: timestamp,
      source: 'local-engine'
    };
  }

  if (mode === 'quiz') {
    const questionBank = [
      {
        q: 'When making traditional Andhra rasam, what is the best way to extract maximum flavor from cumin and black pepper?',
        options: [
          'Boil them whole in cold water',
          'Crush them freshly in a stone mortar or coarse grinder',
          'Fry them until black and burnt',
          'Add them after the rasam has cooled'
        ],
        answer_index: 1,
        for_age_group: 'kid'
      },
      {
        q: 'To find a tiny leak in a bicycle or scooter inner tube, what household trick is safest and easiest?',
        options: [
          'Hold a candle flame near the rubber',
          'Submerge the pumped tube in a bucket of water and watch for bubbles',
          'Smell the tire with your eyes closed',
          'Cut the tube open to inspect the inside'
        ],
        answer_index: 1,
        for_age_group: 'teen'
      },
      {
        q: 'At the Rythu Bazaar, how can you identify fresh, tender Andhra drumsticks (Munakkada)?',
        options: [
          'They should be rock-hard and yellow',
          'They should be flexible enough to bend slightly without snapping',
          'They must have large bulging woody seeds',
          'They should be slimy to the touch'
        ],
        answer_index: 1,
        for_age_group: 'adult'
      },
      {
        q: 'Before resetting a tripped MCB or electrical breaker at home, what must you always wear on your feet?',
        options: [
          'Wet cotton socks',
          'Dry rubber slippers or rubber-soled footwear',
          'Steel-toed boots with bare feet',
          'Nothing, bare feet are safest'
        ],
        answer_index: 1,
        for_age_group: 'teen'
      },
      {
        q: 'What is the best way to fold clean school uniform shirts so they stay crisp in the cupboard?',
        options: [
          'Roll them into a tight messy ball',
          'Button top & middle, fold sleeves flat behind back, fold lower half up',
          'Throw them on the chair until tomorrow morning',
          'Stuff them under the mattress'
        ],
        answer_index: 1,
        for_age_group: 'kid'
      }
    ];

    return {
      questions: questionBank,
      generatedAt: timestamp,
      source: 'local-engine'
    };
  }

  if (mode === 'chore') {
    const age = payload.loserAge || 12;
    const name = payload.loserName || 'Player';

    let choresForAge = [
      {
        title: 'Sock Detective: The Great Pair Mystery',
        description: `Inspect the clean laundry basket and match all stray socks into neat pairs for the family wardrobe.`,
        duration_min: 12,
        safety_note: 'Safe for all ages. Sit comfortably on the rug or sofa.',
        fun_twist: 'Challenge: Try matching 10 pairs before your favorite Telugu song finishes playing!'
      },
      {
        title: 'Spice Inspector: Masala Dabba Alignment',
        description: `Wipe down the family spice box (masala dabba) lid and ensure all mini bowls (turmeric, mustard, jeera) are neatly centered and closed.`,
        duration_min: 15,
        safety_note: 'Keep spices away from eyes. Wash hands thoroughly with soap afterward.',
        fun_twist: 'Can you guess which spice smells sweetest with your eyes closed?'
      },
      {
        title: 'Balcony Botanical Caretaker',
        description: `Check all potted plants on the balcony or terrace. Remove dry fallen leaves and gently water each base.`,
        duration_min: 15,
        safety_note: 'Do not lean over railings. Use a small plastic mug.',
        fun_twist: 'Count how many new green baby leaves sprouted this week!'
      },
      {
        title: 'Shoe Rack Air-Traffic Controller',
        description: `Organize the family footwear at the entrance: line up slippers, school shoes, and walking shoes in neat orderly rows.`,
        duration_min: 10,
        safety_note: 'Wash hands after sorting footwear.',
        fun_twist: 'Sort pairs by size from smallest (Chinni) to largest (Nanna)!'
      }
    ];

    if (age >= 16) {
      choresForAge.push({
        title: 'Dining Table Tech Sweeper',
        description: `Clear all stray chargers, cables, and papers off the dining and study table so the surface is gleaming clean.`,
        duration_min: 15,
        safety_note: 'Unplug cables gently from wall sockets with dry hands.',
        fun_twist: 'Coil cables using Velcro ties or rubber bands for bonus style points!'
      });
    }

    const selected = choresForAge[Math.floor(Math.random() * choresForAge.length)];
    return {
      ...selected,
      assignedTo: name,
      generatedAt: timestamp,
      source: 'local-engine'
    };
  }

  return {
    error: 'Invalid mode',
    generatedAt: timestamp
  };
}
