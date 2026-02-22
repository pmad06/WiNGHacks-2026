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
          background: '#dce3c7', borderRadius: 16, padding: 24, width: 320,
          border: '1.5px solid #354a2f', animation: 'wrenFade 0.2s ease-out',
          fontFamily: 'Georgia, serif',
        }}
      >
        <h3 style={{ margin: '0 0 4px', color: C.primaryDark, fontSize: 16 }}>
          Save to Recipe Forum
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
            width: '100%', padding: '8px 12px', borderRadius: 4,
            border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text,
            fontFamily: 'Georgia, serif', boxSizing: 'border-box', marginBottom: 12, outline: 'none',
            background: 'white',
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
            width: '100%', padding: '8px 12px', borderRadius: 4,
            border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text,
            fontFamily: 'Georgia, serif', boxSizing: 'border-box', marginBottom: 20, outline: 'none',
            background: 'white',
          }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onSubmit}
            style={{
              flex: 1, padding: '9px 0',
              background: C.primary,
              color: 'white', border: 'none', borderRadius: 4,
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
              fontFamily: 'Georgia, serif',
            }}
          >
            Save Recipe
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '9px 0', background: 'transparent',
              color: C.textMuted, border: `1px solid ${C.border}`,
              borderRadius: 4, cursor: 'pointer', fontSize: 13,
              fontFamily: 'Georgia, serif',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
