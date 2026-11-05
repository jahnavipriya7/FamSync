/**
 * Server-side Gemini Parent Insight handler.
 * Keeps GEMINI_API_KEY secure in process.env.
 */

export const GEMINI_INSIGHT_SYSTEM_PROMPT = `You are FamSync Coach, a calm parenting assistant for middle class urban Indian families in Visakhapatnam. Both parents work and children have tuition and exam pressure. Reply in simple English. Protect study time. Return ONLY valid JSON in the exact format below, no extra text.`;

export async function callGeminiInsight(payload, apiKey) {
  if (!apiKey) {
    throw new Error('No GEMINI_API_KEY provided');
  }

  const userPrompt = `
INPUT:
Children details & weekly screen time usage:
${JSON.stringify(payload.children, null, 2)}

Context:
City: Visakhapatnam, Andhra Pradesh.
Household: Both parents working, grandmother (Nani) at home, children have tuition 5:00 PM - 7:00 PM daily.

TASK:
Analyze the 7 days of screen time, study vs entertainment balance, exam mode status, and positive habits.
Provide calm, non-judgmental guidance for middle-class parents. Suggest non-monetary ways for children to earn extra screen time (reading, helping with household tasks, learning heritage skills from grandparents).

OUTPUT JSON FORMAT (STRICT):
{
  "summary": "2-3 sentences on family screen time balance and how tuition hours were respected",
  "concerns": [
    "Specific concern 1",
    "Specific concern 2"
  ],
  "suggested_limit_min": 75,
  "earn_tasks": [
    {
      "title": "Task title",
      "bonus_min": 10,
      "why": "Why this task helps child de-stress from studies"
    }
  ],
  "conversation_starter": "A calm, non-nagging question parents can ask at dinner tonight",
  "weekend_chore": {
    "title": "Creative fun chore title",
    "duration_min": 15,
    "safety_note": "Clear age-safe precaution"
  }
}
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: GEMINI_INSIGHT_SYSTEM_PROMPT },
          { text: userPrompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
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
  const parsed = JSON.parse(clean);

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    source: 'gemini-live'
  };
}
