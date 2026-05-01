// app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import HowToPlayPage from '@/app/how-to-play/page'

const TIER_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#c084fc']
const HTP_SEEN_KEY = 'abyss-htp-seen'

// ---------------------------------------------------------------------------
// Lazy initializer — runs once on the client at first render.
// ---------------------------------------------------------------------------

function readHtpSeen(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return !localStorage.getItem(HTP_SEEN_KEY)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Room 13 logo mark — wheel + card fan motif, theme-aware.
// Replaces the old AbyssSignil everywhere on this page.
// ---------------------------------------------------------------------------

function Room13Mark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* wheel */}
      <circle cx="16" cy="20" r="10" fill="var(--th-surface)" stroke="var(--th-brand)" strokeWidth="1.1"/>
      <circle cx="16" cy="20" r="7.5" fill="none" stroke="var(--th-brand)" strokeWidth="0.4" opacity="0.35"/>
      {/* spokes (bottom half visible below card) */}
      <g stroke="var(--th-brand)" strokeWidth="0.65" strokeLinecap="round" opacity="0.55">
        <line x1="21.3" y1="14.7" x2="23.1" y2="12.9"/>
        <line x1="23.5" y1="20" x2="26" y2="20"/>
        <line x1="21.3" y1="25.3" x2="23.1" y2="27.1"/>
        <line x1="16" y1="27.5" x2="16" y2="30"/>
        <line x1="10.7" y1="25.3" x2="8.9" y2="27.1"/>
        <line x1="8.5" y1="20" x2="6" y2="20"/>
        <line x1="10.7" y1="14.7" x2="8.9" y2="12.9"/>
      </g>
      {/* hub */}
      <circle cx="16" cy="20" r="1.8" fill="var(--th-brand)"/>
      {/* center card on top */}
      <rect x="11" y="5" width="10" height="14" rx="1.8" fill="var(--th-surface)" stroke="var(--th-brand)" strokeWidth="1.2"/>
      <line x1="13.5" y1="9"    x2="18.5" y2="9"    stroke="var(--th-brand)" strokeWidth="0.9" strokeLinecap="round" opacity="0.60"/>
      <line x1="13.5" y1="11.5" x2="18.5" y2="11.5" stroke="var(--th-brand)" strokeWidth="0.9" strokeLinecap="round" opacity="0.38"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Small brand mark for watermarks
// ---------------------------------------------------------------------------

