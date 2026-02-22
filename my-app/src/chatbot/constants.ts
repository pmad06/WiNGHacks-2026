// ─────────────────────────────────────────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export const GEMINI_KEY: string = import.meta.env.VITE_GEMINI_API_KEY ?? '';
export const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

// ─────────────────────────────────────────────────────────────────────────────
// APP CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
export const MAX_CHARS = 1000;
export const STORE_KEY = 'wren_conversations';  // localStorage key for chat history
export const POPUP_KEY = 'wren_popup';           // localStorage key for popup state

// ─────────────────────────────────────────────────────────────────────────────
// EMERGENCY DETECTION
// ─────────────────────────────────────────────────────────────────────────────
export const EMERGENCY_WORDS = [
  'suicide', 'kill myself', 'want to die', 'end my life', 'self harm',
  'self-harm', 'cutting myself', 'hurt myself', 'overdose', 'take my life',
  'not worth living', 'no reason to live', 'end it all',
] as const;

export const EMERGENCY_MSG = `⚠️ **Help is available. Please reach out immediately.**

If you are in immediate danger, call **911**.

---

**988 Suicide and Crisis Lifeline**
📞 Call or text **988**
🌐 988lifeline.org
🗣️ Languages: English, Spanish
🕐 Hours: 24/7

---

**Self-Harm Support**
📞 1-800-DONT-CUT (1-800-366-8288)

---

*Please talk to someone you trust. You are not alone.*`;

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
export const SYSTEM_PROMPT = `You are "Care Bear," a warm, knowledgeable, and compassionate health and wellness assistant. You speak in a friendly, supportive tone and use emojis occasionally.

STRICT RULES:
1. NEVER diagnose medical conditions. Only provide information about symptoms and supportive options.
2. For symptoms: suggest natural remedies (with usage details) OR OTC medications (name, exact dosage, how often, hours between doses, safety warnings). Always advise consulting a doctor for serious or persistent symptoms.
3. For recipe requests to help a health problem: explain the health benefit first (1-2 sentences), then provide the recipe using the EXACT format below.
4. If asked about non-health topics (tech, entertainment, politics, coding, etc.), respond: "I specialize in health and wellness! I'd love to help with any health-related questions instead. 🌿"
5. Be warm, encouraging, and evidence-informed.

RECIPE FORMAT — use EXACTLY when providing a recipe:
[RECIPE_START]
TITLE: Recipe Name
SYMPTOM_HELP: Brief health benefit explanation
PREP_TIME: X minutes
COOK_TIME: X minutes
TOTAL_TIME: X minutes
SERVINGS: X
INGREDIENTS_CUSTOMARY:
• ingredient 1
• ingredient 2
INGREDIENTS_METRIC:
• ingredient 1 in metric
• ingredient 2 in metric
INSTRUCTIONS:
1. Detailed step one
2. Detailed step two
[RECIPE_END]`;

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTION BUBBLES
// ─────────────────────────────────────────────────────────────────────────────
export const INIT_SUGGESTIONS = [
  'What helps with headaches naturally?',
  'What foods boost immune health?',
  'Can you make a recipe for better sleep?',
];

export const SUGGESTION_BANK = [
  'Natural remedies for stress and anxiety',
  'What helps with digestive issues?',
  'Recipe for an anti-inflammatory smoothie',
  'Best OTC options for cold symptoms',
  'How can I sleep better naturally?',
  'What foods reduce inflammation?',
  'Create a gut health recipe for me',
  'What vitamins should I take daily?',
  'Natural remedies for muscle soreness',
  'Recipe to boost energy levels',
  'What helps with seasonal allergies?',
  'Make me a calming bedtime tea recipe',
  'Signs of vitamin D deficiency',
  'Natural ways to boost immunity',
  'Recipe for glowing skin health',
  'What helps with back pain naturally?',
  'Best foods for heart health',
  'Cold and flu recovery recipe',
  'How to reduce bloating naturally?',
  'Foods that support mental clarity',
];
