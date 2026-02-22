import type { Message, RecipeData } from './types';
import { EMERGENCY_WORDS, SUGGESTION_BANK } from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a short random ID */
export const uid = (): string => Math.random().toString(36).slice(2, 11);

/** Check if user message contains an emergency keyword */
export const hasEmergency = (text: string): boolean => {
  const lower = text.toLowerCase();
  return EMERGENCY_WORDS.some(w => lower.includes(w));
};

/** Pick 3 random suggestions from the bank */
export const pickSuggestions = (): string[] =>
  [...SUGGESTION_BANK].sort(() => Math.random() - 0.5).slice(0, 3);

// ─────────────────────────────────────────────────────────────────────────────
// RECIPE PARSER
// Extracts structured RecipeData from a Gemini response that contains
// [RECIPE_START] ... [RECIPE_END] markers.
// ─────────────────────────────────────────────────────────────────────────────
export const parseRecipe = (raw: string): { text: string; recipe: RecipeData | null } => {
  const START = '[RECIPE_START]';
  const END   = '[RECIPE_END]';
  const si = raw.indexOf(START);
  const ei = raw.indexOf(END);
  if (si === -1 || ei === -1) return { text: raw, recipe: null };

  const before = raw.slice(0, si).trim();
  const after  = raw.slice(ei + END.length).trim();
  const block  = raw.slice(si + START.length, ei).trim();

  /** Extract a single-line field value (case-insensitive) */
  const field = (label: string): string => {
    const m = block.match(new RegExp(`${label}:\\s*(.+)`, 'i'));
    return m ? m[1].trim() : '';
  };

  /**
   * Extract a bullet/numbered list section.
   * Uses case-insensitive search and avoids false stops at blank lines.
   */
  const listSection = (startLabel: string, stopPat: string): string[] => {
    const blockLower = block.toLowerCase();
    const idx = blockLower.indexOf(startLabel.toLowerCase());
    if (idx === -1) return [];
    const rest = block.slice(idx + startLabel.length);
    const stopIdx = rest.search(new RegExp(stopPat, 'i'));
    const part = stopIdx !== -1 ? rest.slice(0, stopIdx) : rest;
    return part
      .split('\n')
      .map(l => l.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  };

  const recipe: RecipeData = {
    title:                field('TITLE'),
    symptomHelp:          field('SYMPTOM_HELP'),
    prepTime:             field('PREP_TIME'),
    cookTime:             field('COOK_TIME'),
    totalTime:            field('TOTAL_TIME'),
    servings:             field('SERVINGS'),
    ingredientsCustomary: listSection('INGREDIENTS_CUSTOMARY:', 'INGREDIENTS_METRIC:|INSTRUCTIONS:'),
    ingredientsMetric:    listSection('INGREDIENTS_METRIC:', 'INSTRUCTIONS:'),
    instructions:         listSection('INSTRUCTIONS:', '\\[RECIPE_END\\]'),
  };

  return {
    text:   [before, after].filter(Boolean).join('\n\n'),
    recipe: recipe.title ? recipe : null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME MESSAGE FACTORY
// ─────────────────────────────────────────────────────────────────────────────
export const makeWelcome = (name?: string): Message => ({
  id:        uid(),
  role:      'assistant',
  timestamp: new Date().toISOString(),
  content:   name
    ? `Hey ${name}! 🌿 I'm Care Bear, your personal health assistant. I can help with natural remedies, healthy recipes, wellness tips, and more. What can I help you with today?`
    : `Hi there! 🌿 I'm Care Bear, your personal health assistant. I can help with natural remedies, healthy recipes, wellness tips, and more. What can I help you with today?`,
});
