'use client'

import { useEffect, useRef, useState } from 'react'
import type { Message, PlayerSlot } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// One-time tip hook — shows a piece of UI exactly once per device.
// Reads localStorage during useState lazy init (no effect needed),
// which satisfies react-hooks/set-state-in-effect.
// ---------------------------------------------------------------------------

function useOneTip(key: string): [boolean, () => void] {
  const storageKey = `r13-tip-${key}`

  // Lazy initializer runs once synchronously on first render — not inside
  // an effect — so no setState-in-effect violation occurs.
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(storageKey)
    } catch {
      // Private browsing or SSR — show the tip.
      return true
    }
  })

  function dismiss() {
    setVisible(false)
    try { localStorage.setItem(storageKey, '1') } catch { /* ignore */ }
  }

  return [visible, dismiss]
}

// ---------------------------------------------------------------------------
// Types / helpers
// ---------------------------------------------------------------------------

type MessageThreadProps = {
  messages:      Message[]
  mySlot:        PlayerSlot
  myName:        string
  onSend:        (content: string, replyToId?: string) => Promise<void>
  onEdit:        (messageId: string, content: string) => Promise<void>
  isSending:     boolean
  accentColor:   string
  onTyping:      () => void
  isOtherTyping: boolean
  draftKey:      string
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function MessageThread({
  messages,
  mySlot,
  onSend,
  onEdit,
  isSending,
  accentColor,
  onTyping,
  isOtherTyping,
  draftKey,
}: MessageThreadProps) {
  const [draft, setDraft] = useState<string>(() => {
    try { return sessionStorage.getItem(draftKey) ?? '' } catch { return '' }
  })

  const [replyTo, setReplyTo] = useState<Message | null>(null)

  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [editDraft,  setEditDraft]  = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const [hintVisible, dismissHint] = useOneTip('msg-interactions')

  const scrollRef       = useRef<HTMLDivElement>(null)
  const textareaRef     = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)
  const lastTypingRef   = useRef<number>(0)
  const longPressRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const THROTTLE_MS     = 1_500
  const LONG_PRESS_MS   = 500

  useEffect(() => {
    const ta = textareaRef.current
    if (ta && draft) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 96) + 'px' }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isOtherTyping])

  // Auto-dismiss at 2+ messages — user has seen the thread working,
  // hint is now noise. dismiss() only calls setVisible(false) and
  // localStorage.setItem — no cascading render risk.
  useEffect(() => {
    if (messages.length >= 2 && hintVisible) dismissHint()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  useEffect(() => {
    if (editingId && editTextareaRef.current) {
      const ta = editTextareaRef.current
      ta.focus()
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
      ta.selectionStart = ta.selectionEnd = ta.value.length
    }
  }, [editingId])

  // ── Long-press handlers ──────────────────────────────────────────────────

  function startLongPress(msg: Message) {
    if (msg.player !== mySlot) return
    longPressRef.current = setTimeout(() => {
      setEditingId(msg.id)
      setEditDraft(msg.content)
      if (hintVisible) dismissHint()
    }, LONG_PRESS_MS)
  }

  function cancelLongPress() {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  // ── Compose handlers ─────────────────────────────────────────────────────

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const ta = e.target
    const value = ta.value
    setDraft(value)
    try {
      if (value) { sessionStorage.setItem(draftKey, value) }
      else        { sessionStorage.removeItem(draftKey) }
    } catch {}
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
    const replyToId = replyTo?.id
    setDraft('')
    setReplyTo(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    try { sessionStorage.removeItem(draftKey) } catch {}
    await onSend(trimmed, replyToId)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Reply via double-click ────────────────────────────────────────────────

  function handleDoubleClick(msg: Message) {
    setReplyTo(msg)
    if (hintVisible) dismissHint()
  }

  // ── Edit handlers ────────────────────────────────────────────────────────

  function handleEditInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const ta = e.target
    setEditDraft(ta.value)
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  async function handleEditSave() {
    const trimmed = editDraft.trim()
    if (!trimmed || !editingId || editSaving) return
    const id = editingId
    setEditSaving(true)
    setEditingId(null)
    setEditDraft('')
    try {
      await onEdit(id, trimmed)
    } finally {
      setEditSaving(false)
    }
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditDraft('')
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave() }
    if (e.key === 'Escape') { handleEditCancel() }
  }

  const canSend = draft.trim().length > 0 && !isSending
  const showInteractionHint = hintVisible && messages.length > 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Figtree:wght@300;400;500;600&display=swap');

        @keyframes mt-msg-in     { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mt-spin       { to{transform:rotate(360deg)} }
        @keyframes mt-typing-dot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-3px);opacity:1} }
        @keyframes mt-reply-in   { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mt-edit-in    { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
        @keyframes mt-hint-in    { from{opacity:0} to{opacity:1} }

        .mt-scroll::-webkit-scrollbar       { width:3px }
        .mt-scroll::-webkit-scrollbar-track  { background:transparent }
        .mt-scroll::-webkit-scrollbar-thumb  { background:var(--th-border-2);border-radius:99px }

        .mt-msg          { animation:mt-msg-in     0.22s cubic-bezier(0.22,1,0.36,1) both }
        .mt-send-spinner { width:12px;height:12px;border-radius:50%;border:1.5px solid transparent;border-top-color:currentColor;animation:mt-spin 0.7s linear infinite }
        .mt-typing-dot-1 { animation:mt-typing-dot 1.2s ease-in-out 0.0s infinite }
        .mt-typing-dot-2 { animation:mt-typing-dot 1.2s ease-in-out 0.2s infinite }
        .mt-typing-dot-3 { animation:mt-typing-dot 1.2s ease-in-out 0.4s infinite }
        .mt-reply-bar    { animation:mt-reply-in   0.18s ease both }
        .mt-edit-box     { animation:mt-edit-in    0.16s ease both }
        .mt-hint-bar     { animation:mt-hint-in    0.30s ease 0.2s both }

        .mt-bubble {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
          cursor: default;
        }
        .mt-bubble:active { opacity: 0.85; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: "'Figtree',system-ui,sans-serif" }}>
        <div style={{ height: 1, background: 'var(--th-border)', margin: '14px 0 12px', flexShrink: 0 }} />

        {/* Thread header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: showInteractionHint ? 8 : 10, flexShrink: 0 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: accentColor, boxShadow: `0 0 6px ${accentColor}`, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Syne',system-ui,sans-serif", color: 'var(--th-text-3)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Responses</span>
          {messages.length > 0 && (
            <span style={{ marginLeft: 'auto', color: 'var(--th-text-4)', fontSize: '0.60rem', fontWeight: 500 }}>
              {messages.length}
            </span>
          )}
          {editingId && (
            <span style={{ marginLeft: 'auto', color: accentColor, fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Editing
            </span>
          )}
        </div>

        {/* One-time interaction hint */}
        {showInteractionHint && (
          <div
            className="mt-hint-bar"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              gap:             8,
              marginBottom:    10,
              padding:        '7px 10px',
              borderRadius:    10,
              background:     `${accentColor}0a`,
              border:         `1px solid ${accentColor}1a`,
              flexShrink:      0,
            }}
          >
            <span style={{ fontFamily: "'Figtree',system-ui,sans-serif", color: 'var(--th-text-3)', fontSize: '0.62rem', lineHeight: 1.5 }}>
              Double-tap to reply · Hold your own message to edit
            </span>
            <button
              onClick={dismissHint}
              aria-label="Dismiss tip"
              style={{ background: 'none', border: 'none', color: 'var(--th-text-4)', cursor: 'pointer', fontSize: '0.80rem', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Message list */}
        <div
          ref={scrollRef}
          className="mt-scroll"
          style={{ overflowY: 'auto', maxHeight: 240, minHeight: 56, display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4, marginBottom: 10 }}
        >
          {messages.length === 0 && !isOtherTyping ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, color: 'var(--th-text-4)', fontSize: '0.72rem', fontStyle: 'italic', fontFamily: "'Figtree',system-ui,sans-serif" }}>
              Be the first to respond...
            </div>
          ) : (
            <>
              {messages.map(msg => {
                const isMe      = msg.player === mySlot
                const isEditing = editingId === msg.id

                const repliedMsg = msg.reply_to_message_id
                  ? messages.find(m => m.id === msg.reply_to_message_id) ?? null
                  : null

                return (
                  <div
                    key={msg.id}
                    className="mt-msg"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 3 }}
                  >
                    {/* Sender + timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      <span style={{ fontFamily: "'Syne',system-ui,sans-serif", color: isMe ? `${accentColor}99` : 'var(--th-text-3)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        {msg.player_name}
                      </span>
                      <span style={{ color: 'var(--th-text-4)', fontSize: '0.55rem', fontFamily: "'Figtree',system-ui,sans-serif" }}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>

                    {/* Bubble or inline editor */}
                    {isEditing ? (
                      <div className="mt-edit-box" style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <textarea
                          ref={editTextareaRef}
                          value={editDraft}
                          onChange={handleEditInput}
                          onKeyDown={handleEditKeyDown}
                          maxLength={500}
                          rows={2}
                          style={{ width: '100%', resize: 'none', borderRadius: 12, background: `${accentColor}10`, border: `1.5px solid ${accentColor}44`, color: 'var(--th-fg)', fontSize: '0.82rem', padding: '8px 12px', fontFamily: "'Figtree',system-ui,sans-serif", outline: 'none', lineHeight: 1.5, boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
                          onFocus={e => (e.target.style.borderColor = `${accentColor}88`)}
                          onBlur={e  => (e.target.style.borderColor = `${accentColor}44`)}
                        />
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={handleEditCancel} style={{ padding: '4px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--th-border)', color: 'var(--th-text-3)', fontSize: '0.70rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Figtree',system-ui,sans-serif" }}>
                            Cancel
                          </button>
                          <button
                            onClick={handleEditSave}
                            disabled={!editDraft.trim() || editSaving}
                            style={{ padding: '4px 14px', borderRadius: 8, background: editDraft.trim() ? `${accentColor}18` : 'transparent', border: `1px solid ${editDraft.trim() ? `${accentColor}44` : 'var(--th-border)'}`, color: editDraft.trim() ? accentColor : 'var(--th-text-4)', fontSize: '0.70rem', fontWeight: 600, cursor: editDraft.trim() && !editSaving ? 'pointer' : 'default', fontFamily: "'Figtree',system-ui,sans-serif", transition: 'all 0.15s ease' }}
                          >
                            {editSaving ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="mt-bubble"
                        style={{ maxWidth: '84%', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMe ? `${accentColor}14` : 'var(--th-surface)', border: isMe ? `1px solid ${accentColor}2a` : '1px solid var(--th-border)', overflow: 'hidden' }}
                        onDoubleClick={() => handleDoubleClick(msg)}
                        onMouseDown={() => startLongPress(msg)}
                        onMouseUp={cancelLongPress}
                        onMouseLeave={cancelLongPress}
                        onTouchStart={() => startLongPress(msg)}
                        onTouchEnd={cancelLongPress}
                        onTouchMove={cancelLongPress}
                      >
                        {repliedMsg && (
                          <div style={{ margin: '8px 10px 0', padding: '6px 10px', borderRadius: 8, background: isMe ? `${accentColor}10` : 'var(--th-surface-2)', borderLeft: `2.5px solid ${accentColor}66`, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontFamily: "'Syne',system-ui,sans-serif", color: accentColor, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em', opacity: 0.8 }}>
                              {repliedMsg.player_name}
                            </span>
                            <span style={{ fontFamily: "'Figtree',system-ui,sans-serif", color: 'var(--th-text-3)', fontSize: '0.72rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                              {repliedMsg.content}
                            </span>
                          </div>
                        )}

                        <div style={{ padding: repliedMsg ? '6px 12px 8px' : '8px 12px', color: isMe ? 'var(--th-fg)' : 'var(--th-text-2)', fontSize: '0.82rem', fontWeight: 400, lineHeight: 1.52, wordBreak: 'break-word', fontFamily: "'Figtree',system-ui,sans-serif" }}>
                          {msg.content}
                        </div>

                        {msg.edited_at && (
                          <div style={{ padding: '0 10px 8px', display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            <span style={{ fontFamily: "'Figtree',system-ui,sans-serif", fontSize: '0.52rem', fontWeight: 500, fontStyle: 'italic', color: isMe ? `${accentColor}88` : 'var(--th-text-3)', background: isMe ? `${accentColor}0d` : 'var(--th-surface-2)', border: `1px solid ${isMe ? `${accentColor}22` : 'var(--th-border)'}`, borderRadius: 99, padding: '1px 7px', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                              edited
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {isOtherTyping && (
                <div className="mt-msg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
                  <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: 'var(--th-surface)', border: '1px solid var(--th-border)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="mt-typing-dot-1" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--th-text-3)' }} />
                    <span className="mt-typing-dot-2" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--th-text-3)' }} />
                    <span className="mt-typing-dot-3" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--th-text-3)' }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reply bar */}
        {replyTo && (
          <div
            className="mt-reply-bar"
            style={{ marginBottom: 6, padding: '7px 10px', borderRadius: 10, background: `${accentColor}0c`, border: `1px solid ${accentColor}2a`, display: 'flex', alignItems: 'flex-start', gap: 8, flexShrink: 0 }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2, opacity: 0.7 }}>
              <path d="M2 4l4-3v2c3 0 6 2 6 6-1-2.5-3-3.5-6-3.5V8L2 4z" fill={accentColor} />
            </svg>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontFamily: "'Syne',system-ui,sans-serif", color: accentColor, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                Replying to {replyTo.player_name}
              </span>
              <span style={{ fontFamily: "'Figtree',system-ui,sans-serif", color: 'var(--th-text-3)', fontSize: '0.70rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {replyTo.content}
              </span>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--th-text-3)', cursor: 'pointer', padding: '0 2px', lineHeight: 1, fontSize: '0.9rem', flexShrink: 0 }} aria-label="Cancel reply">
              ×
            </button>
          </div>
        )}

        {/* Compose row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? `Reply to ${replyTo.player_name}...` : 'Type your response...'}
            maxLength={500}
            rows={1}
            style={{ flex: 1, resize: 'none', borderRadius: 12, background: 'var(--th-input-bg)', border: '1px solid var(--th-input-border)', color: 'var(--th-fg)', fontSize: '0.82rem', padding: '9px 12px', fontFamily: "'Figtree',system-ui,sans-serif", outline: 'none', lineHeight: 1.45, minHeight: 38, maxHeight: 96, overflowY: 'auto', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = 'var(--th-border-2)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--th-input-border)')}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 11, background: canSend ? `${accentColor}18` : 'var(--th-border)', border: canSend ? `1px solid ${accentColor}33` : '1px solid var(--th-border)', color: canSend ? accentColor : 'var(--th-text-4)', cursor: canSend ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease' }}
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

        {draft.length > 420 && (
          <div style={{ textAlign: 'right', color: draft.length > 480 ? '#ef4444' : 'var(--th-text-3)', fontSize: '0.58rem', marginTop: 4, fontFamily: "'Figtree',system-ui,sans-serif", transition: 'color 0.2s ease' }}>
            {500 - draft.length} left
          </div>
        )}
      </div>
    </>
  )
}