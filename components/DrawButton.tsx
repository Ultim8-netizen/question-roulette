'use client'

import { useState } from 'react'

type DrawButtonProps = {
  isMyTurn:   boolean
  isLoading:  boolean
  canPropose: boolean
  onDraw:     () => void
  onPropose:  () => void
}

export function DrawButton({
  isMyTurn,
  isLoading,
  canPropose,
  onDraw,
  onPropose,
}: DrawButtonProps) {
  const [pressed, setPressed] = useState(false)

  function handlePress() {
    if (!isMyTurn || isLoading) return
    setPressed(true)
    onDraw()
    setTimeout(() => setPressed(false), 320)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes db-pulse-ring {
          0%   { transform: scale(0.92); opacity: 0.55; }
          70%  { transform: scale(1.10); opacity: 0;    }
          100% { transform: scale(1.10); opacity: 0;    }
        }
        @keyframes db-breathe {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0),        0 8px 40px rgba(0,0,0,0.30); }
          50%       { box-shadow: 0 0 28px 4px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.30); }
        }
        @keyframes db-sweep {
          0%   { transform: translateX(-140%) skewX(-16deg); }
          100% { transform: translateX(280%)  skewX(-16deg); }
        }
        @keyframes db-fan-1 {
          0%, 100% { transform: rotate(-6deg) translateY(0);    }
          50%       { transform: rotate(-9deg) translateY(-1px); }
        }
        @keyframes db-fan-2 {
          0%, 100% { transform: rotate(0deg)  translateY(0);    }
          50%       { transform: rotate(0deg)  translateY(-2px); }
        }
        @keyframes db-fan-3 {
          0%, 100% { transform: rotate(6deg)  translateY(0);    }
          50%       { transform: rotate(9deg)  translateY(-1px); }
        }
        @keyframes db-link-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        .db-pulse-ring { animation: db-pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .db-breathe    { animation: db-breathe    3.0s ease-in-out infinite; }
        .db-sweep      { animation: db-sweep      1.0s ease-in-out infinite; }
        .db-fan-1      { animation: db-fan-1      2.4s ease-in-out 0.0s infinite; }
        .db-fan-2      { animation: db-fan-2      2.4s ease-in-out 0.1s infinite; }
        .db-fan-3      { animation: db-fan-3      2.4s ease-in-out 0.2s infinite; }
        .db-link-in    { animation: db-link-in    0.35s ease both; }

        .db-font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .db-font-sans  { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>

      <div
        className="db-font-sans fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center"
        style={{
          padding: '12px 20px max(20px, env(safe-area-inset-bottom)) 20px',
          background: 'linear-gradient(to top, var(--th-bg) 55%, transparent)',
          pointerEvents: 'none',
        }}
      >
        {/* "Add a question" ghost link */}
        {isMyTurn && canPropose && !isLoading && (
          <button
            className="db-link-in db-font-sans mb-3"
            style={{
              pointerEvents: 'auto',
              background: 'none',
              border: 'none',
              padding: '6px 14px',
              cursor: 'pointer',
              color: 'var(--th-text-3)',
              fontSize: '0.72rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--th-text-2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--th-text-3)')}
            onClick={onPropose}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6.2" stroke="currentColor" strokeWidth="1.1" />
              <line x1="7" y1="4" x2="7" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Add a question
          </button>
        )}

        {/* Main draw button */}
        <div className="relative w-full" style={{ maxWidth: 390, pointerEvents: 'auto' }}>

          {/* Pulse ring */}
          {isMyTurn && !isLoading && (
            <div
              className="db-pulse-ring absolute inset-0 rounded-[20px] pointer-events-none"
              style={{ border: '1.5px solid var(--th-border-2)' }}
            />
          )}

          <button
            className={isMyTurn && !isLoading ? 'db-breathe' : ''}
            disabled={!isMyTurn || isLoading}
            onClick={handlePress}
            style={{
              width: '100%',
              height: 64,
              borderRadius: 20,
              border: isMyTurn
                ? '1.5px solid var(--th-border-2)'
                : '1.5px solid var(--th-border)',
              background: isMyTurn
                ? pressed
                  ? 'var(--th-surface-2)'
                  : 'var(--th-surface)'
                : 'var(--th-bg-alt)',
              cursor: isMyTurn && !isLoading ? 'pointer' : 'default',
              transform: pressed ? 'scale(0.975)' : 'scale(1)',
              transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.4s ease, border-color 0.4s ease',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
            }}
          >
            {/* Loading shimmer sweep */}
            {isLoading && (
              <div
                className="db-sweep absolute pointer-events-none"
                style={{
                  top: 0, bottom: 0,
                  width: '40%',
                  background: 'linear-gradient(90deg, transparent, var(--th-border-2), transparent)',
                }}
              />
            )}

            {/* Animated card-fan icon */}
            <div className="relative shrink-0" style={{ width: 30, height: 28 }}>
              {/* Back card */}
              <div
                className={isMyTurn && !isLoading ? 'db-fan-1' : ''}
                style={{
                  position: 'absolute', bottom: 0, left: 0,
                  width: 20, height: 26, borderRadius: 5,
                  background: isMyTurn ? 'var(--th-surface-2)' : 'var(--th-bg-alt)',
                  border: `1px solid var(--th-border)`,
                  transformOrigin: 'bottom center',
                  transform: 'rotate(-6deg)',
                  transition: 'background 0.4s ease',
                }}
              />
              {/* Mid card */}
              <div
                className={isMyTurn && !isLoading ? 'db-fan-2' : ''}
                style={{
                  position: 'absolute', bottom: 0, left: 5,
                  width: 20, height: 26, borderRadius: 5,
                  background: isMyTurn ? 'var(--th-surface)' : 'var(--th-bg-alt)',
                  border: `1px solid var(--th-border)`,
                  transformOrigin: 'bottom center',
                  transform: 'rotate(0deg)',
                  transition: 'background 0.4s ease',
                }}
              />
              {/* Front card */}
              <div
                className={isMyTurn && !isLoading ? 'db-fan-3' : ''}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 20, height: 26, borderRadius: 5,
                  background: isMyTurn ? 'var(--th-surface-2)' : 'var(--th-bg-alt)',
                  border: `1px solid var(--th-border-2)`,
                  transformOrigin: 'bottom center',
                  transform: 'rotate(6deg)',
                  transition: 'background 0.4s ease',
                }}
              />
            </div>

            {/* Label */}
            <div className="flex flex-col items-start" style={{ gap: 1 }}>
              <span
                className="db-font-serif"
                style={{
                  color: isMyTurn ? 'var(--th-text-1)' : 'var(--th-text-4)',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                  transition: 'color 0.4s ease',
                }}
              >
                {isLoading ? 'Drawing...' : 'Draw'}
              </span>
              <span
                className="db-font-sans"
                style={{
                  color: isMyTurn ? 'var(--th-text-3)' : 'var(--th-text-4)',
                  fontSize: '0.62rem',
                  fontWeight: 400,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  transition: 'color 0.4s ease',
                }}
              >
                {isLoading ? 'Fetching your card' : 'Random card'}
              </span>
            </div>

          </button>
        </div>
      </div>
    </>
  )
}