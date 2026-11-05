import { ChildProfile, AIParentInsight, FamilyGameChallenge } from '../types';
import { generateLocalParentInsight } from '../utils/localInsight';
import { generateRandomGameChallenge } from '../utils/localGame';

export async function fetchParentInsight(
  children: ChildProfile[],
  customApiKey?: string
): Promise<AIParentInsight> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (customApiKey) headers['x-gemini-api-key'] = customApiKey.trim();

    const response = await fetch('/api/insight', {
      method: 'POST',
      headers,
      body: JSON.stringify({ children })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Network call failed, using local parent insight:', e);
  }

  return generateLocalParentInsight(children);
}

export async function fetchDailyFamilyGame(
  childName?: string,
  customApiKey?: string
): Promise<FamilyGameChallenge> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (customApiKey) headers['x-gemini-api-key'] = customApiKey.trim();

    const response = await fetch('/api/game', {
      method: 'POST',
      headers,
      body: JSON.stringify({ childName: childName || 'Chinni' })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Network call failed, using local random game:', e);
  }

  return generateRandomGameChallenge(childName);
}

export async function checkBackendStatus(): Promise<{ hasKey: boolean; service: string }> {
  try {
    const res = await fetch('/api/status');
    if (res.ok) return await res.json();
  } catch (e) {
    // ignore
  }
  return { hasKey: false, service: 'FamSync Coach Local Engine' };
}
