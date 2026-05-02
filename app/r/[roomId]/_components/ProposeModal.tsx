'use client'

import { useState } from 'react'
import type { QuestionTier } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Local tier config — keeps this component self-contained
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<QuestionTier, string> = {
  light: 'Light', medium: 'Medium', deep: 'Deep', spicy: 'Spicy',
}

const TIER_COLORS: Record<QuestionTier, string> = {
  light: '#4ade80', medium: '#60a5fa', deep: '#f87171', spicy: '#c084fc',
}

const ALL_TIERS: QuestionTier[] = ['light', 'medium', 'deep', 'spicy']

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ProposeModalProps = {
  onSubmit: (text: string, tier: QuestionTier) => void
  onCancel: () => void
  loading:  boolean
}

export function ProposeModal({ onSubmit, onCancel, loading }: ProposeModalProps) {
  const [text, setText] = useState('')
  const [tier, setTier] = useState<QuestionTier>('medium')

  const canSubmit = text.trim().length > 0 && !loading

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes pm2-in {
          from { opacity: 0; transform: translateY(32px);  }
          to   { opacity: 1; transform: translateY(0);     }
        }
        @keyframes pm2-bg {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .pm2-bg    {
          animation: pm2-bg 0.22s ease both;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .pm2-sheet { animation: pm2-in 0.38s cubic-bezier(0.22,1.2,0.36,1) both; }
      `}</style>

      <div
        className="pm2-bg"
        style={{
          position:       'fixed',
          inset:           0,
          zIndex:          50,
          display:        'flex',
          alignItems:     'flex-end',
          justifyContent: 'center',
          padding:        '0 16px 24px',
          background:     'var(--th-overlay)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      >
        <div className="pm2-sheet" style={{ width: '100%', maxWidth: 390 }}>
          <div
            style={{
              background:   'var(--th-surface)',
              border:       '1px solid var(--th-border-2)',
              borderRadius:  22,
              padding:      '24px 20px 20px',
              boxShadow:    '0 16px 48px rgba(0,0,0,0.18)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                marginBottom:    20,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color:      'var(--th-text-1)',
                  fontSize:   '1.1rem',
                  fontWeight:  600,
                }}
              >
                Propose a question
              </span>

              <button
                onClick={onCancel}
                style={{
                  background: 'none',
                  border:     'none',
                  color:      'var(--th-text-3)',
                  cursor:     'pointer',
                  padding:     4,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line x1="2"  y1="2"  x2="14" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <line x1="14" y1="2"  x2="2"  y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={280}
              placeholder="Write your question..."
              rows={3}
              style={{
                width:       '100%',
                resize:      'none',
                borderRadius: 12,
                background:  'var(--th-input-bg)',
                border:      '1px solid var(--th-input-border)',
                color:       'var(--th-fg)',
                fontSize:    '0.90rem',
                padding:     '12px 14px',
                fontFamily:  "'DM Sans', system-ui, sans-serif",
                outline:     'none',
                boxSizing:   'border-box',
                lineHeight:   1.55,
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--th-border-2)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--th-input-border)')}
            />

            <div
              style={{
                textAlign:    'right',
                color:        'var(--th-text-3)',
                fontSize:     '0.65rem',
                marginTop:     4,
                marginBottom:  16,
              }}
            >
              {text.length}/280
            </div>

            {/* Tier selector */}
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  color:         'var(--th-text-3)',
                  fontSize:      '0.65rem',
                  fontWeight:     600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  display:       'block',
                  marginBottom:   8,
                }}
              >
                Intensity
              </span>

              <div style={{ display: 'flex', gap: 8 }}>
                {ALL_TIERS.map(t => {
                  const active = tier === t
                  const color  = TIER_COLORS[t]
                  return (
                    <button
                      key={t}
                      onClick={() => setTier(t)}
                      style={{
                        flex:       1,
                        height:     34,
                        borderRadius: 10,
                        border:     active
                          ? `1.5px solid ${color}55`
                          : '1px solid var(--th-border)',
                        background: active ? `${color}12` : 'transparent',
                        color:      active ? color : 'var(--th-text-3)',
                        fontSize:   '0.68rem',
                        fontWeight:  600,
                        letterSpacing: '0.06em',
                        cursor:     'pointer',
                        transition: 'all 0.18s ease',
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                      }}
                    >
                      {TIER_LABELS[t]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              disabled={!canSubmit}
              onClick={() => canSubmit && onSubmit(text.trim(), tier)}
              style={{
                width:         '100%',
                height:         50,
                borderRadius:   14,
                background:    canSubmit ? 'var(--th-surface-2)' : 'var(--th-bg-alt)',
                border:        canSubmit ? '1px solid var(--th-border-2)' : '1px solid var(--th-border)',
                color:         canSubmit ? 'var(--th-text-1)' : 'var(--th-text-4)',
                fontSize:      '0.82rem',
                fontWeight:     500,
                letterSpacing: '0.04em',
                cursor:        canSubmit ? 'pointer' : 'default',
                transition:    'all 0.2s ease',
                fontFamily:    "'DM Sans', system-ui, sans-serif",
              }}
            >
              {loading ? 'Sending...' : 'Send to other player'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}