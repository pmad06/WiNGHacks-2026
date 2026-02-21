/**
 * Wellness Wren — Health Chatbot
 *
 * Entry point for the chatbot module.
 * Mount at App level so it appears on every page:
 *
 *   import Chatbot from './chatbot'
 *   import type { UserProfile } from './chatbot'
 *   <Chatbot user={currentUser} />
 *
 * Requires: VITE_GEMINI_API_KEY in your .env file
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Types
import type { Message, Conversation, RecipeData } from './types';
export type { UserProfile } from './types';
import type { UserProfile } from './types';

// Constants
import {
  MAX_CHARS, STORE_KEY, POPUP_KEY,
  EMERGENCY_MSG, INIT_SUGGESTIONS,
} from './constants';

// Styles
import { C, GLOBAL_CSS, miniBtnSt, hdrBtnSt } from './styles';

// Utilities
import { uid, hasEmergency, pickSuggestions, parseRecipe, makeWelcome } from './utils';

// Gemini API
import { callGemini, refreshSuggestionsApi } from './gemini';

// Sub-components
import WrenIcon from './WrenIcon';
import LoadingDots from './LoadingDots';
import MsgBubble from './MsgBubble';
import SaveForumModal from './SaveForumModal';
import HistoryPanel from './HistoryPanel';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHATBOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface ChatbotProps {
  user?: UserProfile | null;
}

function Chatbot({ user = null }: ChatbotProps) {
  // ── Popup state ───────────────────────────────────────────────────────────
  // Always start closed (icon) — never restore open state from localStorage
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(POPUP_KEY);
      return s ? (JSON.parse(s) as { isMinimized?: boolean }).isMinimized === true : false;
    } catch { return false; }
  });

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages, setMessages]           = useState<Message[]>(() => [makeWelcome(user?.name)]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId]         = useState<string>(() => uid());
  const [loading, setLoading]             = useState(false);
  const [apiError, setApiError]           = useState<string | null>(null);

  // ── Input state ───────────────────────────────────────────────────────────
  const [input, setInput]           = useState('');
  const [listening, setListening]   = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INIT_SUGGESTIONS);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
  const [saveModal, setSaveModal]     = useState<RecipeData | null>(null);
  const [forumTitle, setForumTitle]   = useState('');
  const [forumTags, setForumTags]     = useState('');

  // ── Refs ──────────────────────────────────────────────────────────────────
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const recognRef  = useRef<{ stop(): void } | null>(null);
  const msgsRef    = useRef<Message[]>(messages);
  msgsRef.current  = messages; // keep ref in sync without causing re-renders

  const loggedIn = !!(user?.id);

  // ── Persist popup state ───────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(POPUP_KEY, JSON.stringify({ isOpen, isMinimized }));
  }, [isOpen, isMinimized]);

  // ── Load saved conversations on mount ─────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setConversations(JSON.parse(raw) as Conversation[]);
    } catch { /* ignore parse errors */ }
  }, []);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Clean up speech recognition on unmount ────────────────────────────────
  useEffect(() => () => { recognRef.current?.stop(); }, []);

  // ── Archive current conversation to localStorage ──────────────────────────
  const archiveConv = useCallback((msgs: Message[], id: string) => {
    const userMsgs = msgs.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;
    const raw = userMsgs[0].content;
    const title = raw.length > 52 ? raw.slice(0, 52) + '…' : raw;
    const conv: Conversation = {
      id, title, messages: msgs,
      createdAt: msgs[0].timestamp,
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => {
      const next = [conv, ...prev.filter(c => c.id !== id)];
      // TODO: also POST to /api/conversations if user is logged in
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Archive on browser close ──────────────────────────────────────────────
  useEffect(() => {
    const handler = () => archiveConv(msgsRef.current, currentId);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [archiveConv, currentId]);

  // ── Close popup (saves conversation) ─────────────────────────────────────
  const handleClose = useCallback(() => {
    archiveConv(msgsRef.current, currentId);
    setIsOpen(false);
    setIsMinimized(false);
  }, [archiveConv, currentId]);

  // ── Start new chat ────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    archiveConv(msgsRef.current, currentId);
    const nid = uid();
    setCurrentId(nid);
    setSuggestions(INIT_SUGGESTIONS);
    setApiError(null);
    setShowHistory(false);
    setMessages([makeWelcome(user?.name ?? undefined)]);
  }, [archiveConv, currentId, user?.name]);

  // ── Load an archived conversation ─────────────────────────────────────────
  const loadConv = useCallback((conv: Conversation) => {
    archiveConv(msgsRef.current, currentId);
    setCurrentId(conv.id);
    setMessages(conv.messages);
    setShowHistory(false);
  }, [archiveConv, currentId]);

  // ── Refresh suggestion bubbles after each reply ───────────────────────────
  const refreshSuggestions = useCallback((context: string) => {
    void refreshSuggestionsApi(context, setSuggestions);
  }, []);

  // ── Core send logic ───────────────────────────────────────────────────────
  // Accepts text directly so both the input box and suggestion bubbles can call it.
  const sendText = useCallback(async (text: string) => {
    if (!text || loading) return;
    setInput('');
    setApiError(null);

    const userMsg: Message = {
      id: uid(), role: 'user', content: text,
      timestamp: new Date().toISOString(),
    };

    // Hard-coded emergency override — never hits Gemini
    if (hasEmergency(text)) {
      const eMsg: Message = {
        id: uid(), role: 'assistant', content: EMERGENCY_MSG,
        timestamp: new Date().toISOString(), isEmergency: true,
      };
      setMessages(prev => [...prev, userMsg, eMsg]);
      setSuggestions(pickSuggestions());
      return;
    }

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const raw = await callGemini(text, msgsRef.current, user);
      const { text: msgText, recipe } = parseRecipe(raw);
      const botMsg: Message = {
        id: uid(), role: 'assistant',
        content: msgText || raw,
        timestamp: new Date().toISOString(),
        ...(recipe ? { recipe } : {}),
      };
      setMessages(prev => [...prev, botMsg]);
      refreshSuggestions(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setApiError(`Connection error: ${msg}`);
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant', timestamp: new Date().toISOString(),
        content: "🌿 I'm having trouble connecting right now. Please check your connection and try again!",
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, user, refreshSuggestions]);

  // ── Send from input box ───────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    void sendText(input.trim());
  }, [input, sendText]);

  // ── Key handler (Enter = send, Shift+Enter = newline) ────────────────────
  const handleKey = useCallback((e: { key: string; shiftKey: boolean; preventDefault(): void }) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }, [handleSend]);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  const handleInputChange = useCallback((e: { target: HTMLTextAreaElement }) => {
    const v = e.target.value.slice(0, MAX_CHARS);
    setInput(v);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
  }, []);

  // ── Speech recognition toggle ─────────────────────────────────────────────
  const toggleListen = useCallback(() => {
    const SpeechAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechAPI) return;

    if (listening) {
      recognRef.current?.stop();
      setListening(false);
      return;
    }

    const r = new SpeechAPI();
    r.continuous     = false;
    r.interimResults = true;
    r.lang           = 'en-US';
    r.onresult = ev => {
      const transcript = Array.from(ev.results)
        .map(res => res[0].transcript)
        .join('');
      setInput(transcript.slice(0, MAX_CHARS));
    };
    r.onerror = () => setListening(false);
    r.onend   = () => setListening(false);
    recognRef.current = r;
    r.start();
    setListening(true);
  }, [listening]);

  // ── Open Save-to-Forum modal ──────────────────────────────────────────────
  const openSaveModal = useCallback((recipe: RecipeData) => {
    setSaveModal(recipe);
    setForumTitle(recipe.title);
    setForumTags('');
  }, []);

  // ── Submit recipe to forum ────────────────────────────────────────────────
  const submitForum = useCallback(() => {
    if (!saveModal) return;
    // TODO: POST /api/recipes { title: forumTitle, tags: forumTags.split(','), recipe: saveModal, userId: user?.id }
    console.log('Saving to forum:', { forumTitle, forumTags, recipe: saveModal });
    setSaveModal(null);
  }, [saveModal, forumTitle, forumTags]);

  const speechOk = !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: closed → floating icon
  // ─────────────────────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <button
          onClick={() => setIsOpen(true)}
          title="Open Wellness Wren"
          style={{
            position: 'fixed', bottom: 24, right: 24,
            width: 62, height: 62, borderRadius: '50%', border: 'none', padding: 0,
            background: `linear-gradient(135deg, ${C.primaryLight}, ${C.primaryDark})`,
            cursor: 'pointer', zIndex: 9999,
            boxShadow: `0 4px 20px ${C.shadow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = `0 8px 30px ${C.shadow}`;
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 4px 20px ${C.shadow}`;
          }}
        >
          <WrenIcon size={44} />
        </button>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: minimized → compact bar
  // ─────────────────────────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 290,
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
            borderRadius: 14, display: 'flex', alignItems: 'center',
            padding: '8px 10px', gap: 8,
            boxShadow: `0 4px 20px ${C.shadow}`, zIndex: 9999, cursor: 'pointer',
          }}
          onClick={() => setIsMinimized(false)}
        >
          <WrenIcon size={28} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 13.5, flex: 1 }}>
            Wellness Wren
          </span>
          <button
            onClick={e => { e.stopPropagation(); setIsMinimized(false); }}
            style={miniBtnSt} title="Maximize"
          >⬆</button>
          <button
            onClick={e => { e.stopPropagation(); handleClose(); }}
            style={miniBtnSt} title="Close"
          >✕</button>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: full popup
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 360, height: 590, background: C.bg,
        borderRadius: 20, display: 'flex', flexDirection: 'column',
        boxShadow: `0 10px 40px rgba(0,0,0,0.14), 0 0 0 1px ${C.border}`,
        zIndex: 9999, overflow: 'hidden',
        animation: 'wrenFade 0.22s ease-out',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
        }}>
          {/* Clicking the bird icon minimizes the chat */}
          <button
            onClick={() => setIsMinimized(true)}
            title="Minimize"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0, borderRadius: '50%' }}
          >
            <WrenIcon size={30} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13.5, lineHeight: '1' }}>
              Wellness Wren
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
              {loggedIn ? `Hi, ${user?.name}! 🌿` : 'Health Assistant'}
            </div>
          </div>

          <button
            onClick={handleNewChat}
            title="New Chat"
            style={{ ...hdrBtnSt, fontSize: 11, fontWeight: 600 }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseOut={e  => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
          >
            ✨ New
          </button>

          <button
            onClick={() => setShowHistory(h => !h)}
            title="Chat History"
            style={{
              ...hdrBtnSt,
              background: showHistory ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)',
            }}
          >
            🕐
          </button>

          <button onClick={() => setIsMinimized(true)} title="Minimize" style={{ ...hdrBtnSt, fontSize: 18 }}>
            −
          </button>

          <button onClick={handleClose} title="Close" style={hdrBtnSt}>✕</button>
        </div>

        {/* ── HISTORY PANEL ── */}
        {showHistory && <HistoryPanel conversations={conversations} onLoad={loadConv} />}

        {/* ── MESSAGES ── */}
        <div
          className="wren-scroll"
          style={{
            flex: 1, overflowY: 'auto', padding: '12px 10px 4px',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          {messages.map(m => (
            <MsgBubble key={m.id} message={m} isLoggedIn={loggedIn} onSave={openSaveModal} />
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <WrenIcon size={24} />
              <div style={{
                background: C.bgSecondary, borderRadius: '18px 18px 18px 4px',
                border: `1px solid ${C.border}`,
              }}>
                <LoadingDots />
              </div>
            </div>
          )}

          {apiError && (
            <div style={{
              background: C.errorBg, border: `1px solid ${C.errorBorder}`,
              borderRadius: 8, padding: '7px 12px', fontSize: 12, color: C.errorText,
            }}>
              {apiError}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── SUGGESTION BUBBLES ── */}
        <div style={{ padding: '5px 10px 3px', flexShrink: 0 }}>
          <div className="wren-sugs" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 3 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="wren-sug"
                onClick={() => void sendText(s)}
                style={{
                  flexShrink: 0, background: C.primarySoft,
                  border: `1px solid ${C.primaryLight}`,
                  borderRadius: 20, padding: '5px 12px',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                  fontSize: 11.5, color: C.primaryDark, fontWeight: 500,
                  transition: 'all 0.18s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── DISCLAIMER ── */}
        <div style={{
          textAlign: 'center', fontSize: 10, color: C.textLight,
          padding: '1px 12px 3px', flexShrink: 0,
        }}>
          ⚠️ AI-generated info — always consult a healthcare professional for medical advice
        </div>

        {/* ── INPUT AREA ── */}
        <div style={{ padding: '5px 8px 10px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div
            className="wren-input-box"
            style={{
              display: 'flex', alignItems: 'flex-end', gap: 5,
              background: C.bgSecondary, borderRadius: 14,
              border: `1.5px solid ${C.border}`, padding: '5px 5px 5px 12px',
              transition: 'border-color 0.18s',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKey}
              placeholder="Ask about health, recipes, remedies…"
              rows={1}
              style={{
                flex: 1, border: 'none', background: 'transparent', resize: 'none',
                fontSize: 13.5, color: C.text, fontFamily: 'inherit', lineHeight: '1.5',
                maxHeight: 80, overflowY: 'auto', outline: 'none',
              }}
            />

            {input.length > 800 && (
              <span style={{
                fontSize: 10,
                color: input.length >= MAX_CHARS ? C.errorText : C.textMuted,
                flexShrink: 0, alignSelf: 'center',
              }}>
                {input.length}/{MAX_CHARS}
              </span>
            )}

            {/* Mic button */}
            {speechOk ? (
              <button
                onClick={toggleListen}
                title={listening ? 'Stop listening' : 'Start voice input'}
                style={{
                  background: listening ? C.accent : 'transparent',
                  border: 'none', borderRadius: 8, padding: '6px 7px',
                  cursor: 'pointer', color: listening ? 'white' : C.textMuted,
                  fontSize: 16, lineHeight: '1', flexShrink: 0,
                  animation: listening ? 'wrenPulse 1.2s ease-in-out infinite' : 'none',
                  transition: 'all 0.18s',
                }}
              >
                🎙️
              </button>
            ) : (
              <button
                disabled
                title="Speech recognition not supported in this browser"
                style={{
                  background: 'transparent', border: 'none', borderRadius: 8,
                  padding: '6px 7px', cursor: 'not-allowed',
                  color: C.border, fontSize: 16, lineHeight: '1', flexShrink: 0,
                }}
              >
                🎙️
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || loading}
              title="Send (Enter)"
              style={{
                background: input.trim() && !loading
                  ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`
                  : C.border,
                border: 'none', borderRadius: 10, padding: '7px 10px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                color: 'white', fontSize: 14, lineHeight: '1',
                flexShrink: 0, transition: 'all 0.18s',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* ── SAVE TO FORUM MODAL ── */}
      {saveModal && (
        <SaveForumModal
          recipe={saveModal}
          title={forumTitle}
          tags={forumTags}
          onTitleChange={setForumTitle}
          onTagsChange={setForumTags}
          onSubmit={submitForum}
          onClose={() => setSaveModal(null)}
        />
      )}
    </>
  );
}

export default Chatbot;
