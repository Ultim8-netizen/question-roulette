'use client'

import Link from 'next/link'
import type { PendingQuestion, PlayerSlot } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Tier colour map — local, avoids importing tierConfig (which needs isDark)
// ---------------------------------------------------------------------------

const TIER_COLORS: Record<string, string> = {
  light:  '#4ade80',
  medium: '#60a5fa',
  deep:   '#f87171',
  spicy:  '#c084fc',
}

const TIER_LABELS: Record<string, string> = {
  light: 'Light', medium: 'Medium', deep: 'Deep', spicy: 'Spicy',
}

// ---------------------------------------------------------------------------
// ConsentBanner
// ---------------------------------------------------------------------------

type ConsentBannerProps = {
  proposal:  PendingQuestion
  onAccept:  () => void
  onDecline: () => void
  loading:   boolean
}

export function ConsentBanner({
  proposal,
  onAccept,
  onDecline,
  loading,
}: ConsentBannerProps) {
  const color = TIER_COLORS[proposal.tier]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes cb-in {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        .cb-root {
          animation: cb-in 0.32s cubic-bezier(0.22,1,0.36,1) both;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
      `}</style>

      <div
        className="cb-root"
        style={{
          margin:       '12px 16px 0',
          borderRadius:  18,
          overflow:     'hidden',
          background:   'var(--th-surface)',
          border:       `1px solid ${color}22`,
          boxShadow:    `0 4px 24px ${color}0e`,
          padding:      '16px 18px',
        }}
      >
        {/* Label row */}
        <div
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:          8,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width:        7,
              height:       7,
              borderRadius: '50%',
              background:    color,
              boxShadow:    `0 0 8px ${color}`,
            }}
          />
          <span
            style={{
              color:         'var(--th-text-3)',
              fontSize:      '0.68rem',
              fontWeight:     600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Question proposal
          </span>
          <span
            style={{
              marginLeft:    'auto',
              color,
              fontSize:      '0.68rem',
              fontWeight:     600,
              letterSpacing: '0.06em',
            }}
          >
            {TIER_LABELS[proposal.tier]}
          </span>
        </div>

        {/* Question text */}
        <p
          style={{
            fontFamily:   "'Cormorant Garamond', serif",
            color:        'var(--th-text-1)',
            fontSize:     '0.92rem',
            fontWeight:    500,
            lineHeight:    1.55,
            marginBottom:  14,
          }}
        >
          &ldquo;{proposal.text}&rdquo;
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onDecline}
            disabled={loading}
            style={{
              flex:          1,
              height:         40,
              borderRadius:   11,
              background:    'transparent',
              border:        '1px solid var(--th-border)',
              color:         'var(--th-text-3)',
              fontSize:      '0.78rem',
              fontWeight:     500,
              cursor:        'pointer',
              transition:    'all 0.18s ease',
              fontFamily:    "'DM Sans', system-ui, sans-serif",
            }}
          >
            Decline
          </button>

          <button
            onClick={onAccept}
            disabled={loading}
            style={{
              flex:          2,
              height:         40,
              borderRadius:   11,
              background:    `linear-gradient(135deg, ${color}18, ${color}0c)`,
              border:        `1px solid ${color}33`,
              color,
              fontSize:      '0.78rem',
              fontWeight:     600,
              cursor:        'pointer',
              transition:    'all 0.18s ease',
              fontFamily:    "'DM Sans', system-ui, sans-serif",
            }}
          >
            {loading ? 'Adding...' : 'Accept'}
          </button>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// PendingNotice — shown to the proposer while they wait for a response
// ---------------------------------------------------------------------------

export function PendingNotice() {
  return (
    <div
      style={{
        margin:      '12px 16px 0',
        padding:     '10px 16px',
        borderRadius: 12,
        background:  'var(--th-surface)',
        border:      '1px solid var(--th-border)',
        fontFamily:  "'DM Sans', system-ui, sans-serif",
        color:       'var(--th-text-3)',
        fontSize:    '0.72rem',
        display:     'flex',
        alignItems:  'center',
        gap:          8,
      }}
    >
      <div
        style={{
          width:        5,
          height:       5,
          borderRadius: '50%',
          background:   '#fbbf24',
          boxShadow:    '0 0 6px #fbbf24',
          flexShrink:   0,
        }}
      />
      Waiting for them to accept your question...
    </div>
  )
}

// ---------------------------------------------------------------------------
// PlayerHeader — nameplate row: P1 avatar · VS · guide icon · P2 avatar
// ---------------------------------------------------------------------------

type PlayerHeaderProps = {
  p1Name:  string
  p2Name:  string
  mySlot:  PlayerSlot
}

export function PlayerHeader({ p1Name, p2Name, mySlot }: PlayerHeaderProps) {
  return (
    <>
      <style>{`
        .guide-btn {
          display:         flex;
          align-items:     center;
          justify-content: center;
          width:           28px;
          height:          28px;
          border-radius:   50%;
          border:          1px solid var(--th-border);
          background:      transparent;
          color:           var(--th-text-3);
          text-decoration: none;
          transition:      border-color 0.2s ease, color 0.2s ease;
          flex-shrink:     0;
        }
        .guide-btn:hover {
          border-color: var(--th-border-2);
          color:        var(--th-text-2);
        }
      `}</style>

      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '18px 20px 0',
          fontFamily:     "'DM Sans', system-ui, sans-serif",
          gap:             8,
        }}
      >
        {/* Player 1 */}
        <PlayerChip name={p1Name} isMe={mySlot === 1} align="left" />

        {/* Centre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span
            style={{
              color:         'var(--th-text-4)',
              fontSize:      '0.65rem',
              fontWeight:     600,
              letterSpacing: '0.12em',
            }}
          >
            VS
          </span>
          <Link
            href="/how-to-play"
            target="_blank"
            rel="noopener noreferrer"
            className="guide-btn"
            aria-label="How to play"
            title="How to play"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1" />
              <path
                d="M5.5 5.5C5.5 4.67 6.17 4 7 4s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5"
                stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"
              />
              <circle cx="7" cy="9.5" r="0.6" fill="currentColor" />
            </svg>
          </Link>
        </div>

        {/* Player 2 */}
        <PlayerChip name={p2Name} isMe={mySlot === 2} align="right" />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// PlayerChip — avatar circle + name, used inside PlayerHeader
// ---------------------------------------------------------------------------

function PlayerChip({
  name,
  isMe,
  align,
}: {
  name:  string
  isMe:  boolean
  align: 'left' | 'right'
}) {
  const reversed = align === 'right'

  return (
    <div
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:            8,
        flex:           1,
        minWidth:       0,
        flexDirection:  reversed ? 'row-reverse' : 'row',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width:          28,
          height:         28,
          borderRadius:  '50%',
          background:    'var(--th-surface-2)',
          border:        '1px solid var(--th-border)',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          color:         'var(--th-text-2)',
          fontSize:      '0.6rem',
          fontWeight:     700,
          letterSpacing: '0.05em',
          flexShrink:     0,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <span
        style={{
          color:        isMe ? 'var(--th-text-1)' : 'var(--th-text-3)',
          fontSize:     '0.82rem',
          fontWeight:    400,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}
      >
        {name}
        {isMe && (
          <span
            style={{
              color:       'var(--th-text-4)',
              fontSize:    '0.65rem',
              marginLeft:   6,
              marginRight:  reversed ? 0 : undefined,
            }}
          >
            you
          </span>
        )}
      </span>
    </div>
  )
}