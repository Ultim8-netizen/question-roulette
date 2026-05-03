'use client'

import { useState, useEffect, useRef } from 'react'

type FeedbackType = 'general' | 'bug' | 'idea' | 'question'

const TYPE_CONFIG: Record<FeedbackType, { label: string; emoji: string; placeholder: string }> = {
  general:  { label: 'General',  emoji: '💬', placeholder: 'Whatever is on your mind...' },
  bug:      { label: 'Bug',      emoji: '🐛', placeholder: 'What went wrong? What did you expect?' },
  idea:     { label: 'Idea',     emoji: '💡', placeholder: 'What would make this better?' },
  question: { label: 'Question', emoji: '🙋', placeholder: 'What would you like to know?' },
}

const ALL_TYPES = Object.keys(TYPE_CONFIG) as FeedbackType[]

type Phase = 'idle' | 'open' | 'sending' | 'done' | 'error'

export function FeedbackWidget() {
  const [phase,   setPhase]   = useState<Phase>('idle')
  const [type,    setType]    = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [pageUrl, setPageUrl] = useState('')

  const backdropRef  = useRef<HTMLDivElement>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const CHAR_LIMIT   = 1000

  // Capture URL at open time
  useEffect(() => {
    if (phase === 'open') {
      try { setPageUrl(window.location.href) } catch { /* ignore */ }
      setTimeout(() => textareaRef.current?.focus(), 80)
    }
  }, [phase])

  // Close on Escape
  useEffect(() => {
    if (phase !== 'open') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Prevent body scroll while open
  useEffect(() => {
    if (phase === 'open') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [phase])

  function handleClose() {
    setPhase('idle')
    setType('general')
    setMessage('')
    setContact('')
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const ta = e.target
    setMessage(ta.value)
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'
  }

  async function handleSubmit() {
    const trimmed = message.trim()
    if (!trimmed || phase === 'sending') return
    setPhase('sending')

    try {
      const res = await fetch('/api/feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: trimmed,
          contact: contact.trim() || null,
          pageUrl: pageUrl || null,
        }),
      })

      if (!res.ok) throw new Error('non-ok')
      setPhase('done')
      setTimeout(() => handleClose(), 2800)
    } catch {
      setPhase('error')
    }
  }

  const canSubmit = message.trim().length > 0 && phase === 'open'
  const charsLeft = CHAR_LIMIT - message.length
  const conf      = TYPE_CONFIG[type]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Figtree:wght@300;400;500;600&display=swap');

        @keyframes fw-btn-in    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fw-backdrop  { from{opacity:0} to{opacity:1} }
        @keyframes fw-sheet-in  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fw-done-in   { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes fw-spin      { to{transform:rotate(360deg)} }
        @keyframes fw-check-draw {
          from { stroke-dashoffset: 24; opacity: 0; }
          to   { stroke-dashoffset: 0;  opacity: 1; }
        }

        .fw-fab {
          animation: fw-btn-in 0.45s cubic-bezier(0.22,1,0.36,1) 0.6s both;
          position: fixed;
          bottom: max(24px, env(safe-area-inset-bottom, 24px));
          right: 20px;
          z-index: 500;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px;
          border-radius: 99px;
          border: 1px solid var(--th-border-2);
          background: var(--th-surface);
          color: var(--th-text-2);
          font-family: 'Figtree', system-ui, sans-serif;
          font-size: 0.76rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18), 0 1px 0 var(--th-border) inset;
          transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
          white-space: nowrap;
        }
        .fw-fab:hover {
          border-color: var(--th-border-2);
          background: var(--th-surface-2);
          color: var(--th-text-1);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.22), 0 1px 0 var(--th-border) inset;
        }
        .fw-fab:active { transform: translateY(0); }

        .fw-backdrop {
          animation: fw-backdrop 0.22s ease both;
          position: fixed;
          inset: 0;
          z-index: 600;
          background: var(--th-overlay);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0 16px max(24px, env(safe-area-inset-bottom, 24px)) 16px;
        }

        .fw-sheet {
          animation: fw-sheet-in 0.38s cubic-bezier(0.22,1.15,0.36,1) both;
          width: 100%;
          max-width: 440px;
          background: var(--th-surface);
          border: 1px solid var(--th-border-2);
          border-radius: 24px;
          padding: 24px 20px 20px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.22);
          font-family: 'Figtree', system-ui, sans-serif;
        }

        .fw-type-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 99px;
          border: 1px solid var(--th-border);
          background: transparent;
          color: var(--th-text-3);
          font-family: 'Figtree', system-ui, sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .fw-type-btn:hover {
          border-color: var(--th-border-2);
          color: var(--th-text-2);
        }
        .fw-type-btn.active {
          background: var(--th-surface-2);
          border-color: var(--th-border-2);
          color: var(--th-text-1);
        }

        .fw-textarea {
          width: 100%;
          resize: none;
          border-radius: 14px;
          background: var(--th-input-bg);
          border: 1px solid var(--th-input-border);
          color: var(--th-fg);
          font-size: 0.88rem;
          font-family: 'Figtree', system-ui, sans-serif;
          line-height: 1.6;
          padding: 12px 14px;
          outline: none;
          box-sizing: border-box;
          min-height: 96px;
          max-height: 180px;
          overflow-y: auto;
          transition: border-color 0.2s ease;
        }
        .fw-textarea:focus { border-color: var(--th-border-2); }
        .fw-textarea::placeholder { color: var(--th-text-4); }

        .fw-input {
          width: 100%;
          height: 42px;
          border-radius: 12px;
          background: var(--th-input-bg);
          border: 1px solid var(--th-input-border);
          color: var(--th-fg);
          font-size: 0.82rem;
          font-family: 'Figtree', system-ui, sans-serif;
          padding: 0 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }
        .fw-input:focus { border-color: var(--th-border-2); }
        .fw-input::placeholder { color: var(--th-text-4); }

        .fw-submit {
          width: 100%;
          height: 50px;
          border-radius: 14px;
          font-family: 'Figtree', system-ui, sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .fw-done { animation: fw-done-in 0.35s cubic-bezier(0.22,1.2,0.36,1) both; }
        .fw-spinner {
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: currentColor;
          animation: fw-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .fw-check {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: fw-check-draw 0.45s ease 0.1s forwards;
        }

        .fw-scroll::-webkit-scrollbar { width: 3px; }
        .fw-scroll::-webkit-scrollbar-track { background: transparent; }
        .fw-scroll::-webkit-scrollbar-thumb { background: var(--th-border-2); border-radius: 99px; }
      `}</style>

      {/* Floating pill button — hidden while sheet is open */}
      {(phase === 'idle' || phase === 'done') && (
        <button
          className="fw-fab"
          onClick={() => setPhase('open')}
          aria-label="Leave feedback"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 1.5C3.96 1.5 1.5 3.74 1.5 6.5c0 1.04.32 2 .87 2.8L1.5 12.5l3.4-1.1A5.4 5.4 0 0 0 7 11.5c3.04 0 5.5-2.24 5.5-5S10.04 1.5 7 1.5z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          Feedback
        </button>
      )}

      {/* Bottom-sheet modal */}
      {(phase === 'open' || phase === 'sending' || phase === 'error') && (
        <div
          ref={backdropRef}
          className="fw-backdrop"
          onClick={e => { if (e.target === backdropRef.current) handleClose() }}
        >
          <div className="fw-sheet">

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Syne',system-ui,sans-serif", color: 'var(--th-text-1)', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 2 }}>
                  Share your thoughts
                </div>
                <div style={{ fontFamily: "'Figtree',system-ui,sans-serif", color: 'var(--th-text-3)', fontSize: '0.72rem' }}>
                  Goes straight to the developer
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                style={{ background: 'none', border: '1px solid var(--th-border)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--th-text-3)', cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.15s ease, color 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--th-border-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--th-text-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--th-border)';  (e.currentTarget as HTMLButtonElement).style.color = 'var(--th-text-3)' }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Type selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {ALL_TYPES.map(t => (
                <button
                  key={t}
                  className={`fw-type-btn${type === t ? ' active' : ''}`}
                  onClick={() => setType(t)}
                  disabled={phase === 'sending'}
                >
                  <span>{TYPE_CONFIG[t].emoji}</span>
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>

            {/* Message */}
            <div style={{ marginBottom: 10 }}>
              <textarea
                ref={textareaRef}
                className="fw-textarea fw-scroll"
                value={message}
                onChange={handleTextareaInput}
                placeholder={conf.placeholder}
                maxLength={CHAR_LIMIT}
                disabled={phase === 'sending'}
              />
              {message.length > 800 && (
                <div style={{ textAlign: 'right', marginTop: 4, fontFamily: "'Figtree',system-ui,sans-serif", fontSize: '0.58rem', color: charsLeft < 50 ? '#ef4444' : 'var(--th-text-4)', transition: 'color 0.2s ease' }}>
                  {charsLeft} left
                </div>
              )}
            </div>

            {/* Optional contact */}
            <div style={{ marginBottom: 16 }}>
              <input
                className="fw-input"
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="Email or handle (optional — only if you want a reply)"
                maxLength={200}
                disabled={phase === 'sending'}
              />
            </div>

            {/* Error notice */}
            {phase === 'error' && (
              <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', color: '#f87171', fontFamily: "'Figtree',system-ui,sans-serif", fontSize: '0.76rem', lineHeight: 1.55 }}>
                Something went wrong — please try again.
                <button
                  onClick={() => setPhase('open')}
                  style={{ background: 'none', border: 'none', color: '#f87171', textDecoration: 'underline', cursor: 'pointer', fontFamily: "'Figtree',system-ui,sans-serif", fontSize: '0.76rem', padding: '0 0 0 6px' }}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              className="fw-submit"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                background:  canSubmit ? 'var(--th-surface-2)' : 'var(--th-bg-alt)',
                border:      canSubmit ? '1px solid var(--th-border-2)' : '1px solid var(--th-border)',
                color:       canSubmit ? 'var(--th-text-1)' : 'var(--th-text-4)',
                cursor:      canSubmit ? 'pointer' : 'default',
              }}
            >
              {phase === 'sending' ? (
                <><div className="fw-spinner" /> Sending...</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M13 1L1 5.5l4.5 2 2 4.5L13 1z" fill="currentColor" fillOpacity="0.85" strokeLinejoin="round"/>
                    <line x1="5.5" y1="7.5" x2="8.5" y2="4.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" strokeLinecap="round"/>
                  </svg>
                  Send feedback
                </>
              )}
            </button>

            {/* Footer note */}
            <p style={{ fontFamily: "'Figtree',system-ui,sans-serif", color: 'var(--th-text-4)', fontSize: '0.60rem', textAlign: 'center', marginTop: 12, marginBottom: 0, lineHeight: 1.6 }}>
              No account needed. Feedback is stored privately and only visible to the developer.
            </p>
          </div>
        </div>
      )}

      {/* Done state — brief confirmation replacing the sheet */}
      {phase === 'done' && (
        <div className="fw-backdrop" style={{ pointerEvents: 'none' }}>
          <div className="fw-sheet fw-done" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 180, textAlign: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="20" stroke="#4ade80" strokeWidth="1.5" opacity="0.35"/>
              <polyline
                className="fw-check"
                points="13,22 19,29 31,16"
                stroke="#4ade80"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <div>
              <div style={{ fontFamily: "'Syne',system-ui,sans-serif", color: 'var(--th-text-1)', fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>
                Thank you
              </div>
              <div style={{ fontFamily: "'Figtree',system-ui,sans-serif", color: 'var(--th-text-3)', fontSize: '0.78rem' }}>
                Your feedback has been received.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}