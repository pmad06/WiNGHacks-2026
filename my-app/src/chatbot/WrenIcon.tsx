/**
 * WrenIcon.tsx — Care Bear SVG mascot
 * Cute bird with a leaf crown in the app's sage/forest green palette.
 */

export default function WrenIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Care Bear"
    >
      <defs>
        <linearGradient id="wrenGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#7FA96E" />
          <stop offset="100%" stopColor="#364B30" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="20" cy="20" r="20" fill="url(#wrenGrad)" />

      {/* Wings */}
      <ellipse cx="11" cy="25" rx="5" ry="7" fill="#A8C896" transform="rotate(-20 11 25)" />
      <ellipse cx="29" cy="25" rx="5" ry="7" fill="#A8C896" transform="rotate(20 29 25)" />

      {/* Body */}
      <ellipse cx="20" cy="26" rx="9" ry="8" fill="#FDE8D8" />

      {/* Head */}
      <circle cx="20" cy="15" r="8" fill="#FDE8D8" />

      {/* Eyes */}
      <circle cx="17"   cy="14"   r="1.8" fill="#1E3318" />
      <circle cx="23"   cy="14"   r="1.8" fill="#1E3318" />
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
