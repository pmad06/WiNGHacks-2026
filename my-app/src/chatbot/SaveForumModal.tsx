/**
 * SaveForumModal.tsx — Modal for saving a recipe to the Recipe Forum
 *
 * Lets the user set a custom title and comma-separated tags before saving.
 * Click outside or Cancel to dismiss.
 */

import type { RecipeData } from './types';
import { C } from './styles';

interface SaveModalProps {
  recipe:        RecipeData;
  title:         string;
  tags:          string;
  onTitleChange: (v: string) => void;
  onTagsChange:  (v: string) => void;
  onSubmit:      () => void;
  onClose:       () => void;
}

export default function SaveForumModal({
  recipe, title, tags, onTitleChange, onTagsChange, onSubmit, onClose,
}: SaveModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16, padding: 24, width: 320,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'wrenFade 0.2s ease-out',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h3 style={{ margin: '0 0 4px', color: C.primaryDark, fontSize: 16 }}>
          🌸 Save to Recipe Forum
        </h3>
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
