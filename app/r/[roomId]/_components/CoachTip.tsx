'use client'

// ---------------------------------------------------------------------------
// CoachTip — ambient micro-coaching banner shown before the first card draw.
//
// Addresses the two documented confusion points:
//   1. "Does the card appear on both screens?" → yes, stated explicitly
//   2. "Who is supposed to answer?" → both players, stated explicitly
//
// References the existing ? button in PlayerHeader for deeper guidance.
// Unmounts naturally when cards.length > 0 — never a gate, never blocking.
// ---------------------------------------------------------------------------

type CoachTipProps = {
  /** True when it is this client's turn to draw. */
  isMyTurn:   boolean
  /** Display name of whoever's turn it currently is. */
  drawerName: string
}

export function CoachTip({ isMyTurn, drawerName }: CoachTipProps) {
  const accentColor = isMyTurn ? '#4ade80' : '#60a5fa'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Figtree:wght@300;400;500;600&display=swap');

        @keyframes ct-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* Delay so it doesn't fight the TurnBanner entrance animation */
        .ct-root {
          animation: ct-in 0.40s cubic-bezier(0.22,1,0.36,1) 0.55s both;
          font-family: 'Figtree', system-ui, sans-serif;
        }

        .ct-q-badge {
          display:         inline-flex;
          align-items:     center;
          justify-content: center;
          width:            15px;
          height:           15px;
          border-radius:   50%;
          border:          1px solid var(--th-border-2);
          color:           var(--th-text-2);
          font-family:     'Syne', system-ui, sans-serif;
          font-size:       0.54rem;
          font-weight:     700;
          flex-shrink:     0;
          vertical-align:  middle;
          margin:          0 1px;
          line-height:     1;
          position:        relative;
          top:             -1px;
        }
      `}</style>

      <div
        className="ct-root"
        role="status"
        aria-live="polite"
        style={{
          margin:        '10px 16px 0',
          padding:       '11px 15px',
          borderRadius:   14,
          background:    'var(--th-surface)',
          border:        `1px solid ${accentColor}22`,
          display:       'flex',
          alignItems:    'flex-start',
          gap:            10,
        }}
      >
        {/* Tier-coloured status dot */}
        <div style={{
          width:       6,
          height:      6,
          borderRadius:'50%',
          background:   accentColor,
          boxShadow:   `0 0 7px ${accentColor}`,
          flexShrink:   0,
          marginTop:    5,
        }} />

        <p style={{
          color:      'var(--th-text-2)',
          fontSize:   '0.76rem',
          lineHeight:  1.65,
          margin:      0,
        }}>
          {isMyTurn ? (
            <>
              Draw a card — the question appears on{' '}
              <strong style={{ color: 'var(--th-text-1)', fontWeight: 600 }}>
                both screens
              </strong>{' '}
              and you{' '}
              <strong style={{ color: 'var(--th-text-1)', fontWeight: 600 }}>
                both respond
              </strong>{' '}
              in the thread below it.
            </>
          ) : (
            <>
              <strong style={{ color: 'var(--th-text-1)', fontWeight: 600 }}>
                {drawerName}
              </strong>{' '}
              draws first — the card will appear on{' '}
              <strong style={{ color: 'var(--th-text-1)', fontWeight: 600 }}>
                your screen too
              </strong>
              , tap it to read and respond together.
            </>
          )}
          {' '}
          <span style={{ color: 'var(--th-text-3)', fontSize: '0.70rem' }}>
            Tap the <span className="ct-q-badge" aria-label="help">?</span> above for the full guide.
          </span>
        </p>
      </div>
    </>
  )
}