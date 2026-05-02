'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

const TIER_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#c084fc']

export const SLOT_KEY      = (roomId: string) => `f9q-slot-${roomId}`
export const LAST_ROOM_KEY = 'f9q-last-room'

function Room13Logo({ width = 140, height = 64 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 680 310" fill="none" aria-hidden="true" style={{ flexShrink:0, display:'block' }}>
      <circle cx="340" cy="172" r="64" fill="var(--th-surface)" stroke="currentColor" strokeWidth="2.2"/>
      <circle cx="340" cy="172" r="48" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.38"/>
      <g opacity="0.11" fill="currentColor">
        <path d="M340,172 L340,124 A48,48 0 0,1 373.9,137.9 Z"/>
        <path d="M340,172 L388,172 A48,48 0 0,1 373.9,206.1 Z"/>
        <path d="M340,172 L340,220 A48,48 0 0,1 306.1,206.1 Z"/>
        <path d="M340,172 L292,172 A48,48 0 0,1 306.1,137.9 Z"/>
      </g>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.60">
        <line x1="340" y1="124" x2="340" y2="108"/>
        <line x1="373.9" y1="137.9" x2="385.3" y2="126.5"/>
        <line x1="388" y1="172" x2="404" y2="172"/>
        <line x1="373.9" y1="206.1" x2="385.3" y2="217.5"/>
        <line x1="340" y1="220" x2="340" y2="236"/>
        <line x1="306.1" y1="206.1" x2="294.7" y2="217.5"/>
        <line x1="292" y1="172" x2="276" y2="172"/>
        <line x1="306.1" y1="137.9" x2="294.7" y2="126.5"/>
      </g>
      <circle cx="340" cy="172" r="8" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="340" cy="172" r="2.5" fill="currentColor"/>
      <g transform="rotate(-56,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.0" opacity="0.62"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.28"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.22"/></g>
      <g transform="rotate(56,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.0" opacity="0.62"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.28"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.22"/></g>
      <g transform="rotate(-40,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.1" opacity="0.74"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.35"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.28"/></g>
      <g transform="rotate(40,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.1" opacity="0.74"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.35"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.28"/></g>
      <g transform="rotate(-24,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.3" opacity="0.86"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" opacity="0.44"/><line x1="325" y1="186" x2="355" y2="186" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" opacity="0.28"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="1.0" opacity="0.38"/><circle cx="340" cy="216" r="2.2" fill="currentColor" opacity="0.38"/></g>
      <g transform="rotate(24,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.3" opacity="0.86"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" opacity="0.44"/><line x1="325" y1="186" x2="355" y2="186" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" opacity="0.28"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="1.0" opacity="0.38"/><circle cx="340" cy="216" r="2.2" fill="currentColor" opacity="0.38"/></g>
      <rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.60"/>
      <line x1="325" y1="186" x2="355" y2="186" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.38"/>
      <circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.65"/>
      <circle cx="340" cy="216" r="2.5" fill="currentColor" opacity="0.80"/>
    </svg>
  )
}

type ResumeState =
  | { status: 'checking' }
  | { status: 'found'; roomId: string; player2Joined: boolean }
  | { status: 'none' }

