'use client'

import { useState, useEffect } from 'react'
import { Room13Mark, BrandWatermark } from './BrandWatermark'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

type JoinScreenProps = {
  onJoin:  (name: string) => void
  loading: boolean
}

export function JoinScreen({ onJoin, loading }: JoinScreenProps) {
  const [name, setName] = useState('')
  const { setTheme } = useTheme()

  // If the guest has never chosen a theme, give them the lemon default.
  // Warmer/lighter feel vs the host's dark void. Preserves any prior choice.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('abyss-theme')
      if (!stored) setTheme('lemon')
    } catch { /* private browsing — ignore */ }
  }, [setTheme])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes js-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes js-mark-pulse {
          0%, 100% { opacity: 0.65; }
          50%       { opacity: 1;   }
        }
        /* Same slow-shimmer as the host enter button */
        @keyframes js-shimmer {
          0%   { transform: translateX(-130%) skewX(-14deg); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateX(270%)  skewX(-14deg); opacity: 0; }
        }

        .js-root    { animation: js-in        0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .js-mark    { animation: js-mark-pulse 3s   ease-in-out infinite; }
        .js-shimmer { animation: js-shimmer   2.8s  ease-in-out infinite; }
      `}</style>

      {/* Fixed theme toggle */}
      <div style={{ position: 'fixed', top: 18, right: 20, zIndex: 9999 }}>
        <ThemeToggle />
      </div>

      <div
        className="js-root"
        style={{
          position: 'fixed', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px',
          background: 'var(--th-bg)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div className="js-mark" style={{ marginBottom: 20 }}>
          <Room13Mark size={44} opacity={1} />
        </div>

        <span style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: '0.72rem', fontWeight: 500,
          letterSpacing: '0.22em', color: 'var(--th-text-4)',
          textTransform: 'lowercase', marginBottom: 6,
        }}>
          room 13
        </span>

        <span style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: '0.52rem', fontWeight: 400,
          letterSpacing: '0.14em', color: 'var(--th-text-4)',
          textTransform: 'lowercase', marginBottom: 24, opacity: 0.6,
        }}>
          by abyss protocol
        </span>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: 'var(--th-text-1)', fontSize: '1.6rem', fontWeight: 600,
          textAlign: 'center', marginBottom: 8, lineHeight: 1.25,
        }}>
          You&apos;ve been invited
        </h1>

        <p style={{
          color: 'var(--th-text-3)', fontSize: '0.82rem',
          textAlign: 'center', marginBottom: 36, lineHeight: 1.6,
        }}>
          A game of questions.<br />Enter your name to begin.
        </p>

        <div style={{ width: '100%', maxWidth: 320 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onJoin(name.trim())}
            placeholder="Your name"
            maxLength={32}
            autoFocus
            style={{
              width: '100%', height: 52, borderRadius: 14,
              background: 'var(--th-input-bg)',
              border: '1px solid var(--th-input-border)',
              color: 'var(--th-fg)', fontSize: '0.95rem',
              padding: '0 16px', outline: 'none',
              boxSizing: 'border-box',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              marginBottom: 12,
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--th-border-2)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--th-input-border)')}
          />

          {/* Button — matches host enter button: shimmer, Cormorant italic */}
          <button
            disabled={!name.trim() || loading}
            onClick={() => name.trim() && onJoin(name.trim())}
            style={{
              position: 'relative',
              width: '100%', height: 52, borderRadius: 14,
              background: name.trim() ? 'var(--th-surface)' : 'var(--th-bg-alt)',
              border: name.trim() ? '1px solid var(--th-border-2)' : '1px solid var(--th-border)',
              color: name.trim() ? 'var(--th-text-1)' : 'var(--th-text-4)',
              fontSize: '1.05rem', fontWeight: 400, fontStyle: 'italic',
              letterSpacing: '0.04em',
              cursor: name.trim() && !loading ? 'pointer' : 'default',
              overflow: 'hidden',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              transition: 'all 0.2s ease',
            }}
          >
            {name.trim() && !loading && (
              <div className="js-shimmer" style={{
                position: 'absolute', top: 0, bottom: 0, width: '35%',
                background: 'linear-gradient(90deg, transparent, var(--th-border-2), transparent)',
                pointerEvents: 'none',
              }} />
            )}
            {loading ? 'entering room 13...' : 'join game'}
          </button>
        </div>

        <BrandWatermark />
      </div>
    </>
  )
}