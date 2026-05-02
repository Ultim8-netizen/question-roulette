'use client'

import { useEffect, useRef, useState } from 'react'
import type { Message, PlayerSlot } from '@/lib/supabase'

type MessageThreadProps = {
  messages:      Message[]
  mySlot:        PlayerSlot
  myName:        string
  onSend:        (content: string) => Promise<void>
  isSending:     boolean
  accentColor:   string
  onTyping:      () => void
  isOtherTyping: boolean
  /** sessionStorage key used to persist the unsent draft across card closes */
  draftKey:      string
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export function MessageThread({
  messages,
  mySlot,
  onSend,
  isSending,
  accentColor,
  onTyping,
  isOtherTyping,
  draftKey,
}: MessageThreadProps) {
  // Restore any unsent draft that survived a previous card close
  const [draft, setDraft] = useState<string>(() => {
    try { return sessionStorage.getItem(draftKey) ?? '' } catch { return '' }
  })

  const scrollRef       = useRef<HTMLDivElement>(null)
  const textareaRef     = useRef<HTMLTextAreaElement>(null)
  const lastTypingRef   = useRef<number>(0)
  const THROTTLE_MS     = 1_500

  // Sync textarea height on mount if a draft was restored
  useEffect(() => {
    const ta = textareaRef.current
    if (ta && draft) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 96) + 'px'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isOtherTyping])

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const ta = e.target
    const value = ta.value
    setDraft(value)

    // Persist every keystroke so no text is lost on forced close
    try {
      if (value) { sessionStorage.setItem(draftKey, value) }
      else       { sessionStorage.removeItem(draftKey) }
    } catch { /* private browsing — ignore */ }

    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px'

    const now = Date.now()
    if (now - lastTypingRef.current >= THROTTLE_MS) {
      lastTypingRef.current = now
      onTyping()
    }
  }

  async function handleSend() {
    const trimmed = draft.trim()
    if (!trimmed || isSending) return
    setDraft('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Clear the saved draft only after a successful send
    try { sessionStorage.removeItem(draftKey) } catch { /* ignore */ }

    await onSend(trimmed)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
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
        @keyframes mt-spin { to { transform: rotate(360deg); } }
        @keyframes mt-typing-dot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-3px); opacity: 1;   }
        }

        .mt-font-sans { font-family: 'DM Sans', system-ui, sans-serif; }

        .mt-scroll::-webkit-scrollbar        { width: 3px; }
        .mt-scroll::-webkit-scrollbar-track  { background: transparent; }
        .mt-scroll::-webkit-scrollbar-thumb  {
          background: var(--th-border-2);
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

        .mt-typing-dot-1 { animation: mt-typing-dot 1.2s ease-in-out 0.0s infinite; }
        .mt-typing-dot-2 { animation: mt-typing-dot 1.2s ease-in-out 0.2s infinite; }
        .mt-typing-dot-3 { animation: mt-typing-dot 1.2s ease-in-out 0.4s infinite; }
      `}</style>

      <div className="mt-font-sans" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'var(--th-border)',
          margin: '14px 0 12px',
          flexShrink: 0,
        }} />

        {/* Thread label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}`,
            flexShrink: 0,
          }} />
          <span style={{
            color: 'var(--th-text-3)',
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
              color: 'var(--th-text-4)',
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
            overflowY: 'auto',
            maxHeight: 192,
            minHeight: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingRight: 4,
            marginBottom: 10,
          }}
        >
          {messages.length === 0 && !isOtherTyping ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 56,
              color: 'var(--th-text-4)',
              fontSize: '0.72rem',
              fontStyle: 'italic',
            }}>
              Be the first to respond...
            </div>
          ) : (
            <>
              {messages.map(msg => {
                const isMe = msg.player === mySlot
                return (
                  <div
                    key={msg.id}
                    className="mt-msg"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      gap: 3,
                    }}
                  >
                    {/* Name + time */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      flexDirection: isMe ? 'row-reverse' : 'row',
                    }}>
                      <span style={{
                        color: isMe ? `${accentColor}99` : 'var(--th-text-3)',
                        fontSize: '0.58rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                      }}>
                        {msg.player_name}
                      </span>
                      <span style={{ color: 'var(--th-text-4)', fontSize: '0.55rem' }}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>

                    {/* Bubble */}
                    <div style={{
                      maxWidth: '84%',
                      padding: '8px 12px',
                      borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isMe
                        ? `${accentColor}14`
                        : 'var(--th-surface)',
                      border: isMe
                        ? `1px solid ${accentColor}2a`
                        : '1px solid var(--th-border)',
                      color: isMe ? 'var(--th-fg)' : 'var(--th-text-2)',
                      fontSize: '0.82rem',
                      fontWeight: 400,
                      lineHeight: 1.52,
                      wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isOtherTyping && (
                <div
                  className="mt-msg"
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-start', gap: 3,
                  }}
                >
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '14px 14px 14px 4px',
                    background: 'var(--th-surface)',
                    border: '1px solid var(--th-border)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span className="mt-typing-dot-1" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--th-text-3)' }} />
                    <span className="mt-typing-dot-2" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--th-text-3)' }} />
                    <span className="mt-typing-dot-3" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--th-text-3)' }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            maxLength={500}
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              borderRadius: 12,
              background: 'var(--th-input-bg)',
              border: '1px solid var(--th-input-border)',
              color: 'var(--th-fg)',
              fontSize: '0.82rem',
              padding: '9px 12px',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              outline: 'none',
              lineHeight: 1.45,
              minHeight: 38,
              maxHeight: 96,
              overflowY: 'auto',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--th-border-2)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--th-input-border)')}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            style={{
              flexShrink: 0,
              width: 38, height: 38,
              borderRadius: 11,
              background: canSend ? `${accentColor}18` : 'var(--th-border)',
              border: canSend
                ? `1px solid ${accentColor}33`
                : '1px solid var(--th-border)',
              color: canSend ? accentColor : 'var(--th-text-4)',
              cursor: canSend ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s ease',
            }}
          >
            {isSending ? (
              <div className="mt-send-spinner" style={{ color: accentColor }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M14.5 1.5L1 6.5l5 2 2 5 1.5-4.5L14.5 1.5z" fill="currentColor" fillOpacity="0.88" strokeLinejoin="round" />
                <line x1="6" y1="8.5" x2="9.5" y2="5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Character count */}
        {draft.length > 420 && (
          <div style={{
            textAlign: 'right',
            color: draft.length > 480 ? '#ef4444' : 'var(--th-text-3)',
            fontSize: '0.58rem',
            marginTop: 4,
            transition: 'color 0.2s ease',
          }}>
            {500 - draft.length} left
          </div>
        )}

      </div>
    </>
  )
}