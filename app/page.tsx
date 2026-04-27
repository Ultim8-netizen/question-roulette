'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIER_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#c084fc']

function AbyssSignil({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="9"
        stroke="#c8d0de"
        strokeWidth="1.1"
        strokeDasharray="22 6"
        strokeDashoffset="3"
      />
      <line
        x1="16"
        y1="4"
        x2="16"
        y2="28"
        stroke="#c8d0de"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2" fill="#c8d0de" />
    </svg>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)

    const res = await fetch('/api/rooms', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ player1_name: trimmed }),
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes hp-orb-1 {
          0%,100% { transform: translate(0px,   0px)   scale(1.00); opacity: 0.45; }
          50%      { transform: translate(18px, -12px)  scale(1.06); opacity: 0.60; }
        }
        @keyframes hp-orb-2 {
          0%,100% { transform: translate(0px,   0px)   scale(1.00); opacity: 0.35; }
          50%      { transform: translate(-14px, 16px)  scale(1.04); opacity: 0.50; }
        }
        @keyframes hp-orb-3 {
          0%,100% { transform: translate(0px,   0px)   scale(1.00); opacity: 0.30; }
          50%      { transform: translate(10px,  12px)  scale(1.05); opacity: 0.45; }
        }
        @keyframes hp-orb-4 {
          0%,100% { transform: translate(0px,   0px)   scale(1.00); opacity: 0.28; }
          50%      { transform: translate(-8px, -14px)  scale(1.03); opacity: 0.40; }
        }

        @keyframes hp-sigil-in {
          from { opacity:0; transform:translateY(-10px) scale(0.92); }
          to   { opacity:1; transform:translateY(0)     scale(1);    }
        }
        @keyframes hp-sigil-pulse {
          0%,100% { opacity: 0.75; }
          50%      { opacity: 1;    }
        }
        @keyframes hp-wordmark-in {
          from { opacity:0; transform:translateY(10px); letter-spacing: 0.30em; }
          to   { opacity:1; transform:translateY(0);    letter-spacing: 0.22em; }
        }
        @keyframes hp-sub-in {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0);   }
        }
        @keyframes hp-form-in {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes hp-divider-in {
          from { transform: scaleX(0); opacity:0; }
          to   { transform: scaleX(1); opacity:1; }
        }
        @keyframes hp-btn-shimmer {
          0%   { transform: translateX(-120%) skewX(-14deg); opacity:0;  }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(260%)  skewX(-14deg); opacity:0;  }
        }
        @keyframes hp-tier-dot {
          0%,100% { opacity:0.35; transform:scale(1);    }
          50%      { opacity:0.75; transform:scale(1.2); }
        }

        .hp-orb-1 { animation: hp-orb-1 9s  ease-in-out infinite; }
        .hp-orb-2 { animation: hp-orb-2 11s ease-in-out infinite; }
        .hp-orb-3 { animation: hp-orb-3 10s ease-in-out infinite; }
        .hp-orb-4 { animation: hp-orb-4 12s ease-in-out infinite; }

        .hp-sigil-in   { animation: hp-sigil-in   0.50s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
        .hp-sigil-pulse{ animation: hp-sigil-pulse 3.5s ease-in-out 0.6s infinite; }
        .hp-wordmark-in{ animation: hp-wordmark-in 0.65s cubic-bezier(0.22,1,0.36,1) 0.18s both; }
        .hp-sub-in     { animation: hp-sub-in      0.50s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .hp-form-in    { animation: hp-form-in     0.50s cubic-bezier(0.22,1,0.36,1) 0.44s both; }
        .hp-divider-in { animation: hp-divider-in  0.60s cubic-bezier(0.22,1,0.36,1) 0.14s both; transform-origin: center; }
        .hp-btn-shimmer{ animation: hp-btn-shimmer 1.6s ease-in-out 0.2s both; }

        .hp-font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .hp-font-sans  { font-family: 'DM Sans', system-ui, sans-serif; }
        .hp-font-mono  { font-family: 'Geist Mono', 'Fira Mono', monospace; }

        * { box-sizing: border-box; }
        body { margin:0; background:#020308; }

        .hp-tier-dot-0 { animation: hp-tier-dot 3.0s ease-in-out 0.0s infinite; }
        .hp-tier-dot-1 { animation: hp-tier-dot 3.0s ease-in-out 0.4s infinite; }
        .hp-tier-dot-2 { animation: hp-tier-dot 3.0s ease-in-out 0.8s infinite; }
        .hp-tier-dot-3 { animation: hp-tier-dot 3.0s ease-in-out 1.2s infinite; }
      `}</style>

      <div
        className="hp-font-sans"
        style={{
          minHeight: '100dvh',
          background: '#020308',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >

        {/* Ambient orbs */}
        <div className="hp-orb-1" style={{
          position:'absolute', top:'-12%', left:'-10%',
          width:'55vw', height:'55vw', maxWidth:320, maxHeight:320,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${TIER_COLORS[0]}18 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />
        <div className="hp-orb-2" style={{
          position:'absolute', top:'-8%', right:'-12%',
          width:'50vw', height:'50vw', maxWidth:300, maxHeight:300,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${TIER_COLORS[1]}14 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />
        <div className="hp-orb-3" style={{
          position:'absolute', bottom:'-10%', left:'-8%',
          width:'52vw', height:'52vw', maxWidth:310, maxHeight:310,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${TIER_COLORS[2]}12 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />
        <div className="hp-orb-4" style={{
          position:'absolute', bottom:'-8%', right:'-10%',
          width:'48vw', height:'48vw', maxWidth:280, maxHeight:280,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${TIER_COLORS[3]}10 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />

        {/* Grain overlay */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize:'180px 180px',
          opacity:0.5,
        }} />

        {/* Content column */}
        <div style={{
          position:'relative', zIndex:1,
          width:'100%', maxWidth:360,
          display:'flex', flexDirection:'column', alignItems:'center',
        }}>

          {/* Sigil */}
          <div
            className="hp-sigil-in hp-sigil-pulse"
            style={{ marginBottom: 28 }}
          >
            <AbyssSignil size={44} />
          </div>

          {/* Wordmark */}
          <h1
            className="hp-wordmark-in hp-font-mono"
            style={{
              color: '#c8d0de',
              fontSize: '1.05rem',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'lowercase',
              margin: '0 0 6px',
              textAlign: 'center',
            }}
          >
            abyssprotocol
          </h1>

          {/* Divider with tier dots */}
          <div
            className="hp-divider-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div style={{
              height: '1px',
              width: 32,
              background: 'linear-gradient(to right, transparent, #1e2535)',
            }} />
            <div style={{ display:'flex', gap: 5 }}>
              {TIER_COLORS.map((c, i) => (
                <div
                  key={c}
                  className={`hp-tier-dot-${i}`}
                  style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: c,
                    boxShadow: `0 0 5px ${c}`,
                  }}
                />
              ))}
            </div>
            <div style={{
              height: '1px',
              width: 32,
              background: 'linear-gradient(to left, transparent, #1e2535)',
            }} />
          </div>

          {/* Tagline */}
          <p
            className="hp-sub-in hp-font-serif"
            style={{
              color: '#8896aa',
              fontSize: '1.25rem',
              fontWeight: 400,
              fontStyle: 'italic',
              textAlign: 'center',
              lineHeight: 1.5,
              marginBottom: 8,
            }}
          >
            Every card a different world
          </p>

          {/* Sub-tagline */}
          <p
            className="hp-sub-in hp-font-sans"
            style={{
              color: '#2a3244',
              fontSize: '0.78rem',
              fontWeight: 300,
              textAlign: 'center',
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 260,
            }}
          >
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
                autoFocus
                style={{
                  width: '100%', height: 54, borderRadius: 16,
                  background: '#06070d',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#d1d9e6',
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  padding: '0 18px',
                  outline: 'none',
                  fontFamily: "'DM Sans',system-ui,sans-serif",
                  transition: 'border-color 0.2s ease',
                  letterSpacing: '0.01em',
                }}
                onFocus={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.13)')}
                onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
              />
            </div>

            {error && (
              <p style={{
                color: '#7f1d1d', fontSize: '0.75rem',
                textAlign: 'center', marginBottom: 10,
                fontFamily: "'DM Sans',system-ui,sans-serif",
              }}>
                {error}
              </p>
            )}

            <button
              disabled={!name.trim() || loading}
              onClick={handleCreate}
              style={{
                position: 'relative',
                width: '100%', height: 54, borderRadius: 16,
                background: name.trim()
                  ? 'linear-gradient(150deg,#191d2c 0%,#111420 100%)'
                  : '#06070c',
                border: name.trim()
                  ? '1px solid rgba(255,255,255,0.10)'
                  : '1px solid rgba(255,255,255,0.03)',
                color: name.trim() ? '#c8d0de' : '#1a1e2a',
                fontSize: '0.88rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'lowercase',
                cursor: name.trim() && !loading ? 'pointer' : 'default',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                fontFamily: "'DM Sans',system-ui,sans-serif",
              }}
            >
              {name.trim() && !loading && (
                <div
                  className="hp-btn-shimmer"
                  style={{
                    position: 'absolute', top: 0, bottom: 0,
                    width: '35%',
                    background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {loading ? 'entering the abyss...' : 'begin'}
            </button>
          </div>

          {/* Footer hint */}
          <p
            className="hp-sub-in hp-font-sans"
            style={{
              marginTop: 28,
              color: '#131820',
              fontSize: '0.68rem',
              fontWeight: 400,
              textAlign: 'center',
              letterSpacing: '0.04em',
              lineHeight: 1.7,
            }}
          >
            You will get a link to share.<br />
            Game starts when they join.
          </p>

          {/* Brand footer */}
          <div
            style={{
              position: 'absolute',
              bottom: -80,
              left: 0, right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <AbyssSignil size={10} />
            <span
              className="hp-font-mono"
              style={{
                color: '#0d1018',
                fontSize: '0.60rem',
                letterSpacing: '0.18em',
                textTransform: 'lowercase',
              }}
            >
              abyssprotocol
            </span>
          </div>

        </div>
      </div>
    </>
  )
}