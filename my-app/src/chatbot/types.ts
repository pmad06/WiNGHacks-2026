// ─────────────────────────────────────────────────────────────────────────────
// SPEECH RECOGNITION TYPES
// Not universally available in all TS DOM configs, so we define them manually.
// ─────────────────────────────────────────────────────────────────────────────
export interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
}
export interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionAlternativeLike;
}
export interface SpeechRecognitionResultListLike {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResultLike;
}
export interface SpeechRecognitionEventLike extends Event {
  readonly results: SpeechRecognitionResultListLike;
}
export interface SpeechRecognitionLike {
  continuous:     boolean;
  interimResults: boolean;
  lang:           string;
  start():        void;
  stop():         void;
  onresult:       ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror:        (() => void) | null;
  onend:          (() => void) | null;
}
export type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?:       SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT DATA INTERFACES
// ─────────────────────────────────────────────────────────────────────────────
export interface RecipeData {
  title:                string;
  symptomHelp:          string;
  prepTime:             string;
  cookTime:             string;
  totalTime:            string;
  servings:             string;
  ingredientsCustomary: string[];
  ingredientsMetric:    string[];
  instructions:         string[];
}

export interface Message {
  id:          string;
  role:        'user' | 'assistant';
  content:     string;
  timestamp:   string; // ISO string
  recipe?:     RecipeData;
  isEmergency?: boolean;
}

export interface Conversation {
  id:        string;
  title:     string;
  messages:  Message[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id?:                  string;
  name?:                string;
  dietaryRestrictions?: string[];
  healthGoals?:         string[];
  allergies?:           string[];
}
