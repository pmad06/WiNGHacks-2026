/**
 * HistoryPanel.tsx — Archived conversation list
 *
 * Shown inside the chatbot popup when the user clicks the 🕐 button.
 * Click any past chat to reload it.
 */

import type { Conversation } from './types';
import { C } from './styles';

interface HistoryPanelProps {
  conversations: Conversation[];
  onLoad:        (c: Conversation) => void;
}

export default function HistoryPanel({ conversations, onLoad }: HistoryPanelProps) {
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
