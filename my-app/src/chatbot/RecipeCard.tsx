/**
 * RecipeCard.tsx — Displays a structured recipe returned by Gemini
 *
 * Features:
 *  - US / Metric ingredient toggle
 *  - Numbered instruction list
 *  - "Save to Recipe Forum" button (logged-in users only)
 */

import { useState } from 'react';
import type { RecipeData } from './types';
import { C } from './styles';

interface RecipeCardProps {
  recipe:     RecipeData;
  isLoggedIn: boolean;
  onSave:     (r: RecipeData) => void;
}

export default function RecipeCard({ recipe, isLoggedIn, onSave }: RecipeCardProps) {
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

      {/* Timing row */}
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
          {/* US / Metric toggle */}
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
