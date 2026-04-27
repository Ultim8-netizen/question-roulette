'use client'

import { useEffect, useRef, useState } from 'react'
import type { Message, PlayerSlot } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MessageThreadProps = {
  /** All messages for the current question, ordered chronologically. */
  messages: Message[]
  /** Slot of the viewing player (1 or 2) — used to align bubbles. */
  mySlot: PlayerSlot
  /** Display name of the viewing player — used for send attribution. */
  myName: string
  /** Called with trimmed content when the player submits a message. */
  onSend: (content: string) => Promise<void>
  /** True while a POST /api/messages request is in-flight. */
  isSending: boolean
  /**
   * Tier accent color from TIER_CONFIG[tier].primary.
   * Passed from PickModal so the thread is visually cohesive with the card.
   */
  accentColor: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// ---------------------------------------------------------------------------
// MessageThread
// ---------------------------------------------------------------------------

export function MessageThread({
  messages,
  mySlot,
  onSend,
  isSending,
  accentColor,
}: MessageThreadProps) {
  const [draft,    setDraft]    = useState('')
  const scrollRef  = useRef<HTMLDivElement>(null)
  const textareaRef= useRef<HTMLTextAreaElement>(null)

  // Scroll to the bottom whenever the message list changes (initial load + new arrivals).
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Auto-resize the textarea to fit its content (up to 96px).
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const ta = e.target
    setDraft(ta.value)
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px'
  }

  async function handleSend() {
    const trimmed = draft.trim()
    if (!trimmed || isSending) return

    setDraft('')
    // Reset textarea height after clearing.
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    await onSend(trimmed)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = draft.trim().length > 0 && !isSending

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes mt-msg-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mt-spin {
          to { transform: rotate(360deg); }
        }

        .mt-font-sans { font-family: 'DM Sans', system-ui, sans-serif; }

        /* Thin scrollbar for the message list */
        .mt-scroll::-webkit-scrollbar        { width: 3px; }
        .mt-scroll::-webkit-scrollbar-track  { background: transparent; }
        .mt-scroll::-webkit-scrollbar-thumb  {
          background: rgba(255,255,255,0.08);
          border-radius: 99px;
        }

        .mt-msg { animation: mt-msg-in 0.22s cubic-bezier(0.22,1,0.36,1) both; }

        .mt-send-spinner {
          width: 12px; height: 12px;
          border-radius: 50%;
          border: 1.5px solid transparent;
          border-top-color: currentColor;
          animation: mt-spin 0.7s linear infinite;
        }
      `}</style>

      <div className="mt-font-sans" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Section divider */}
        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.06)',
          margin: '14px 0 12px',
          flexShrink: 0,
        }} />

        {/* Thread label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}`,
            flexShrink: 0,
          }} />
          <span style={{
            color: '#334155',
            fontSize: '0.60rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            Responses
          </span>
          {messages.length > 0 && (
            <span style={{
              marginLeft: 'auto',
              color: '#1e2535',
              fontSize: '0.60rem',
              fontWeight: 500,
            }}>
              {messages.length}
            </span>
          )}
        </div>

        {/* Message list */}
        <div
          ref={scrollRef}
          className="mt-scroll"
          style={{
            overflowY:     'auto',
            maxHeight:     192,
            minHeight:     56,
            display:       'flex',
            flexDirection: 'column',
            gap:           8,
            paddingRight:  4,
            marginBottom:  10,
          }}
        >
          {messages.length === 0 ? (
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              height:         56,
              color:          '#1e2535',
              fontSize:       '0.72rem',
              fontStyle:      'italic',
            }}>
              Be the first to respond...
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.player === mySlot
              return (
                <div
                  key={msg.id}
                  className="mt-msg"
                  style={{
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    isMe ? 'flex-end' : 'flex-start',
                    gap:           3,
                  }}
                >
                  {/* Name + time row */}
                  <div style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           5,
                    flexDirection: isMe ? 'row-reverse' : 'row',
                  }}>
                    <span style={{
                      color:          isMe ? `${accentColor}99` : '#475569',
                      fontSize:       '0.58rem',
                      fontWeight:     600,
                      letterSpacing:  '0.06em',
                    }}>
                      {msg.player_name}
                    </span>
                    <span style={{ color: '#1e2535', fontSize: '0.55rem' }}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div style={{
                    maxWidth:     '84%',
                    padding:      '8px 12px',
                    borderRadius: isMe
                      ? '14px 14px 4px 14px'
                      : '14px 14px 14px 4px',
                    background:   isMe
                      ? `${accentColor}14`
                      : 'rgba(255,255,255,0.04)',
                    border:       isMe
                      ? `1px solid ${accentColor}2a`
                      : '1px solid rgba(255,255,255,0.06)',
                    color:        isMe ? '#d1d9e6' : '#94a3b8',
                    fontSize:     '0.82rem',
                    fontWeight:   400,
                    lineHeight:   1.52,
                    wordBreak:    'break-word',
                  }}>
                    {msg.content}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Input row */}
        <div style={{
          display:     'flex',
          gap:         8,
          alignItems:  'flex-end',
          flexShrink:  0,
        }}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            maxLength={500}
            rows={1}
            style={{
              flex:        1,
              resize:      'none',
              borderRadius: 12,
              background:  '#070810',
              border:      '1px solid rgba(255,255,255,0.07)',
              color:       '#d1d9e6',
              fontSize:    '0.82rem',
              padding:     '9px 12px',
              fontFamily:  "'DM Sans', system-ui, sans-serif",
              outline:     'none',
              lineHeight:  1.45,
              minHeight:   38,
              maxHeight:   96,
              overflowY:   'auto',
              transition:  'border-color 0.2s ease',
              boxSizing:   'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.13)')}
            onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            style={{
              flexShrink:      0,
              width:           38,
              height:          38,
              borderRadius:    11,
              background:      canSend
                ? `${accentColor}18`
                : 'rgba(255,255,255,0.03)',
              border:          canSend
                ? `1px solid ${accentColor}33`
                : '1px solid rgba(255,255,255,0.05)',
              color:           canSend ? accentColor : '#1e2535',
              cursor:          canSend ? 'pointer' : 'default',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              transition:      'all 0.18s ease',
            }}
          >
            {isSending ? (
              <div className="mt-send-spinner" style={{ color: accentColor }} />
            ) : (
              /* Paper-plane send icon */
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14.5 1.5L1 6.5l5 2 2 5 1.5-4.5L14.5 1.5z"
                  fill="currentColor"
                  fillOpacity="0.88"
                  strokeLinejoin="round"
                />
                <line
                  x1="6" y1="8.5"
                  x2="9.5" y2="5"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeOpacity="0.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Character count — only appears near the limit */}
        {draft.length > 420 && (
          <div style={{
            textAlign:  'right',
            color:      draft.length > 480 ? '#ef4444' : '#334155',
            fontSize:   '0.58rem',
            marginTop:  4,
            transition: 'color 0.2s ease',
          }}>
            {500 - draft.length} left
          </div>
        )}

      </div>
    </>
  )
}