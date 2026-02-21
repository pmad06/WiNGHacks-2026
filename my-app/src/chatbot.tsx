/**
 * Wellness Wren – Health Chatbot Component
 *
 * Requires: VITE_GEMINI_API_KEY in your .env file
 *   VITE_GEMINI_API_KEY=your_google_gemini_api_key
 *
 * Mount at the App level so it appears on every page:
 *   import Chatbot from './chatbot'
 *   <Chatbot user={currentUser} />
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// SPEECH RECOGNITION TYPES (not universally in all TS DOM configs)
// ─────────────────────────────────────────────────────────────────────────────
interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
}
interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionResultListLike {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionEventLike extends Event {
  readonly results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionLike {
  continuous:     boolean;
  interimResults: boolean;
  lang:           string;
  start():        void;
  stop():         void;
  onresult:       ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror:        (() => void) | null;
  onend:          (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?:       SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
  recipe?: RecipeData;
  isEmergency?: boolean;
}

interface RecipeData {
  title: string;
  symptomHelp: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  ingredientsCustomary: string[];
  ingredientsMetric: string[];
  instructions: string[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  dietaryRestrictions?: string[];
  healthGoals?: string[];
  allergies?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_KEY: string = import.meta.env.VITE_GEMINI_API_KEY ?? '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
const MAX_CHARS = 1000;
const STORE_KEY = 'wren_conversations';
const POPUP_KEY = 'wren_popup';

const EMERGENCY_WORDS = [
  'suicide', 'kill myself', 'want to die', 'end my life', 'self harm',
  'self-harm', 'cutting myself', 'hurt myself', 'overdose', 'take my life',
  'not worth living', 'no reason to live', 'end it all',
] as const;

const EMERGENCY_MSG = `⚠️ **Help is available. Please reach out immediately.**

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

const SYSTEM_PROMPT = `You are "Wellness Wren," a warm, knowledgeable, and compassionate health and wellness assistant. You speak in a friendly, supportive tone and use emojis occasionally.

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

const INIT_SUGGESTIONS = [
  'What helps with headaches naturally?',
  'What foods boost immune health?',
  'Can you make a recipe for better sleep?',
];

const SUGGESTION_BANK = [
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

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  primary:      '#8B5CF6',
  primaryDark:  '#7C3AED',
  primaryLight: '#A78BFA',
  primarySoft:  '#EDE9FE',
  accent:       '#F472B6',
  text:         '#1F2937',
  textMuted:    '#6B7280',
  textLight:    '#9CA3AF',
  bg:           '#FFFFFF',
  bgSecondary:  '#F9FAFB',
  border:       '#E5E7EB',
  shadow:       'rgba(139, 92, 246, 0.25)',
  errorBg:      '#FEF2F2',
  errorBorder:  '#FECACA',
  errorText:    '#EF4444',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
const uid = (): string => Math.random().toString(36).slice(2, 11);

const hasEmergency = (text: string): boolean => {
  const lower = text.toLowerCase();
  return EMERGENCY_WORDS.some(w => lower.includes(w));
};

const pickSuggestions = (): string[] =>
  [...SUGGESTION_BANK].sort(() => Math.random() - 0.5).slice(0, 3);

const parseRecipe = (raw: string): { text: string; recipe: RecipeData | null } => {
  const START = '[RECIPE_START]';
  const END   = '[RECIPE_END]';
  const si = raw.indexOf(START);
  const ei = raw.indexOf(END);
  if (si === -1 || ei === -1) return { text: raw, recipe: null };

  const before = raw.slice(0, si).trim();
  const after  = raw.slice(ei + END.length).trim();
  const block  = raw.slice(si + START.length, ei).trim();

  const field = (label: string): string => {
    const m = block.match(new RegExp(`${label}:\\s*(.+)`, 'i'));
    return m ? m[1].trim() : '';
  };

  const listSection = (startLabel: string, stopPat: string): string[] => {
    const idx = block.indexOf(startLabel);
    if (idx === -1) return [];
    const rest = block.slice(idx + startLabel.length);
    const stopIdx = rest.search(new RegExp(stopPat, 'im'));
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
    instructions:         listSection('INSTRUCTIONS:', '\\[RECIPE_END\\]|^\\s*$'),
  };

  return {
    text:   [before, after].filter(Boolean).join('\n\n'),
    recipe: recipe.title ? recipe : null,
  };
};

const renderMarkdown = (content: string): ReactNode =>
  content.split('\n').map((line, i, arr) => {
    if (line === '---') {
      return (
        <hr
          key={i}
          style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '6px 0' }}
        />
      );
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((p, j) =>
          j % 2 === 1 ? <strong key={j}>{p}</strong> : p,
        )}
        {i < arr.length - 1 ? <br /> : null}
      </span>
    );
  });

// ─────────────────────────────────────────────────────────────────────────────
// WELLNESS WREN ICON SVG
// ─────────────────────────────────────────────────────────────────────────────
function WrenIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Wellness Wren"
    >
      <defs>
        <linearGradient id="wrenGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#wrenGrad)" />
      {/* Wings */}
      <ellipse cx="11" cy="25" rx="5" ry="7" fill="#C4B5FD" transform="rotate(-20 11 25)" />
      <ellipse cx="29" cy="25" rx="5" ry="7" fill="#C4B5FD" transform="rotate(20 29 25)" />
      {/* Body */}
      <ellipse cx="20" cy="26" rx="9" ry="8" fill="#FDE8D8" />
      {/* Head */}
      <circle cx="20" cy="15" r="8" fill="#FDE8D8" />
      {/* Eyes */}
      <circle cx="17" cy="14" r="1.8" fill="#3B1A6B" />
      <circle cx="23" cy="14" r="1.8" fill="#3B1A6B" />
      <circle cx="17.6" cy="13.3" r="0.6" fill="white" />
      <circle cx="23.6" cy="13.3" r="0.6" fill="white" />
      {/* Beak */}
      <path d="M20 17 L18 19.5 L22 19.5 Z" fill="#F97316" />
      {/* Blush */}
      <circle cx="13.5" cy="16.5" r="2" fill="#FCA5A5" opacity="0.55" />
      <circle cx="26.5" cy="16.5" r="2" fill="#FCA5A5" opacity="0.55" />
      {/* Leaf crown */}
      <path d="M20 8 Q16 3 12 7 Q15.5 10 20 8Z" fill="#4ADE80" />
      <path d="M20 8 Q24 3 28 7 Q24.5 10 20 8Z" fill="#22C55E" />
      <line x1="20" y1="8" x2="20" y2="6" stroke="#15803D" strokeWidth="1.2" />
      {/* Heart belly */}
      <path
        d="M19.3 26.5 C19.3 25.5 18 25 17.5 26 C17 27 18.3 28.5 19.8 29.5 C21.3 28.5 22.6 27 22.1 26 C21.6 25 20.3 25.5 19.3 26.5Z"
        fill="#F472B6"
        opacity="0.65"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING DOTS
