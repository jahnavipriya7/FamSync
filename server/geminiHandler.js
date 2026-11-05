/**
 * Server-side Gemini API invocation handler.
 * Keeps the API key strictly on the server or handles gracefully with fallback.
 */

export const GEMINI_PROMPT = `
You are FamSync's expert Indian Household Intergenerational Learning & Chore Balancer AI.
Your purpose is to transform everyday household tasks into collaborative skill-learning opportunities between generations in an Indian family (specifically urban households such as Visakhapatnam, Andhra Pradesh).

INPUT:
A JSON array of family members, each with: name, age, relation, role, skillsCanTeach, skillsWantToLearn, currentChoreHoursWeekly, and availability.

TASK:
1. Analyze each member's skills, interests, and learning goals.
2. Identify complementary skills between family members across generations (e.g., Grandparent <-> Youth, Parent <-> Kid).
3. Recommend who can teach whom with personalized, culturally authentic practical learning opportunities.
4. Convert routine household chores (e.g., Rythu Bazaar vegetable bargaining, fuse/inverter check, traditional cooking, online bill payments) into guided 30-45 minute collaborative learning sessions.
5. Recommend mutually beneficial skill exchanges respecting each member's schedule.
6. Provide an insight on domestic work rebalancing to reduce disproportionate chore burdens on primary homemakers.

REPLY GUIDELINES:
- Reply in simple English.
- Return ONLY valid JSON matching the exact schema below. No markdown fences outside the JSON.

OUTPUT JSON SCHEMA:
{
  "summary": "Brief 2-line summary of family collaboration potential",
  "skillMatches": [
    {
      "id": "match-1",
      "mentorName": "string",
      "mentorRole": "string",
      "menteeName": "string",
      "menteeRole": "string",
      "skill": "string",
      "learningActivity": "string",
      "weeklyCadence": "string",
      "whyComplementary": "string",
      "category": "Home Maintenance"
    }
  ],
  "mutualExchanges": [
    {
      "id": "exch-1",
      "memberA": "string",
      "teachesA": "string",
      "memberB": "string",
      "teachesB": "string",
      "benefit": "string"
    }
  ],
  "guidedChoreLearnings": [
    {
      "id": "chore-1",
      "choreName": "string",
      "mentor": "string",
      "learner": "string",
      "skillUnlocked": "string",
      "estimatedMinutes": 30,
      "stepByStepGuide": ["Step 1...", "Step 2...", "Step 3..."]
    }
  ],
  "domesticBalanceInsight": {
    "currentDisparitySummary": "string",
    "rebalancedImpactSummary": "string",
    "minutesSavedForPrimaryCaregiver": 90
  }
}
`;

export async function callGeminiApi(members, apiKey) {
  if (!apiKey) {
    throw new Error('No GEMINI_API_KEY provided');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: GEMINI_PROMPT },
          { text: `FAMILY MEMBERS DATA:\n${JSON.stringify(members, null, 2)}` }
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
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Empty response from Gemini API');
  }

  const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleanJson);

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    source: 'gemini-live'
  };
}
