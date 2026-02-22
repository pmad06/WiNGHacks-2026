import type { CSSProperties } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE — matches HealthInfo / RecipeCard style
// ─────────────────────────────────────────────────────────────────────────────
export const C = {
  primary:      '#354a2f',   // dark forest green
  primaryDark:  '#354a2f',
  primaryLight: '#556B46',   // muted sage
  primarySoft:  '#dce3c7',   // card background
  accent:       '#354a2f',
  text:         '#2a2a2a',
  textMuted:    '#556B46',
  textLight:    '#556B46',
  bg:           '#FFFFFF',
  bgSecondary:  '#dce3c7',
  border:       '#354a2f',
  shadow:       'rgba(53, 74, 47, 0.18)',
  errorBg:      '#FEF2F2',
  errorBorder:  '#FECACA',
  errorText:    '#EF4444',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS ANIMATIONS + UTILITY CLASSES
// ─────────────────────────────────────────────────────────────────────────────
export const GLOBAL_CSS = `
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
  .wren-scroll::-webkit-scrollbar-thumb { background: #556B46; border-radius: 2px; }
  .wren-sugs::-webkit-scrollbar { display: none; }
  .wren-sugs { scrollbar-width: none; -ms-overflow-style: none; }
  .wren-sug:hover { background: #354a2f !important; color: white !important; }
  .wren-input-box:focus-within { border-color: #354a2f !important; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED BUTTON STYLES
// ─────────────────────────────────────────────────────────────────────────────

/** Small button used in the minimized bar */
export const miniBtnSt: CSSProperties = {
  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 4,
  color: 'white', cursor: 'pointer', padding: '2px 7px', fontSize: 12,
  fontFamily: 'Georgia, serif',
};

/** Icon/text button used in the full popup header */
export const hdrBtnSt: CSSProperties = {
  background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 4,
  color: 'white', cursor: 'pointer', padding: '4px 8px', fontSize: 12, lineHeight: '1',
  fontFamily: 'Georgia, serif',
};
