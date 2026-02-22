import { useState } from 'react';
import type { RecipeData } from './types';

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
      border: '1.5px solid #354a2f',
      borderRadius: '16px',
      overflow: 'hidden',
      background: '#dce3c7',
      fontFamily: 'Georgia, serif',
      fontSize: 13,
    }}>

      {/* Header */}
      <div style={{
        background: '#354a2f',
        padding: '12px 16px',
        color: 'white',
      }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{recipe.title}</div>
        {recipe.symptomHelp && (
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{recipe.symptomHelp}</div>
        )}
      </div>

      {/* Timing row */}
      {(recipe.prepTime || recipe.cookTime || recipe.totalTime || recipe.servings) && (
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap',
          padding: '8px 16px',
          borderBottom: '1px solid #354a2f',
          color: '#354a2f',
          fontSize: 12,
        }}>
          {recipe.prepTime  && <span>Prep: <b>{recipe.prepTime}</b></span>}
          {recipe.cookTime  && <span>Cook: <b>{recipe.cookTime}</b></span>}
          {recipe.totalTime && <span>Total: <b>{recipe.totalTime}</b></span>}
          {recipe.servings  && <span>Serves: <b>{recipe.servings}</b></span>}
        </div>
      )}

      {/* Ingredients */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #354a2f' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#354a2f' }}>Ingredients</span>
          <div style={{ display: 'flex', border: '1px solid #354a2f', borderRadius: 4, overflow: 'hidden' }}>
            {(['US', 'Metric'] as const).map((unit, i) => (
              <button
                key={unit}
                onClick={() => setMetric(i === 1)}
                style={{
                  padding: '2px 10px', fontSize: 11, border: 'none', cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  background: metric === (i === 1) ? '#354a2f' : 'transparent',
                  color:      metric === (i === 1) ? 'white'   : '#354a2f',
                }}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: '#2a2a2a' }}>
          {ingredients.map((ing, i) => <li key={i} style={{ marginBottom: 3 }}>{ing}</li>)}
        </ul>
      </div>

      {/* Instructions */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontWeight: 600, color: '#354a2f', marginBottom: 8 }}>Instructions</div>
        <ol style={{ margin: 0, paddingLeft: 18, color: '#2a2a2a' }}>
          {recipe.instructions.map((step, i) => (
            <li key={i} style={{ marginBottom: 5, lineHeight: 1.6 }}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Save to Forum (logged-in only) */}
      {isLoggedIn && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #354a2f' }}>
          <button
            onClick={() => onSave(recipe)}
            style={{
              width: '100%', padding: '8px 0',
              background: '#354a2f',
              color: 'white', border: 'none', borderRadius: 4,
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
              fontFamily: 'Georgia, serif',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#556B46'; }}
            onMouseOut={e  => { e.currentTarget.style.background = '#354a2f'; }}
          >
            Save to Recipe Forum
          </button>
        </div>
      )}
    </div>
  );
}
