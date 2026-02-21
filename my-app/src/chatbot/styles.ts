import type { CSSProperties } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE — sage/forest green matching app theme
// ─────────────────────────────────────────────────────────────────────────────
export const C = {
  primary:      '#4E7A3C',                 // mid forest green
  primaryDark:  '#364B30',                 // dark forest green (matches nav active)
  primaryLight: '#7FA96E',                 // sage green (matches nav bg)
  primarySoft:  '#E8F2E3',                 // pale mint tint
  accent:       '#C8A435',                 // warm gold for save/accent actions
  text:         '#1F2937',                 // dark charcoal
  textMuted:    '#556B46',                 // muted sage text
  textLight:    '#8FA880',                 // light sage text
  bg:           '#FFFFFF',                 // white
  bgSecondary:  '#F2F7EE',                 // pale green-white
  border:       '#C8D9BE',                 // soft green border
  shadow:       'rgba(54, 75, 48, 0.22)',  // dark green shadow
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
  .wren-scroll::-webkit-scrollbar-thumb { background: #7FA96E; border-radius: 4px; }
  .wren-sugs::-webkit-scrollbar { display: none; }
  .wren-sugs { scrollbar-width: none; -ms-overflow-style: none; }
  .wren-sug:hover { background: #4E7A3C !important; color: white !important; }
  .wren-input-box:focus-within { border-color: #7FA96E !important; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED BUTTON STYLES
// ─────────────────────────────────────────────────────────────────────────────

/** Small button used in the minimized bar */
export const miniBtnSt: CSSProperties = {
  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
  color: 'white', cursor: 'pointer', padding: '2px 7px', fontSize: 12,
};

/** Icon/text button used in the full popup header */
export const hdrBtnSt: CSSProperties = {
  background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 8,
  color: 'white', cursor: 'pointer', padding: '4px 8px', fontSize: 12, lineHeight: '1',
};
