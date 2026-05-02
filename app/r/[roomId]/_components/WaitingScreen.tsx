'use client'

import { useState } from 'react'
import { Room13Mark, BrandWatermark } from './BrandWatermark'

const TIER_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#c084fc'] as const

type WaitingScreenProps = {
  shareUrl: string
}

export function WaitingScreen({ shareUrl }: WaitingScreenProps) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Tier dot pulse — each dot gets its own delay ── */
        @keyframes ws-dot-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1);    }
          50%       { opacity: 1;   transform: scale(1.30); }
        }

        @keyframes ws-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes ws-mark-pulse {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.9; }
        }

        .ws-root { animation: ws-in 0.4s ease both; }
        .ws-mark { animation: ws-mark-pulse 3s ease-in-out infinite; }

        .ws-dot-0 { animation: ws-dot-pulse 1.5s ease-in-out 0.0s infinite; }
        .ws-dot-1 { animation: ws-dot-pulse 1.5s ease-in-out 0.3s infinite; }
        .ws-dot-2 { animation: ws-dot-pulse 1.5s ease-in-out 0.6s infinite; }
        .ws-dot-3 { animation: ws-dot-pulse 1.5s ease-in-out 0.9s infinite; }
      `}</style>

      <div
        className="ws-root"
        style={{
          position: 'fixed', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px',
          background: 'var(--th-bg)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div className="ws-mark" style={{ marginBottom: 16 }}>
          <Room13Mark size={36} opacity={1} />
        </div>

        <span style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: '0.70rem', fontWeight: 500,
          letterSpacing: '0.22em', color: 'var(--th-text-4)',
          textTransform: 'lowercase', marginBottom: 28,
        }}>
          room 13
        </span>

        {/* Four tier-colored dots */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          {TIER_COLORS.map((color, i) => (
            <div
              key={color}
              className={`ws-dot-${i}`}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}99`,
              }}
            />
          ))}
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: 'var(--th-text-1)', fontSize: '1.55rem', fontWeight: 600,
          textAlign: 'center', marginBottom: 8,
        }}>
          Waiting for them
        </h1>

        <p style={{
          color: 'var(--th-text-3)', fontSize: '0.82rem',
          textAlign: 'center', marginBottom: 36, lineHeight: 1.6,
        }}>
          Share the link below.<br />The game starts once they join.
        </p>

        {/* Copy pill */}
        <button
          onClick={copy}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--th-surface)', border: '1px solid var(--th-border)',
            borderRadius: 99, padding: '11px 18px',
            cursor: 'pointer', transition: 'border-color 0.2s ease',
            maxWidth: 320, width: '100%',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--th-border-2)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--th-border)')}
        >
          <span style={{
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: 'var(--th-text-3)', fontSize: '0.72rem', textAlign: 'left',
          }}>
            {shareUrl}
          </span>
          <span style={{
            color: copied ? '#4ade80' : 'var(--th-text-2)',
            fontSize: '0.70rem', fontWeight: 600, letterSpacing: '0.08em',
            flexShrink: 0, transition: 'color 0.2s ease',
          }}>
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>

        <BrandWatermark />
      </div>
    </>
  )
}