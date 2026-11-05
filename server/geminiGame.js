/**
 * Server-side Gemini Game Generator for daily family challenges.
 * Generates games like Ludo, Chess, Snakes and Ladders, Carrom, Ashta Chamma with fun twists and safe chores.
 */

export const GEMINI_GAME_SYSTEM_PROMPT = `You are FamSync Coach in Visakhapatnam. Generate engaging, safe, screen-free offline family game challenges (like Ludo, Chess, Snakes & Ladders, Carrom, Ashta Chamma, Antakshari) for urban Indian families. Return ONLY valid JSON in the exact format requested.`;

export async function callGeminiGame(payload, apiKey) {
  if (!apiKey) {
    throw new Error('No GEMINI_API_KEY provided');
  }

  const userPrompt = `
Generate a creative family game challenge for today.
Context:
- Child playing: ${payload.childName || 'Chinni'} (Age ${payload.childAge || 10})
- Family members available: Parents (Amma, Nanna), Grandmother (Nani), Teen brother (Anna)
- City: Visakhapatnam, Andhra Pradesh
- Games to rotate through: Ludo, Chess, Snakes and Ladders, Carrom, Ashta Chamma, Telugu Antakshari / Charades

TASK:
Pick 1 game. Give it a creative title, suggested players, 3 quick rules, a fun household twist, an estimated duration (15-20 min), and a safe, fun 15-minute household chore for the loser.

OUTPUT JSON FORMAT ONLY:
{
  "id": "game-live",
  "gameType": "Ludo",
  "title": "Title of game",
  "icon": "🎲",
  "suggestedPlayers": "Players participating",
  "durationMin": 15,
  "quickRules": [
    "Rule 1",
    "Rule 2",
    "Rule 3"
  ],
  "funTwist": "Playful twist",
  "loserChore": "Chore title with brief safe instruction",
  "dayLabel": "Today's AI Game"
}
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: GEMINI_GAME_SYSTEM_PROMPT },
          { text: userPrompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API');

  const clean = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  return JSON.parse(clean);
}