function ResumeBanner({ resume, onResume, onDismiss }: {
  resume: Extract<ResumeState, { status: 'found' }>
  onResume: () => void
  onDismiss: () => void
}) {
  const label = resume.player2Joined ? 'Your game is still active' : 'You have an unjoined room'
  const sub   = resume.player2Joined ? 'Pick up where you left off.' : 'Your link is still waiting for them.'
  return (
    <>
      <style>{`
        @keyframes rb-in { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .rb-root { animation: rb-in 0.35s cubic-bezier(0.22,1,0.36,1) both; font-family:'Playfair Display',Georgia,serif; }
      `}</style>
      <div className="rb-root w-full" style={{ marginBottom:20, padding:'13px 16px', borderRadius:14, background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.18)', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background:'#4ade80', boxShadow:'0 0 8px #4ade80' }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:'#4ade80', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.04em' }}>{label}</div>
          <div style={{ color:'var(--th-text-3)', fontSize:'0.68rem', marginTop:1, fontStyle:'italic' }}>{sub}</div>
        </div>
        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
          <button onClick={onDismiss} style={{ background:'none', border:'1px solid var(--th-border)', borderRadius:8, padding:'5px 10px', color:'var(--th-text-4)', fontSize:'0.68rem', cursor:'pointer', fontFamily:"'Playfair Display',Georgia,serif" }}>Dismiss</button>
          <button onClick={onResume}  style={{ background:'rgba(74,222,128,0.10)', border:'1px solid rgba(74,222,128,0.28)', borderRadius:8, padding:'5px 12px', color:'#4ade80', fontSize:'0.68rem', fontWeight:700, cursor:'pointer', fontFamily:"'Playfair Display',Georgia,serif" }}>Resume</button>
        </div>
      </div>
    </>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [resume,  setResume]  = useState<ResumeState>({ status: 'checking' })

  useEffect(() => {
    async function checkLastRoom() {
      let lastRoomId: string | null = null
      try { lastRoomId = localStorage.getItem(LAST_ROOM_KEY) } catch { setResume({ status:'none' }); return }
      if (!lastRoomId) { setResume({ status:'none' }); return }
      let slot: string | null = null
      try { slot = localStorage.getItem(SLOT_KEY(lastRoomId)) } catch {}
      if (slot !== '1') { try { localStorage.removeItem(LAST_ROOM_KEY) } catch {} setResume({ status:'none' }); return }
      try {
        const { getSupabaseBrowserClient } = await import('@/lib/supabase')
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from('roulette_rooms').select('id,player2_name,expires_at').eq('id', lastRoomId).single()
        if (error || !data) { try { localStorage.removeItem(LAST_ROOM_KEY) } catch {} setResume({ status:'none' }); return }
        if (new Date(data.expires_at) < new Date()) { try { localStorage.removeItem(LAST_ROOM_KEY); localStorage.removeItem(SLOT_KEY(lastRoomId)) } catch {} setResume({ status:'none' }); return }
        setResume({ status:'found', roomId:lastRoomId, player2Joined:!!data.player2_name })
      } catch { setResume({ status:'none' }) }
    }
    void checkLastRoom()
  }, [])

  function handleResume() { const r = resume as Extract<ResumeState,{status:'found'}>; router.push(`/r/${r.roomId}?h=1`) }
  function handleDismiss() { try { const r = resume as Extract<ResumeState,{status:'found'}>; localStorage.removeItem(LAST_ROOM_KEY); localStorage.removeItem(SLOT_KEY(r.roomId)) } catch {} setResume({ status:'none' }) }

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed || loading) return
    setLoading(true); setError(null)
    const res = await fetch('/api/rooms', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ player1_name:trimmed }) })
    if (!res.ok) { setLoading(false); setError('Could not create room. Try again.'); return }
    const { roomId } = await res.json()
    try { localStorage.setItem(SLOT_KEY(roomId), '1'); localStorage.setItem(LAST_ROOM_KEY, roomId) } catch {}
    router.push(`/r/${roomId}?h=1`)
  }

  return (
    <>
      <style>{`
        /* ── Pre-game font: Playfair Display ── */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');

        @keyframes hp-orb-1 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.58} 50%{transform:translate(20px,-14px) scale(1.08);opacity:0.80} }
        @keyframes hp-orb-2 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.48} 50%{transform:translate(-16px,18px) scale(1.06);opacity:0.68} }
        @keyframes hp-orb-3 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.44} 50%{transform:translate(12px,14px) scale(1.07);opacity:0.64} }
        @keyframes hp-orb-4 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.38} 50%{transform:translate(-10px,-16px) scale(1.05);opacity:0.58} }
        @keyframes hp-logo-cycle {
          0%  {color:#4ade80;filter:drop-shadow(0 0 18px rgba(74,222,128,0.70))}
          25% {color:#60a5fa;filter:drop-shadow(0 0 18px rgba(96,165,250,0.70))}
          50% {color:#f87171;filter:drop-shadow(0 0 18px rgba(248,113,113,0.70))}
          75% {color:#c084fc;filter:drop-shadow(0 0 18px rgba(192,132,252,0.70))}
          100%{color:#4ade80;filter:drop-shadow(0 0 18px rgba(74,222,128,0.70))}
        }
        @keyframes hp-logo-in  { from{opacity:0;transform:translateY(-14px) scale(0.88)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes hp-title-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hp-form-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hp-div-in   { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes hp-shimmer  { 0%{transform:translateX(-130%) skewX(-14deg);opacity:0} 12%{opacity:1} 88%{opacity:1} 100%{transform:translateX(270%) skewX(-14deg);opacity:0} }
        @keyframes hp-dot      { 0%,100%{opacity:0.40;transform:scale(1)} 50%{opacity:1;transform:scale(1.30)} }

        .hp-orb-1{animation:hp-orb-1 10s ease-in-out infinite}
        .hp-orb-2{animation:hp-orb-2 13s ease-in-out infinite}
        .hp-orb-3{animation:hp-orb-3 11s ease-in-out infinite}
        .hp-orb-4{animation:hp-orb-4 14s ease-in-out infinite}
        .hp-logo-in   {animation:hp-logo-in    0.60s cubic-bezier(0.22,1,0.36,1) 0.06s both}
        .hp-logo-cycle{animation:hp-logo-cycle 7s   ease-in-out infinite}
        .hp-t1        {animation:hp-title-in   0.55s cubic-bezier(0.22,1,0.36,1) 0.20s both}
        .hp-t2        {animation:hp-title-in   0.55s cubic-bezier(0.22,1,0.36,1) 0.30s both}
        .hp-t3        {animation:hp-title-in   0.55s cubic-bezier(0.22,1,0.36,1) 0.40s both}
        .hp-form      {animation:hp-form-in    0.50s cubic-bezier(0.22,1,0.36,1) 0.52s both}
        .hp-div       {animation:hp-div-in     0.65s cubic-bezier(0.22,1,0.36,1) 0.14s both;transform-origin:center}
        .hp-shimmer   {animation:hp-shimmer    2.8s  ease-in-out infinite}
        .hp-dot-0{animation:hp-dot 3.0s ease-in-out 0.0s infinite}
        .hp-dot-1{animation:hp-dot 3.0s ease-in-out 0.5s infinite}
        .hp-dot-2{animation:hp-dot 3.0s ease-in-out 1.0s infinite}
        .hp-dot-3{animation:hp-dot 3.0s ease-in-out 1.5s infinite}

        /* All pre-game text uses Playfair Display */
        .hp-root { font-family: 'Playfair Display', Georgia, serif; }

        .hp-guide-link {
          color:var(--th-text-4); text-decoration:none;
          font-family:'Playfair Display',Georgia,serif;
          font-size:0.74rem; font-weight:400; font-style:italic;
          letter-spacing:0.02em;
          display:inline-flex; align-items:center; gap:5px;
          transition:color 0.2s ease;
        }
        .hp-guide-link:hover { color:var(--th-text-3); }
      `}</style>

      <div className="hp-root" style={{ minHeight:'100dvh', background:'var(--th-bg)', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>

        <div style={{ position:'absolute', top:18, right:20, zIndex:10 }}>
          <ThemeToggle />
        </div>

        {/* Background orbs */}
        {[
          { cls:'hp-orb-1', t:'-14%', l:'-12%', c:TIER_COLORS[0], op:'2a' },
          { cls:'hp-orb-2', t:'-10%', r:'-14%', c:TIER_COLORS[1], op:'22' },
          { cls:'hp-orb-3', b:'-12%', l:'-10%', c:TIER_COLORS[2], op:'20' },
          { cls:'hp-orb-4', b:'-10%', r:'-12%', c:TIER_COLORS[3], op:'1e' },
        ].map(({ cls, t, l, r, b, c, op }, i) => (
          <div key={i} className={cls} style={{ position:'absolute', top:t, left:l, right:r, bottom:b, width:'58vw', height:'58vw', maxWidth:380, maxHeight:380, borderRadius:'50%', background:`radial-gradient(circle,${c}${op} 0%,transparent 68%)`, pointerEvents:'none' }}/>
        ))}

        {/* Noise */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, backgroundSize:'180px 180px', opacity:0.5 }}/>

        <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:380, display:'flex', flexDirection:'column', alignItems:'center' }}>

          <div className="hp-logo-in hp-logo-cycle" style={{ marginBottom:20 }}>
            <Room13Logo width={180} height={82}/>
          </div>

          {/* Game name — Playfair Display */}
          <div className="hp-t1" style={{ textAlign:'center', marginBottom:4 }}>
            <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-1)', fontSize:'2.6rem', fontWeight:700, letterSpacing:'0.08em', lineHeight:1, margin:0 }}>
              Room 13
            </h1>
          </div>

          <div className="hp-t1" style={{ marginBottom:24 }}>
            <span style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-4)', fontSize:'0.62rem', fontWeight:400, fontStyle:'italic', letterSpacing:'0.12em' }}>
              by abyssprotocol
            </span>
          </div>

          {/* Tier dot divider */}
          <div className="hp-div" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:26, width:'100%' }}>
            <div style={{ flex:1, height:1, background:'linear-gradient(to right,transparent,var(--th-border-2))' }}/>
            {TIER_COLORS.map((c,i) => (
              <div key={c} className={`hp-dot-${i}`} style={{ width:6, height:6, borderRadius:'50%', background:c, boxShadow:`0 0 8px ${c},0 0 18px ${c}55` }}/>
            ))}
            <div style={{ flex:1, height:1, background:'linear-gradient(to left,transparent,var(--th-border-2))' }}/>
          </div>

          {/* Tagline — Playfair italic */}
          <div className="hp-t2" style={{ textAlign:'center', marginBottom:10 }}>
            <p style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-1)', fontSize:'1.50rem', fontWeight:400, fontStyle:'italic', lineHeight:1.3, margin:0 }}>
              Every card a different world.
            </p>
          </div>

          <div className="hp-t3" style={{ textAlign:'center', marginBottom:10 }}>
            <p style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-3)', fontSize:'0.92rem', fontWeight:400, fontStyle:'italic', lineHeight:1.6, margin:0 }}>
              Two players. Blind draws. No map.
            </p>
          </div>

          {/* Tier labels */}
          <div className="hp-t3" style={{ display:'flex', alignItems:'center', gap:6, marginBottom:36, marginTop:8 }}>
            {(['Light','Medium','Deep','Spicy'] as const).map((label,i) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
                {i > 0 && <span style={{ color:'var(--th-text-4)', fontSize:'0.55rem' }}>·</span>}
                <span style={{ fontFamily:"'Playfair Display',Georgia,serif", color:TIER_COLORS[i], fontSize:'0.76rem', fontStyle:'italic', fontWeight:400, opacity:0.80 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="hp-form" style={{ width:'100%' }}>
            {resume.status === 'found' && (
              <ResumeBanner resume={resume} onResume={handleResume} onDismiss={handleDismiss}/>
            )}

            <div style={{ position:'relative', marginBottom:12 }}>
              <input
                value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Your name"
                maxLength={32} autoFocus
                style={{ width:'100%', height:54, borderRadius:16, background:'var(--th-input-bg)', border:'1px solid var(--th-input-border)', color:'var(--th-fg)', fontSize:'1rem', fontWeight:400, fontStyle:'italic', padding:'0 18px', outline:'none', fontFamily:"'Playfair Display',Georgia,serif", transition:'border-color 0.2s ease', letterSpacing:'0.01em', boxSizing:'border-box' }}
                onFocus={e => (e.target.style.borderColor='var(--th-border-2)')}
                onBlur={e  => (e.target.style.borderColor='var(--th-input-border)')}
              />
            </div>

            {error && <p style={{ color:'#ef4444', fontSize:'0.75rem', textAlign:'center', marginBottom:10, fontFamily:"'Playfair Display',Georgia,serif", fontStyle:'italic' }}>{error}</p>}

            <button
              disabled={!name.trim() || loading}
              onClick={handleCreate}
              style={{ position:'relative', width:'100%', height:54, borderRadius:16, background: name.trim() ? 'var(--th-surface)' : 'var(--th-bg-alt)', border: name.trim() ? '1px solid var(--th-border-2)' : '1px solid var(--th-border)', color: name.trim() ? 'var(--th-text-1)' : 'var(--th-text-4)', fontSize:'1.15rem', fontWeight:400, fontStyle:'italic', letterSpacing:'0.04em', cursor: name.trim() && !loading ? 'pointer' : 'default', overflow:'hidden', transition:'all 0.25s ease', fontFamily:"'Playfair Display',Georgia,serif" }}
            >
              {name.trim() && !loading && (
                <div className="hp-shimmer" style={{ position:'absolute', top:0, bottom:0, width:'35%', background:'linear-gradient(90deg,transparent,var(--th-border-2),transparent)', pointerEvents:'none' }}/>
              )}
              {loading ? 'entering the room...' : 'enter'}
            </button>
          </div>

          {/* How to play */}
          <div style={{ marginTop:20, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Link href="/how-to-play" className="hp-guide-link">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M5.5 5.5C5.5 4.67 6.17 4 7 4s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <circle cx="7" cy="9.5" r="0.6" fill="currentColor"/>
              </svg>
              How to play
            </Link>
          </div>

          <p style={{ marginTop:18, color:'var(--th-text-4)', fontSize:'0.78rem', fontStyle:'italic', fontWeight:400, textAlign:'center', letterSpacing:'0.02em', lineHeight:1.7, fontFamily:"'Playfair Display',Georgia,serif" }}>
            Share one link. The room wakes when they arrive.
          </p>
        </div>
      </div>
    </>
  )
}