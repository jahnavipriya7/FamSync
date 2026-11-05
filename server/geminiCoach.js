/**
 * Server-side Gemini Coach handler supporting 3 modes: match, quiz, chore.
 * Strictly uses process.env.GEMINI_API_KEY or request header.
 */

export const GEMINI_SYSTEM_PROMPT = `You are FamSync Coach, a friendly assistant for urban Indian families in Visakhapatnam. Reply in simple English only. Use the family data below. Return ONLY valid JSON in the exact format requested, no extra text. Keep suggestions safe, age-appropriate and culturally relevant.`;

export async function callGeminiCoach(mode, payload, apiKey) {
  if (!apiKey) {
    throw new Error('No GEMINI_API_KEY provided');
  }

  let userPrompt = '';
  if (mode === 'match') {
    userPrompt = `
MODE: MATCH TEACHER FOR LEARNER
FAMILY MEMBERS:
${JSON.stringify(payload.members, null, 2)}

LEARNER'S GOAL: "${payload.goal}"
FREE TIME: "${payload.timeSlot || 'Weekend'}"

TASK:
Identify who in this family is the best teacher for this goal and why. Give a backup teacher. Outline a quick 15-minute 3-step practical session.

OUTPUT FORMAT (JSON ONLY):
{
  "best_teacher": "Name of best teacher",
  "reason": "1-2 sentences on why they are ideal",
  "backup_teacher": "Name of alternative member",
  "suggested_session": {
    "title": "Fun 15-min session title",
    "duration_min": 15,
    "steps": [
      "Step 1 practical instruction",
      "Step 2 practical instruction",
      "Step 3 practical instruction"
    ]
  }
}
`;
  } else if (mode === 'quiz') {
    userPrompt = `
MODE: WEEKEND DUEL 5-QUESTION QUIZ
PLAYERS (Names and ages):
${JSON.stringify(payload.players, null, 2)}

SKILLS TAUGHT THIS WEEK IN THIS FAMILY:
${JSON.stringify(payload.skillsTaught || ['Making Andhra rasam', 'Bicycle tire puncture repair', 'Folding clothes neatly', 'Rythu bazaar vegetable selection'], null, 2)}

TASK:
Generate 5 engaging multiple-choice trivia/skill questions based on the skills taught this week and everyday life skills. Ensure questions are balanced across age levels (kid, teen, adult) so everyone has a chance.

OUTPUT FORMAT (JSON ONLY):
{
  "questions": [
    {
      "q": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer_index": 0,
      "for_age_group": "kid"
    }
  ]
}
`;
  } else if (mode === 'chore') {
    userPrompt = `
MODE: CHORE ASSIGNMENT FOR DUEL LOSER
LOSER: Name: "${payload.loserName}", Age: ${payload.loserAge}
RECENT CHORES DONE: ${JSON.stringify(payload.recentChores || [], null, 2)}

TASK:
Assign a household chore as a friendly, lighthearted consequence for coming in last place in the weekend duel.
RULES:
1. It MUST be 100% safe for age ${payload.loserAge} (no sharp kitchen knives, no chemical cleaning agents, no high ladders).
2. Takes 10-20 minutes.
3. Give it a creative, fun mystery or detective-style title.
4. Include a fun twist to make it enjoyable instead of punishing.

OUTPUT FORMAT (JSON ONLY):
{
  "title": "Creative fun title (e.g. Sock Detective: The Great Pair Mystery)",
  "description": "Clear step-by-step chore instruction",
  "duration_min": 15,
  "safety_note": "Clear age-safe precaution",
  "fun_twist": "A playful challenge (e.g. beat the 3-minute timer while listening to songs)"
}
`;
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: GEMINI_SYSTEM_PROMPT },
          { text: userPrompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API');

  const clean = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(clean);

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    source: 'gemini-live'
  };
}
