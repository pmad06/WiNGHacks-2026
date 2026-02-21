/**
 * LoadingDots.tsx — Animated three-dot loading indicator
 * Shown while waiting for a Gemini response.
 */

import { C } from './styles';

export default function LoadingDots() {
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
