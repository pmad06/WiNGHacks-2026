/**
 * gemini.ts — Gemini API calls for Care Bear
 *
 * Contains plain async functions (not hooks) so they can be imported
 * and wrapped with useCallback inside the main component.
 *
 * When a backend is ready, swap the fetch calls here to hit your own
 * API routes (e.g. POST /api/chat) instead of Gemini directly.
 */

import type { Message, UserProfile } from './types';
import { GEMINI_URL, GEMINI_KEY, SYSTEM_PROMPT } from './constants';
import { pickSuggestions } from './utils';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface GeminiCandidate {
  content: { parts: Array<{ text: string }> };
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?:      { message?: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHAT — send a user message with conversation history
// ─────────────────────────────────────────────────────────────────────────────
export async function callGemini(
  userText: string,
  history:  Message[],
  user:     UserProfile | null,
): Promise<string> {
  const profileCtx = user
    ? `\n\nUser profile — Name: ${user.name ?? 'Unknown'}, ` +
      `Dietary restrictions: ${(user.dietaryRestrictions ?? []).join(', ') || 'None'}, ` +
      `Health goals: ${(user.healthGoals ?? []).join(', ') || 'None'}, ` +
      `Allergies: ${(user.allergies ?? []).join(', ') || 'None'}`
    : '';

  const contents = [
    { role: 'user',  parts: [{ text: SYSTEM_PROMPT + profileCtx }] },
    { role: 'model', parts: [{ text: "Understood! I'm Care Bear, ready to help with all things health and wellness. 🌿" }] },
    // Include up to the last 16 messages for context
    ...history.slice(-16).map(m => ({
      role:  m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userText }] },
  ];

  const res = await fetch(GEMINI_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.75, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({})) as GeminiResponse;
    throw new Error(errData.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json() as GeminiResponse;
  return (
    data.candidates?.[0]?.content.parts[0]?.text ??
    "I couldn't generate a response right now. Please try again!"
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTION REFRESH — generate contextual follow-up bubbles
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshSuggestionsApi(
  context:        string,
  setSuggestions: (s: string[]) => void,
): Promise<void> {
  if (!GEMINI_KEY) {
    setSuggestions(pickSuggestions());
    return;
  }
  try {
    const prompt =
      `Based on this health conversation context: "${context.slice(0, 200)}", ` +
      `suggest 3 short follow-up health questions (under 8 words each). ` +
      `Return ONLY the 3 questions separated by the | character, with no numbering or extra text.`;

    const res = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 80 },
      }),
    });

    if (res.ok) {
      const d = await res.json() as GeminiResponse;
      const text = d.candidates?.[0]?.content.parts[0]?.text ?? '';
      const sugs = text.split('|').map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
      if (sugs.length === 3) { setSuggestions(sugs); return; }
    }
  } catch { /* fall through to random */ }

  setSuggestions(pickSuggestions());
}