function Room13MarkSmall({ size = 10, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ opacity, flexShrink: 0 }}>
      <circle cx="16" cy="20" r="10" fill="var(--th-surface)" stroke="var(--th-brand)" strokeWidth="1.1"/>
      <circle cx="16" cy="20" r="1.8" fill="var(--th-brand)"/>
      <rect x="11" y="5" width="10" height="14" rx="1.8" fill="var(--th-surface)" stroke="var(--th-brand)" strokeWidth="1.2"/>
    </svg>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const [showHtp, setShowHtp] = useState<boolean>(readHtpSeen)

  function dismissHtp() {
    try { localStorage.setItem(HTP_SEEN_KEY, '1') } catch { /* ignore */ }
    setShowHtp(false)
  }

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player1_name: trimmed }),
    })
    if (!res.ok) {
      setLoading(false)
      setError('Could not create room. Try again.')
      return
    }
    const { roomId } = await res.json()
    sessionStorage.setItem(`f9q-slot-${roomId}`, '1')
    router.push(`/r/${roomId}`)
  }

  return (
    <>
      <style>{`
        @keyframes hp-orb-1 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.45} 50%{transform:translate(18px,-12px) scale(1.06);opacity:0.60} }
        @keyframes hp-orb-2 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.35} 50%{transform:translate(-14px,16px) scale(1.04);opacity:0.50} }
        @keyframes hp-orb-3 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.30} 50%{transform:translate(10px,12px) scale(1.05);opacity:0.45} }
        @keyframes hp-orb-4 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.28} 50%{transform:translate(-8px,-14px) scale(1.03);opacity:0.40} }
        @keyframes hp-mark-pulse{ 0%,100%{opacity:0.75} 50%{opacity:1} }
        @keyframes hp-wordmark-in{ from{opacity:0;transform:translateY(10px);letter-spacing:0.30em} to{opacity:1;transform:translateY(0);letter-spacing:0.22em} }
        @keyframes hp-sub-in  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes hp-form-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hp-mark-in { from{opacity:0;transform:translateY(-10px) scale(0.92)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes hp-divider-in{ from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes hp-btn-shimmer{ 0%{transform:translateX(-120%) skewX(-14deg);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateX(260%) skewX(-14deg);opacity:0} }
        @keyframes hp-tier-dot{ 0%,100%{opacity:0.35;transform:scale(1)} 50%{opacity:0.75;transform:scale(1.2)} }
        @keyframes hp-guide-in{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .hp-orb-1{animation:hp-orb-1 9s  ease-in-out infinite}
        .hp-orb-2{animation:hp-orb-2 11s ease-in-out infinite}
        .hp-orb-3{animation:hp-orb-3 10s ease-in-out infinite}
        .hp-orb-4{animation:hp-orb-4 12s ease-in-out infinite}
        .hp-mark-in    {animation:hp-mark-in     0.50s cubic-bezier(0.22,1,0.36,1) 0.08s both}
        .hp-mark-pulse {animation:hp-mark-pulse  3.5s  ease-in-out 0.6s infinite}
        .hp-wordmark-in{animation:hp-wordmark-in 0.65s cubic-bezier(0.22,1,0.36,1) 0.18s both}
        .hp-sub-in     {animation:hp-sub-in      0.50s cubic-bezier(0.22,1,0.36,1) 0.32s both}
        .hp-form-in    {animation:hp-form-in     0.50s cubic-bezier(0.22,1,0.36,1) 0.44s both}
        .hp-divider-in {animation:hp-divider-in  0.60s cubic-bezier(0.22,1,0.36,1) 0.14s both;transform-origin:center}
        .hp-btn-shimmer{animation:hp-btn-shimmer 1.6s  ease-in-out 0.2s both}
        .hp-guide-in   {animation:hp-guide-in    0.50s cubic-bezier(0.22,1,0.36,1) 0.58s both}
        .hp-tier-dot-0{animation:hp-tier-dot 3s ease-in-out 0.0s infinite}
        .hp-tier-dot-1{animation:hp-tier-dot 3s ease-in-out 0.4s infinite}
        .hp-tier-dot-2{animation:hp-tier-dot 3s ease-in-out 0.8s infinite}
        .hp-tier-dot-3{animation:hp-tier-dot 3s ease-in-out 1.2s infinite}
        .hp-guide-link{
          color:var(--th-text-4);text-decoration:none;
          font-family:var(--font-brand-sans);
          font-size:0.70rem;font-weight:400;letter-spacing:0.04em;
          display:inline-flex;align-items:center;gap:5px;
          transition:color 0.2s ease;
        }
        .hp-guide-link:hover{color:var(--th-text-3)}
      `}</style>

      {/* How-to-play overlay — first visit only */}
      {showHtp && <HowToPlayPage onClose={dismissHtp} />}

      <div style={{
        minHeight: '100dvh', background: 'var(--th-bg)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: 'var(--font-brand-sans)',
      }}>

        {/* Theme toggle */}
        <div style={{ position: 'absolute', top: 18, right: 20, zIndex: 10 }}>
          <ThemeToggle />
        </div>

        {/* Ambient orbs */}
        {[
          { cls: 'hp-orb-1', t: '-12%', l: '-10%', c: TIER_COLORS[0], op: '18' },
          { cls: 'hp-orb-2', t: '-8%',  r: '-12%', c: TIER_COLORS[1], op: '14' },
          { cls: 'hp-orb-3', b: '-10%', l: '-8%',  c: TIER_COLORS[2], op: '12' },
          { cls: 'hp-orb-4', b: '-8%',  r: '-10%', c: TIER_COLORS[3], op: '10' },
        ].map(({ cls, t, l, r, b, c, op }, i) => (
          <div key={i} className={cls} style={{
            position: 'absolute', top: t, left: l, right: r, bottom: b,
            width: '52vw', height: '52vw', maxWidth: 310, maxHeight: 310,
            borderRadius: '50%',
            background: `radial-gradient(circle,${c}${op} 0%,transparent 70%)`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Grain overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px', opacity: 0.5,
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 360,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>

          {/* Logo mark */}
          <div className="hp-mark-in hp-mark-pulse" style={{ marginBottom: 24 }}>
            <Room13Mark size={52} />
          </div>

          {/* Wordmark: "room 13" */}
          <h1 className="hp-wordmark-in" style={{
            fontFamily: 'var(--font-brand-mono)',
            color: 'var(--th-brand)', fontSize: '1.10rem', fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'lowercase',
            margin: '0 0 4px', textAlign: 'center',
          }}>
            room 13
          </h1>

          {/* Creator attribution */}
          <div className="hp-sub-in" style={{
            fontFamily: 'var(--font-brand-mono)',
            color: 'var(--th-text-4)', fontSize: '0.56rem', fontWeight: 400,
            letterSpacing: '0.18em', textTransform: 'lowercase',
            marginBottom: 14, textAlign: 'center',
          }}>
            by abyss protocol
          </div>

          <div className="hp-divider-in" style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          }}>
            <div style={{ height: '1px', width: 32, background: 'linear-gradient(to right,transparent,var(--th-border-2))' }} />
            <div style={{ display: 'flex', gap: 5 }}>
              {TIER_COLORS.map((c, i) => (
                <div key={c} className={`hp-tier-dot-${i}`} style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: c, boxShadow: `0 0 5px ${c}`,
                }} />
              ))}
            </div>
            <div style={{ height: '1px', width: 32, background: 'linear-gradient(to left,transparent,var(--th-border-2))' }} />
          </div>

          <p className="hp-sub-in" style={{
            fontFamily: 'var(--font-brand-serif)',
            color: 'var(--th-text-2)', fontSize: '1.25rem',
            fontWeight: 400, fontStyle: 'italic',
            textAlign: 'center', lineHeight: 1.5, marginBottom: 8,
          }}>
            Every card a different world
          </p>

          <p className="hp-sub-in" style={{
            fontFamily: 'var(--font-brand-sans)',
            color: 'var(--th-text-4)', fontSize: '0.78rem', fontWeight: 300,
            textAlign: 'center', lineHeight: 1.7, marginBottom: 40, maxWidth: 260,
          }}>
            A two-player game of blind draws.<br />
            Light surface. Dark depths. No map.
          </p>

          {/* Form */}
          <div className="hp-form-in" style={{ width: '100%' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Your name"
                maxLength={32}
                autoFocus={!showHtp}
                style={{
                  width: '100%', height: 54, borderRadius: 16,
                  background: 'var(--th-input-bg)',
                  border: '1px solid var(--th-input-border)',
                  color: 'var(--th-fg)',
                  fontSize: '0.95rem', fontWeight: 400,
                  padding: '0 18px', outline: 'none',
                  fontFamily: 'var(--font-brand-sans)',
                  transition: 'border-color 0.2s ease',
                  letterSpacing: '0.01em', boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--th-border-2)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--th-input-border)')}
              />
            </div>

            {error && (
              <p style={{
                color: '#ef4444', fontSize: '0.75rem',
                textAlign: 'center', marginBottom: 10,
                fontFamily: 'var(--font-brand-sans)',
              }}>
                {error}
              </p>
            )}

            <button
              disabled={!name.trim() || loading}
              onClick={handleCreate}
              style={{
                position: 'relative', width: '100%', height: 54, borderRadius: 16,
                background: name.trim() ? 'var(--th-surface)' : 'var(--th-bg-alt)',
                border: name.trim() ? '1px solid var(--th-border-2)' : '1px solid var(--th-border)',
                color: name.trim() ? 'var(--th-text-1)' : 'var(--th-text-4)',
                fontSize: '0.88rem', fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'lowercase',
                cursor: name.trim() && !loading ? 'pointer' : 'default',
                overflow: 'hidden', transition: 'all 0.25s ease',
                fontFamily: 'var(--font-brand-sans)',
              }}
            >
              {name.trim() && !loading && (
                <div className="hp-btn-shimmer" style={{
                  position: 'absolute', top: 0, bottom: 0, width: '35%',
                  background: 'linear-gradient(90deg,transparent,var(--th-border-2),transparent)',
                  pointerEvents: 'none',
                }} />
              )}
              {loading ? 'entering room 13...' : 'begin'}
            </button>
          </div>

          <div className="hp-guide-in" style={{
            marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Link href="/how-to-play" className="hp-guide-link">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M5.5 5.5C5.5 4.67 6.17 4 7 4s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5"
                  stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <circle cx="7" cy="9.5" r="0.6" fill="currentColor"/>
              </svg>
              How to play
            </Link>
          </div>

          <p className="hp-sub-in" style={{
            marginTop: 20, color: 'var(--th-text-4)', fontSize: '0.68rem',
            fontWeight: 400, textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1.7,
            fontFamily: 'var(--font-brand-sans)',
          }}>
            You will get a link to share.<br />
            Game starts when they join.
          </p>

          {/* Footer watermark */}
          <div style={{
            position: 'absolute', bottom: -80, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
          }}>
            <Room13MarkSmall size={10} opacity={0.5} />
            <span style={{
              fontFamily: 'var(--font-brand-mono)',
              color: 'var(--th-text-4)', fontSize: '0.60rem',
              letterSpacing: '0.18em', textTransform: 'lowercase',
            }}>
              room 13
            </span>
          </div>
        </div>
      </div>
    </>
  )
}