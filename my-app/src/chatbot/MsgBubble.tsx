/**
 * MsgBubble.tsx — Single chat message bubble
 *
 * Shows the message text with markdown rendering.
 * If the message has recipe data, renders a RecipeCard below the bubble.
 * Timestamp is revealed on hover.
 */

import { useState } from 'react';
import type { Message, RecipeData } from './types';
import { C } from './styles';
import { renderMarkdown } from './utils';
import WrenIcon from './WrenIcon';
import RecipeCard from './RecipeCard';

interface MsgBubbleProps {
  message:    Message;
  isLoggedIn: boolean;
  onSave:     (r: RecipeData) => void;
}

export default function MsgBubble({ message, isLoggedIn, onSave }: MsgBubbleProps) {
  const [showTs, setShowTs] = useState(false);
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 6, marginBottom: 8, alignItems: 'flex-end',
      }}
      onMouseEnter={() => setShowTs(true)}
      onMouseLeave={() => setShowTs(false)}
    >
      {/* Wren avatar on assistant messages */}
      {!isUser && <div style={{ flexShrink: 0 }}><WrenIcon size={24} /></div>}

      <div style={{
        maxWidth: '82%', display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        {/* Bubble */}
        <div style={{
          padding: '9px 14px',
          borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          background: message.isEmergency
            ? C.errorBg
            : isUser
              ? C.primary
              : C.bgSecondary,
          color: isUser ? 'white' : C.text,
          border: message.isEmergency
            ? `1.5px solid ${C.errorBorder}`
            : isUser ? 'none' : `1px solid ${C.border}`,
          fontSize: 13.5, lineHeight: 1.6, wordBreak: 'break-word',
          fontFamily: 'Georgia, serif',
        }}>
          {renderMarkdown(message.content)}
        </div>

        {/* Inline recipe card */}
        {message.recipe && (
          <RecipeCard recipe={message.recipe} isLoggedIn={isLoggedIn} onSave={onSave} />
        )}

        {/* Hover timestamp */}
        {showTs && (
          <div style={{ fontSize: 10, color: C.textLight, marginTop: 2, padding: '0 4px' }}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}
