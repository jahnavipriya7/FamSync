import { AIParentInsight, ChildProfile } from '../types';

export function generateLocalParentInsight(children: ChildProfile[]): AIParentInsight {
  const hasExamMode = children.some(c => c.examMode?.enabled);
  const totalBonus = children.reduce((sum, c) => sum + (c.bonusEarnedTodayMin || 0), 0);

  return {
    summary: `Your Vizag household maintained healthy boundaries this week. ${
      hasExamMode ? 'Exam mode is active, successfully restricting entertainment during crucial preparation.' : 'Daily screen time remained within safe limits.'
    } The children earned ${totalBonus > 0 ? totalBonus + ' bonus minutes' : 'extra time'} through positive habits like reading and plant care with Nani.`,
    concerns: [
      'Late evening smartphone use within 45 minutes of the 9:30 PM bedtime lock.',
      'Requests for entertainment apps right before the 5:00 PM tuition block starts.'
    ],
    suggested_limit_min: hasExamMode ? 60 : 80,
    earn_tasks: [
      {
        title: 'Balcony Flower Watering & Care with Nani',
        bonus_min: 10,
        why: 'Relieves eye strain and provides a calming sensory break after 2 hours of tuition.'
      },
      {
        title: 'Read 2 Chapters of an English or Telugu Storybook',
        bonus_min: 10,
        why: 'Builds sustained vocabulary and reading habits peacefully.'
      },
      {
        title: 'Learn Traditional Andhra Pepper Rasam Seasoning',
        bonus_min: 15,
        why: 'Teaches practical life skills and deepens intergenerational bonding.'
      }
    ],
    conversation_starter: 'At dinner tonight, ask Anna how his bicycle puncture test with water bubbles worked, instead of asking about his screen time.',
    weekend_chore: {
      title: 'Shoe Rack Air-Traffic Controller',
      duration_min: 15,
      safety_note: 'Wash hands thoroughly with soap after organizing family footwear.'
    },
    generatedAt: new Date().toISOString(),
    source: 'local-engine'
  };
}