// ─────────────────────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '12px 16px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: C.primaryLight,
            animation: `wrenBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECIPE CARD
// ─────────────────────────────────────────────────────────────────────────────
interface RecipeCardProps {
  recipe: RecipeData;
  isLoggedIn: boolean;
  onSave: (r: RecipeData) => void;
}

function RecipeCard({ recipe, isLoggedIn, onSave }: RecipeCardProps) {
  const [metric, setMetric] = useState(false);
  const ingredients = metric ? recipe.ingredientsMetric : recipe.ingredientsCustomary;

  return (
    <div style={{
      border: `1.5px solid ${C.primaryLight}`, borderRadius: 12,
      overflow: 'hidden', marginTop: 8, fontSize: 13, background: '#FFFCFF',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
        padding: '10px 14px', color: 'white',
      }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>🌿 {recipe.title}</div>
        {recipe.symptomHelp && (
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{recipe.symptomHelp}</div>
        )}
      </div>

      {/* Timing */}
      {(recipe.prepTime || recipe.cookTime || recipe.totalTime || recipe.servings) && (
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap',
          padding: '7px 14px', background: C.primarySoft, borderBottom: `1px solid ${C.border}`,
        }}>
          {recipe.prepTime  && <span style={{ fontSize: 11, color: C.primaryDark }}>⏱️ Prep: <b>{recipe.prepTime}</b></span>}
          {recipe.cookTime  && <span style={{ fontSize: 11, color: C.primaryDark }}>🔥 Cook: <b>{recipe.cookTime}</b></span>}
          {recipe.totalTime && <span style={{ fontSize: 11, color: C.primaryDark }}>⏰ Total: <b>{recipe.totalTime}</b></span>}
          {recipe.servings  && <span style={{ fontSize: 11, color: C.primaryDark }}>🍽️ Serves: <b>{recipe.servings}</b></span>}
        </div>
      )}

      {/* Ingredients */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 12, color: C.primaryDark }}>🥗 Ingredients</span>
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.primaryLight}` }}>
            {(['US', 'Metric'] as const).map((unit, i) => (
              <button
                key={unit}
                onClick={() => setMetric(i === 1)}
                style={{
                  padding: '2px 9px', fontSize: 10, border: 'none', cursor: 'pointer', fontWeight: 500,
                  background: metric === (i === 1) ? C.primary : 'white',
                  color:      metric === (i === 1) ? 'white'   : C.primaryDark,
                  transition: 'all 0.18s',
                }}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: C.text }}>
          {ingredients.map((ing, i) => <li key={i} style={{ marginBottom: 3 }}>{ing}</li>)}
        </ul>
      </div>

      {/* Instructions */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: C.primaryDark, marginBottom: 6 }}>📋 Instructions</div>
        <ol style={{ margin: 0, paddingLeft: 18, color: C.text }}>
          {recipe.instructions.map((step, i) => (
            <li key={i} style={{ marginBottom: 5, lineHeight: 1.55 }}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Save to Forum (logged-in only) */}
      {isLoggedIn && (
        <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.border}`, background: C.bgSecondary }}>
          <button
            onClick={() => onSave(recipe)}
            style={{
              width: '100%', padding: '7px 0',
              background: `linear-gradient(135deg, ${C.accent}, #EC4899)`,
              color: 'white', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontWeight: 600, fontSize: 12, transition: 'opacity 0.18s',
            }}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseOut={e  => { e.currentTarget.style.opacity = '1'; }}
          >
            🌸 Save to Recipe Forum
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────────────────────
interface MsgBubbleProps {
  message: Message;
  isLoggedIn: boolean;
  onSave: (r: RecipeData) => void;
}

function MsgBubble({ message, isLoggedIn, onSave }: MsgBubbleProps) {
  const [showTs, setShowTs] = useState(false);
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 6, marginBottom: 8, alignItems: 'flex-end',
      }}
      onMouseEnter={() => setShowTs(true)}
      onMouseLeave={() => setShowTs(false)}
    >
      {!isUser && <div style={{ flexShrink: 0 }}><WrenIcon size={24} /></div>}

      <div style={{
        maxWidth: '82%', display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        <div style={{
          padding: '9px 14px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: message.isEmergency
            ? C.errorBg
            : isUser
              ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`
              : C.bgSecondary,
          color: isUser ? 'white' : C.text,
          border: message.isEmergency
            ? `1.5px solid ${C.errorBorder}`
            : isUser ? 'none' : `1px solid ${C.border}`,
          fontSize: 13.5, lineHeight: 1.6, wordBreak: 'break-word',
        }}>
          {renderMarkdown(message.content)}
        </div>

        {message.recipe && (
          <RecipeCard recipe={message.recipe} isLoggedIn={isLoggedIn} onSave={onSave} />
        )}

        {showTs && (
          <div style={{ fontSize: 10, color: C.textLight, marginTop: 2, padding: '0 4px' }}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE TO FORUM MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface SaveModalProps {
  recipe: RecipeData;
  title: string;
  tags: string;
  onTitleChange: (v: string) => void;
  onTagsChange:  (v: string) => void;
  onSubmit: () => void;
  onClose:  () => void;
}

function SaveForumModal({ recipe, title, tags, onTitleChange, onTagsChange, onSubmit, onClose }: SaveModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16, padding: 24, width: 320,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'wrenFade 0.2s ease-out',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h3 style={{ margin: '0 0 4px', color: C.primaryDark, fontSize: 16 }}>🌸 Save to Recipe Forum</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: C.textMuted }}>
          Sharing: <em>{recipe.title}</em>
        </p>

        <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
          Recipe Title
        </label>
        <input
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text,
            fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12, outline: 'none',
          }}
        />

        <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
          Tags <span style={{ color: C.textLight }}>(comma separated)</span>
        </label>
        <input
          value={tags}
          onChange={e => onTagsChange(e.target.value)}
          placeholder="e.g. sleep, anti-inflammatory, immunity"
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text,
            fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 20, outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onSubmit}
            style={{
              flex: 1, padding: '9px 0',
              background: `linear-gradient(135deg, ${C.accent}, #EC4899)`,
              color: 'white', border: 'none', borderRadius: 10,
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}
          >
            Save Recipe
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '9px 0', background: C.bgSecondary,
              color: C.textMuted, border: `1px solid ${C.border}`,
              borderRadius: 10, cursor: 'pointer', fontSize: 13,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY PANEL
// ─────────────────────────────────────────────────────────────────────────────
interface HistoryPanelProps {
  conversations: Conversation[];
  onLoad: (c: Conversation) => void;
}

function HistoryPanel({ conversations, onLoad }: HistoryPanelProps) {
  return (
    <div
      className="wren-scroll"
      style={{
        background: C.bgSecondary, borderBottom: `1px solid ${C.border}`,
        maxHeight: 155, overflowY: 'auto', flexShrink: 0,
      }}
    >
      {conversations.length === 0 ? (
        <div style={{ padding: '12px 16px', fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
          No past conversations yet
        </div>
      ) : (
        <>
          <div style={{
            padding: '6px 12px 2px', fontSize: 10, fontWeight: 600,
            color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6,
          }}>
            Past Chats
          </div>
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => onLoad(c)}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `1px solid ${C.border}`, display: 'block',
              }}
              onMouseOver={e => { e.currentTarget.style.background = C.primarySoft; }}
              onMouseOut={e  => { e.currentTarget.style.background = 'none'; }}
            >
              <div style={{
                fontSize: 12, color: C.text, fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {c.title}
              </div>
              <div style={{ fontSize: 10, color: C.textLight }}>
                {new Date(c.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED BUTTON STYLES
// ─────────────────────────────────────────────────────────────────────────────
const miniBtnSt: CSSProperties = {
  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
  color: 'white', cursor: 'pointer', padding: '2px 7px', fontSize: 12,
};

const hdrBtnSt: CSSProperties = {
  background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 8,
  color: 'white', cursor: 'pointer', padding: '4px 8px', fontSize: 12, lineHeight: '1',
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes wrenBounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }
  @keyframes wrenPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.22); }
  }
  @keyframes wrenFade {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .wren-scroll::-webkit-scrollbar { width: 4px; }
  .wren-scroll::-webkit-scrollbar-track { background: transparent; }
  .wren-scroll::-webkit-scrollbar-thumb { background: #C4B5FD; border-radius: 4px; }
  .wren-sugs::-webkit-scrollbar { display: none; }
  .wren-sugs { scrollbar-width: none; -ms-overflow-style: none; }
  .wren-sug:hover { background: #8B5CF6 !important; color: white !important; }
  .wren-input-box:focus-within { border-color: #A78BFA !important; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME MESSAGE FACTORY
// ─────────────────────────────────────────────────────────────────────────────
const makeWelcome = (name?: string): Message => ({
  id: uid(),
  role: 'assistant',
  timestamp: new Date().toISOString(),
  content: name
    ? `Hey ${name}! 🌿 I'm Wellness Wren, your personal health assistant. I can help with natural remedies, healthy recipes, wellness tips, and more. What can I help you with today?`
    : `Hi there! 🌿 I'm Wellness Wren, your personal health assistant. I can help with natural remedies, healthy recipes, wellness tips, and more. What can I help you with today?`,
});

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI API CALLER
// ─────────────────────────────────────────────────────────────────────────────
interface GeminiCandidate {
  content: { parts: Array<{ text: string }> };
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message?: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHATBOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface ChatbotProps {
  user?: UserProfile | null;
}

function Chatbot({ user = null }: ChatbotProps) {
  // ── Popup state (persisted) ───────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(POPUP_KEY);
      return s ? (JSON.parse(s) as { isOpen?: boolean }).isOpen === true : false;
    } catch { return false; }
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(POPUP_KEY);
      return s ? (JSON.parse(s) as { isMinimized?: boolean }).isMinimized === true : false;
    } catch { return false; }
  });

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages, setMessages]         = useState<Message[]>(() => [makeWelcome(user?.name)]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId]       = useState<string>(() => uid());
  const [loading, setLoading]           = useState(false);
  const [apiError, setApiError]         = useState<string | null>(null);

  // ── Input state ───────────────────────────────────────────────────────────
  const [input, setInput]         = useState('');
  const [listening, setListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INIT_SUGGESTIONS);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
  const [saveModal, setSaveModal]     = useState<RecipeData | null>(null);
  const [forumTitle, setForumTitle]   = useState('');
  const [forumTags, setForumTags]     = useState('');

  // ── Refs ──────────────────────────────────────────────────────────────────
  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLTextAreaElement>(null);
  const recognRef    = useRef<SpeechRecognitionLike | null>(null);
  const msgsRef      = useRef<Message[]>(messages);
  msgsRef.current    = messages;

  const loggedIn = !!(user?.id);

  // ── Persist popup state ───────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(POPUP_KEY, JSON.stringify({ isOpen, isMinimized }));
  }, [isOpen, isMinimized]);

  // ── Load saved conversations ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setConversations(JSON.parse(raw) as Conversation[]);
    } catch { /* ignore parse errors */ }
  }, []);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Clean up speech recognition on unmount ────────────────────────────────
  useEffect(() => () => { recognRef.current?.stop(); }, []);

  // ── Archive current conversation to localStorage ──────────────────────────
  const archiveConv = useCallback((msgs: Message[], id: string) => {
    const userMsgs = msgs.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;
    const raw = userMsgs[0].content;
    const title = raw.length > 52 ? raw.slice(0, 52) + '…' : raw;
    const conv: Conversation = {
      id, title, messages: msgs,
      createdAt: msgs[0].timestamp,
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => {
      const next = [conv, ...prev.filter(c => c.id !== id)];
      // TODO: also POST to /api/conversations if user is logged in
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Archive on browser close ──────────────────────────────────────────────
  useEffect(() => {
    const handler = () => archiveConv(msgsRef.current, currentId);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [archiveConv, currentId]);

  // ── Close popup (saves conversation) ─────────────────────────────────────
  const handleClose = useCallback(() => {
    archiveConv(msgsRef.current, currentId);
    setIsOpen(false);
    setIsMinimized(false);
  }, [archiveConv, currentId]);

  // ── Start new chat ────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    archiveConv(msgsRef.current, currentId);
    const nid = uid();
    setCurrentId(nid);
    setSuggestions(INIT_SUGGESTIONS);
    setApiError(null);
    setShowHistory(false);
    setMessages([makeWelcome(user?.name ?? undefined)]);
  }, [archiveConv, currentId, user?.name]);

  // ── Load an archived conversation ─────────────────────────────────────────
  const loadConv = useCallback((conv: Conversation) => {
    archiveConv(msgsRef.current, currentId);
    setCurrentId(conv.id);
    setMessages(conv.messages);
    setShowHistory(false);
  }, [archiveConv, currentId]);

  // ── Call Gemini ───────────────────────────────────────────────────────────
  const callGemini = useCallback(async (userText: string, history: Message[]): Promise<string> => {
    const profileCtx = user
      ? `\n\nUser profile — Name: ${user.name ?? 'Unknown'}, Dietary restrictions: ${(user.dietaryRestrictions ?? []).join(', ') || 'None'}, Health goals: ${(user.healthGoals ?? []).join(', ') || 'None'}, Allergies: ${(user.allergies ?? []).join(', ') || 'None'}`
      : '';

    const contents = [
      { role: 'user',  parts: [{ text: SYSTEM_PROMPT + profileCtx }] },
      { role: 'model', parts: [{ text: "Understood! I'm Wellness Wren, ready to help with all things health and wellness. 🌿" }] },
      ...history.slice(-16).map(m => ({
        role:  m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: userText }] },
    ];

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
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
    return data.candidates?.[0]?.content.parts[0]?.text
      ?? "I couldn't generate a response right now. Please try again!";
  }, [user]);

  // ── Generate contextual suggestion bubbles ────────────────────────────────
  const refreshSuggestions = useCallback(async (context: string) => {
    if (!GEMINI_KEY) { setSuggestions(pickSuggestions()); return; }
    try {
      const prompt = `Based on this health conversation context: "${context.slice(0, 200)}", suggest 3 short follow-up health questions (under 8 words each). Return ONLY the 3 questions separated by the | character, with no numbering or extra text.`;
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
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
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setApiError(null);

    const userMsg: Message = {
      id: uid(), role: 'user', content: text,
      timestamp: new Date().toISOString(),
    };

    // Emergency override
    if (hasEmergency(text)) {
      const eMsg: Message = {
        id: uid(), role: 'assistant', content: EMERGENCY_MSG,
        timestamp: new Date().toISOString(), isEmergency: true,
      };
      setMessages(prev => [...prev, userMsg, eMsg]);
      setSuggestions(pickSuggestions());
      return;
    }

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const raw = await callGemini(text, msgsRef.current);
      const { text: msgText, recipe } = parseRecipe(raw);
      const botMsg: Message = {
        id: uid(), role: 'assistant',
        content: msgText || raw,
        timestamp: new Date().toISOString(),
        ...(recipe ? { recipe } : {}),
      };
      setMessages(prev => [...prev, botMsg]);
      void refreshSuggestions(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setApiError(`Connection error: ${msg}`);
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant', timestamp: new Date().toISOString(),
        content: "🌿 I'm having trouble connecting right now. Please check your connection and try again!",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, callGemini, refreshSuggestions]);

  // ── Key handler (Enter = send, Shift+Enter = newline) ─────────────────────
  const handleKey = useCallback((e: { key: string; shiftKey: boolean; preventDefault(): void }) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }, [handleSend]);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  const handleInputChange = useCallback((e: { target: HTMLTextAreaElement }) => {
    const v = e.target.value.slice(0, MAX_CHARS);
    setInput(v);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
  }, []);

  // ── Speech recognition toggle ─────────────────────────────────────────────
  const toggleListen = useCallback(() => {
    const SpeechAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechAPI) return;

    if (listening) {
      recognRef.current?.stop();
      setListening(false);
      return;
    }

    const r = new SpeechAPI();
    r.continuous      = false;
    r.interimResults  = true;
    r.lang            = 'en-US';
    r.onresult = (ev: SpeechRecognitionEventLike) => {
      const transcript = Array.from(ev.results)
        .map(res => res[0].transcript)
        .join('');
      setInput(transcript.slice(0, MAX_CHARS));
    };
    r.onerror = () => setListening(false);
    r.onend   = () => setListening(false);
    recognRef.current = r;
    r.start();
    setListening(true);
  }, [listening]);

  // ── Open Save-to-Forum modal ──────────────────────────────────────────────
  const openSaveModal = useCallback((recipe: RecipeData) => {
    setSaveModal(recipe);
    setForumTitle(recipe.title);
    setForumTags('');
  }, []);

  // ── Submit recipe to forum ────────────────────────────────────────────────
  const submitForum = useCallback(() => {
    if (!saveModal) return;
    // TODO: POST /api/recipes { title: forumTitle, tags: forumTags.split(','), recipe: saveModal, userId: user?.id }
    console.log('Saving to forum:', { forumTitle, forumTags, recipe: saveModal });
    setSaveModal(null);
  }, [saveModal, forumTitle, forumTags]);

  const speechOk = !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  // ── RENDER: closed → floating icon ───────────────────────────────────────
  if (!isOpen) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <button
          onClick={() => setIsOpen(true)}
          title="Open Wellness Wren"
          style={{
            position: 'fixed', bottom: 24, right: 24,
            width: 62, height: 62, borderRadius: '50%', border: 'none', padding: 0,
            background: `linear-gradient(135deg, ${C.primaryLight}, ${C.primaryDark})`,
            cursor: 'pointer', zIndex: 9999,
            boxShadow: `0 4px 20px ${C.shadow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform  = 'scale(1.1)';
            e.currentTarget.style.boxShadow  = `0 8px 30px ${C.shadow}`;
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform  = 'scale(1)';
            e.currentTarget.style.boxShadow  = `0 4px 20px ${C.shadow}`;
          }}
        >
          <WrenIcon size={44} />
        </button>
      </>
    );
  }

  // ── RENDER: minimized → compact bar ──────────────────────────────────────
  if (isMinimized) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 290,
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
            borderRadius: 14, display: 'flex', alignItems: 'center',
            padding: '8px 10px', gap: 8,
            boxShadow: `0 4px 20px ${C.shadow}`, zIndex: 9999, cursor: 'pointer',
          }}
          onClick={() => setIsMinimized(false)}
        >
          <WrenIcon size={28} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 13.5, flex: 1 }}>
            Wellness Wren
          </span>
          <button
            onClick={e => { e.stopPropagation(); setIsMinimized(false); }}
            style={miniBtnSt}
            title="Maximize"
          >
            ⬆
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleClose(); }}
            style={miniBtnSt}
            title="Close"
          >
            ✕
          </button>
        </div>
      </>
    );
  }

  // ── RENDER: full popup ────────────────────────────────────────────────────
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 360, height: 590, background: C.bg,
        borderRadius: 20, display: 'flex', flexDirection: 'column',
        boxShadow: `0 10px 40px rgba(0,0,0,0.14), 0 0 0 1px ${C.border}`,
        zIndex: 9999, overflow: 'hidden',
        animation: 'wrenFade 0.22s ease-out',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
        }}>
          <WrenIcon size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13.5, lineHeight: '1' }}>
              Wellness Wren
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
              {loggedIn ? `Hi, ${user?.name}! 🌿` : 'Health Assistant'}
            </div>
          </div>

          <button
            onClick={handleNewChat}
            title="New Chat"
            style={{ ...hdrBtnSt, fontSize: 11, fontWeight: 600 }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseOut={e  => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
          >
            ✨ New
          </button>

          <button
            onClick={() => setShowHistory(h => !h)}
            title="Chat History"
            style={{
              ...hdrBtnSt,
              background: showHistory ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)',
            }}
          >
            🕐
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            title="Minimize"
            style={{ ...hdrBtnSt, fontSize: 18 }}
          >
            −
          </button>

          <button onClick={handleClose} title="Close" style={hdrBtnSt}>✕</button>
        </div>

        {/* ── HISTORY PANEL ── */}
        {showHistory && <HistoryPanel conversations={conversations} onLoad={loadConv} />}

        {/* ── MESSAGES ── */}
        <div
          className="wren-scroll"
          style={{
            flex: 1, overflowY: 'auto', padding: '12px 10px 4px',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          {messages.map(m => (
            <MsgBubble key={m.id} message={m} isLoggedIn={loggedIn} onSave={openSaveModal} />
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <WrenIcon size={24} />
              <div style={{
                background: C.bgSecondary, borderRadius: '18px 18px 18px 4px',
                border: `1px solid ${C.border}`,
              }}>
                <LoadingDots />
              </div>
            </div>
          )}

          {apiError && (
            <div style={{
              background: C.errorBg, border: `1px solid ${C.errorBorder}`,
              borderRadius: 8, padding: '7px 12px', fontSize: 12, color: C.errorText,
            }}>
              {apiError}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── SUGGESTION BUBBLES ── */}
        <div style={{ padding: '5px 10px 3px', flexShrink: 0 }}>
          <div className="wren-sugs" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 3 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="wren-sug"
                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                style={{
                  flexShrink: 0, background: C.primarySoft,
                  border: `1px solid ${C.primaryLight}`,
                  borderRadius: 20, padding: '5px 12px',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                  fontSize: 11.5, color: C.primaryDark, fontWeight: 500,
                  transition: 'all 0.18s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── DISCLAIMER ── */}
        <div style={{
          textAlign: 'center', fontSize: 10, color: C.textLight,
          padding: '1px 12px 3px', flexShrink: 0,
        }}>
          ⚠️ AI-generated info — always consult a healthcare professional for medical advice
        </div>

        {/* ── INPUT AREA ── */}
        <div style={{ padding: '5px 8px 10px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div
            className="wren-input-box"
            style={{
              display: 'flex', alignItems: 'flex-end', gap: 5,
              background: C.bgSecondary, borderRadius: 14,
              border: `1.5px solid ${C.border}`, padding: '5px 5px 5px 12px',
              transition: 'border-color 0.18s',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKey}
              placeholder="Ask about health, recipes, remedies…"
              rows={1}
              style={{
                flex: 1, border: 'none', background: 'transparent', resize: 'none',
                fontSize: 13.5, color: C.text, fontFamily: 'inherit', lineHeight: '1.5',
                maxHeight: 80, overflowY: 'auto', outline: 'none',
              }}
            />

            {input.length > 800 && (
              <span style={{
                fontSize: 10,
                color: input.length >= MAX_CHARS ? C.errorText : C.textMuted,
                flexShrink: 0, alignSelf: 'center',
              }}>
                {input.length}/{MAX_CHARS}
              </span>
            )}

            {/* Mic button */}
            {speechOk ? (
              <button
                onClick={toggleListen}
                title={listening ? 'Stop listening' : 'Start voice input'}
                style={{
                  background: listening ? C.accent : 'transparent',
                  border: 'none', borderRadius: 8, padding: '6px 7px',
                  cursor: 'pointer', color: listening ? 'white' : C.textMuted,
                  fontSize: 16, lineHeight: '1', flexShrink: 0,
                  animation: listening ? 'wrenPulse 1.2s ease-in-out infinite' : 'none',
                  transition: 'all 0.18s',
                }}
              >
                🎙️
              </button>
            ) : (
              <button
                disabled
                title="Speech recognition not supported in this browser"
                style={{
                  background: 'transparent', border: 'none', borderRadius: 8,
                  padding: '6px 7px', cursor: 'not-allowed',
                  color: C.border, fontSize: 16, lineHeight: '1', flexShrink: 0,
                }}
              >
                🎙️
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || loading}
              title="Send (Enter)"
              style={{
                background: input.trim() && !loading
                  ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`
                  : C.border,
                border: 'none', borderRadius: 10, padding: '7px 10px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                color: 'white', fontSize: 14, lineHeight: '1',
                flexShrink: 0, transition: 'all 0.18s',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* ── SAVE TO FORUM MODAL ── */}
      {saveModal && (
        <SaveForumModal
          recipe={saveModal}
          title={forumTitle}
          tags={forumTags}
          onTitleChange={setForumTitle}
          onTagsChange={setForumTags}
          onSubmit={submitForum}
          onClose={() => setSaveModal(null)}
        />
      )}
    </>
  );
}

export default Chatbot;
