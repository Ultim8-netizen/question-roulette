'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// The entry point. Player 1 creates a room here and is redirected to /r/[id].
// Player 2 never sees this page — they arrive directly at /r/[roomId].
// ---------------------------------------------------------------------------

const TIER_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#c084fc']

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

    // Persist slot before navigation so the room page reads it immediately
    sessionStorage.setItem(`f9q-slot-${roomId}`, '1')

    router.push(`/r/${roomId}`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Page background animations ── */
        @keyframes hp-orb-1 {
          0%,100% { transform: translate(0px,   0px)   scale(1.00); opacity: 0.55; }
          50%      { transform: translate(18px, -12px)  scale(1.06); opacity: 0.70; }
        }
        @keyframes hp-orb-2 {
          0%,100% { transform: translate(0px,   0px)   scale(1.00); opacity: 0.45; }
          50%      { transform: translate(-14px, 16px)  scale(1.04); opacity: 0.60; }
        }
        @keyframes hp-orb-3 {
          0%,100% { transform: translate(0px,   0px)   scale(1.00); opacity: 0.40; }
          50%      { transform: translate(10px,  12px)  scale(1.05); opacity: 0.55; }
        }
        @keyframes hp-orb-4 {
          0%,100% { transform: translate(0px,   0px)   scale(1.00); opacity: 0.35; }
          50%      { transform: translate(-8px, -14px)  scale(1.03); opacity: 0.50; }
        }

        /* ── Content entrance ── */
        @keyframes hp-badge-in {
          from { opacity:0; transform:translateY(-8px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes hp-title-in {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes hp-sub-in {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes hp-form-in {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes hp-card-fan-in {
          from { opacity:0; transform:translateY(24px) scale(0.92); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes hp-tier-dot {
          0%,100% { opacity:0.45; transform:scale(1);    }
          50%      { opacity:0.85; transform:scale(1.15); }
        }
        @keyframes hp-input-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          50%      { box-shadow: 0 0 0 3px rgba(255,255,255,0.035); }
        }
        @keyframes hp-btn-shimmer {
          0%   { transform: translateX(-120%) skewX(-14deg); opacity:0;  }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(260%)  skewX(-14deg); opacity:0;  }
        }
        @keyframes hp-card-float-1 {
          0%,100% { transform: rotate(-8deg) translateY(0);    }
          50%      { transform: rotate(-9deg) translateY(-3px); }
        }
        @keyframes hp-card-float-2 {
          0%,100% { transform: rotate(1deg)  translateY(0);    }
          50%      { transform: rotate(1deg)  translateY(-5px); }
        }
        @keyframes hp-card-float-3 {
          0%,100% { transform: rotate(10deg) translateY(0);    }
          50%      { transform: rotate(11deg) translateY(-3px); }
        }

        .hp-orb-1 { animation: hp-orb-1 8s  ease-in-out infinite; }
        .hp-orb-2 { animation: hp-orb-2 10s ease-in-out infinite; }
        .hp-orb-3 { animation: hp-orb-3 9s  ease-in-out infinite; }
        .hp-orb-4 { animation: hp-orb-4 11s ease-in-out infinite; }

        .hp-badge-in  { animation: hp-badge-in  0.40s cubic-bezier(0.22,1,0.36,1) 0.10s both; }
        .hp-title-in  { animation: hp-title-in  0.55s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        .hp-sub-in    { animation: hp-sub-in    0.50s cubic-bezier(0.22,1,0.36,1) 0.34s both; }
        .hp-form-in   { animation: hp-form-in   0.50s cubic-bezier(0.22,1,0.36,1) 0.44s both; }
        .hp-fan-in    { animation: hp-card-fan-in 0.60s cubic-bezier(0.22,1,0.36,1) 0.18s both; }

        .hp-card-1 { animation: hp-card-float-1 5.0s ease-in-out 0.0s infinite; }
        .hp-card-2 { animation: hp-card-float-2 5.0s ease-in-out 0.2s infinite; }
        .hp-card-3 { animation: hp-card-float-3 5.0s ease-in-out 0.4s infinite; }

        .hp-input-focused { animation: hp-input-glow 2.5s ease-in-out infinite; }
        .hp-btn-shimmer   { animation: hp-btn-shimmer 1.6s ease-in-out 0.2s both; }

        .hp-font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .hp-font-sans  { font-family: 'DM Sans', system-ui, sans-serif; }

        * { box-sizing: border-box; }
        body { margin:0; background:#020308; }

        /* Tier dot row */
        .hp-tier-dot-0 { animation: hp-tier-dot 2.8s ease-in-out 0.0s infinite; }
        .hp-tier-dot-1 { animation: hp-tier-dot 2.8s ease-in-out 0.3s infinite; }
        .hp-tier-dot-2 { animation: hp-tier-dot 2.8s ease-in-out 0.6s infinite; }
        .hp-tier-dot-3 { animation: hp-tier-dot 2.8s ease-in-out 0.9s infinite; }
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

        {/* ── Ambient tier orbs — each corner bleeds its color ── */}
        {/* These subconsciously suggest the tier system before the game starts */}
        <div className="hp-orb-1" style={{
          position:'absolute', top:'-12%', left:'-10%',
          width:'55vw', height:'55vw', maxWidth:320, maxHeight:320,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${TIER_COLORS[0]}22 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />
        <div className="hp-orb-2" style={{
          position:'absolute', top:'-8%', right:'-12%',
          width:'50vw', height:'50vw', maxWidth:300, maxHeight:300,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${TIER_COLORS[1]}1e 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />
        <div className="hp-orb-3" style={{
          position:'absolute', bottom:'-10%', left:'-8%',
          width:'52vw', height:'52vw', maxWidth:310, maxHeight:310,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${TIER_COLORS[2]}1a 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />
        <div className="hp-orb-4" style={{
          position:'absolute', bottom:'-8%', right:'-10%',
          width:'48vw', height:'48vw', maxWidth:280, maxHeight:280,
          borderRadius:'50%',
          background:`radial-gradient(circle, ${TIER_COLORS[3]}18 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />

        {/* ── Noise grain overlay for depth ── */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize:'180px 180px',
          opacity:0.6,
        }} />

        {/* ── Content column ── */}
        <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:360, display:'flex', flexDirection:'column', alignItems:'center' }}>

          {/* Animated card fan — visual anchor */}
          <div className="hp-fan-in relative mb-10" style={{ width:80, height:90 }}>
            <div className="hp-card-1" style={{
              position:'absolute', bottom:0, left:0,
              width:52, height:72, borderRadius:11,
              background:'linear-gradient(160deg,#0f1424,#0a0d1a)',
              border:'1px solid rgba(255,255,255,0.07)',
              transformOrigin:'bottom center',
              transform:'rotate(-8deg)',
              overflow:'hidden',
            }}>
              {/* Light tier color strip */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:TIER_COLORS[0], opacity:0.55 }} />
            </div>
            <div className="hp-card-2" style={{
              position:'absolute', bottom:0, left:14,
              width:52, height:72, borderRadius:11,
              background:'linear-gradient(160deg,#12162a,#0c1020)',
              border:'1px solid rgba(255,255,255,0.09)',
              transformOrigin:'bottom center',
              transform:'rotate(1deg)',
              overflow:'hidden',
              zIndex:1,
            }}>
              {/* Medium tier color strip */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:TIER_COLORS[1], opacity:0.55 }} />
            </div>
            <div className="hp-card-3" style={{
              position:'absolute', bottom:0, right:0,
              width:52, height:72, borderRadius:11,
              background:'linear-gradient(160deg,#151228,#0e0c1e)',
              border:'1px solid rgba(255,255,255,0.08)',
              transformOrigin:'bottom center',
              transform:'rotate(10deg)',
              overflow:'hidden',
            }}>
              {/* Spicy tier color strip */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:TIER_COLORS[3], opacity:0.55 }} />
            </div>
          </div>

          {/* Badge */}
          <div className="hp-badge-in" style={{
            display:'flex', alignItems:'center', gap:8,
            marginBottom:18,
          }}>
            {/* Tier dots — four colors breathing in sequence */}
            <div style={{ display:'flex', gap:4 }}>
              {TIER_COLORS.map((c, i) => (
                <div
                  key={c}
                  className={`hp-tier-dot-${i}`}
                  style={{
                    width:5, height:5, borderRadius:'50%',
                    background:c,
                    boxShadow:`0 0 6px ${c}`,
                  }}
                />
              ))}
            </div>
            <span style={{
              color:'#334155', fontSize:'0.65rem',
              fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase',
            }}>
              Question Roulette
            </span>
          </div>

          {/* Title */}
          <h1
            className="hp-title-in hp-font-serif"
            style={{
              color:'#c8d0de',
              fontSize:'2.2rem',
              fontWeight:600,
              lineHeight:1.18,
              textAlign:'center',
              marginBottom:12,
              letterSpacing:'-0.01em',
            }}
          >
            Every card a<br/>
            <em style={{ color:'#8896aa', fontStyle:'italic', fontWeight:500 }}>
              different world
            </em>
          </h1>

          {/* Subline */}
          <p
            className="hp-sub-in hp-font-sans"
            style={{
              color:'#2a3244',
              fontSize:'0.82rem',
              fontWeight:300,
              textAlign:'center',
              lineHeight:1.65,
              marginBottom:40,
              maxWidth:280,
            }}
          >
            A two-player game of blind draws.<br/>
            Light surface. Dark depths. No map.
          </p>

          {/* Form */}
          <div className="hp-form-in" style={{ width:'100%' }}>

            {/* Name input */}
            <div style={{ position:'relative', marginBottom:12 }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Your name"
                maxLength={32}
                autoFocus
                style={{
                  width:'100%', height:54, borderRadius:16,
                  background:'#06070d',
                  border:'1px solid rgba(255,255,255,0.07)',
                  color:'#d1d9e6',
                  fontSize:'0.95rem',
                  fontWeight:400,
                  padding:'0 18px',
                  outline:'none',
                  fontFamily:"'DM Sans',system-ui,sans-serif",
                  transition:'border-color 0.2s ease',
                  letterSpacing:'0.01em',
                }}
                onFocus={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.14)')}
                onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
              />
            </div>

            {/* Error */}
            {error && (
              <p style={{
                color:'#7f1d1d', fontSize:'0.75rem',
                textAlign:'center', marginBottom:10,
                fontFamily:"'DM Sans',system-ui,sans-serif",
              }}>
                {error}
              </p>
            )}

            {/* Create button */}
            <button
              disabled={!name.trim() || loading}
              onClick={handleCreate}
              style={{
                position:'relative',
                width:'100%', height:54, borderRadius:16,
                background: name.trim()
                  ? 'linear-gradient(150deg,#191d2c 0%,#111420 100%)'
                  : '#06070c',
                border: name.trim()
                  ? '1px solid rgba(255,255,255,0.11)'
                  : '1px solid rgba(255,255,255,0.03)',
                color: name.trim() ? '#c8d0de' : '#1a1e2a',
                fontSize:'0.90rem',
                fontWeight:500,
                letterSpacing:'0.04em',
                cursor: name.trim() && !loading ? 'pointer' : 'default',
                overflow:'hidden',
                transition:'all 0.25s ease',
                fontFamily:"'DM Sans',system-ui,sans-serif",
              }}
            >
              {/* Shimmer on mount if name is already filled */}
              {name.trim() && !loading && (
                <div
                  className="hp-btn-shimmer"
                  style={{
                    position:'absolute', top:0, bottom:0,
                    width:'35%',
                    background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)',
                    pointerEvents:'none',
                  }}
                />
              )}
              {loading ? 'Creating...' : 'Create game'}
            </button>
          </div>

          {/* Footer hint */}
          <p
            className="hp-sub-in hp-font-sans"
            style={{
              marginTop:28,
              color:'#151820',
              fontSize:'0.68rem',
              fontWeight:400,
              textAlign:'center',
              letterSpacing:'0.04em',
              lineHeight:1.7,
            }}
          >
            You will get a link to share.<br/>
            Game starts when they join.
          </p>

        </div>
      </div>
    </>
  )
}