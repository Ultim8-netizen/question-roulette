'use client'

import { useState } from 'react'
import { Room13Mark, BrandWatermark } from './BrandWatermark'

const TIER_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#c084fc'] as const

type WaitingScreenProps = { shareUrl: string }

export function WaitingScreen({ shareUrl }: WaitingScreenProps) {
  const [copied,    setCopied]    = useState(false)
  const [linkSaved, setLinkSaved] = useState(false)

  function copy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2400)
    })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');

        @keyframes ws-dot-pulse { 0%,100%{opacity:0.35;transform:scale(1)} 50%{opacity:1;transform:scale(1.30)} }
        @keyframes ws-in        { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ws-mark      { 0%,100%{opacity:0.55} 50%{opacity:0.9} }
        @keyframes ws-warn-in   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ws-warn-pulse{ 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0)} 50%{box-shadow:0 0 0 4px rgba(251,191,36,0.12)} }

        .ws-root      { animation: ws-in       0.4s ease both; }
        .ws-mark-anim { animation: ws-mark     3s ease-in-out infinite; }
        .ws-dot-0     { animation: ws-dot-pulse 1.5s ease-in-out 0.0s infinite; }
        .ws-dot-1     { animation: ws-dot-pulse 1.5s ease-in-out 0.3s infinite; }
        .ws-dot-2     { animation: ws-dot-pulse 1.5s ease-in-out 0.6s infinite; }
        .ws-dot-3     { animation: ws-dot-pulse 1.5s ease-in-out 0.9s infinite; }
        .ws-warn      { animation: ws-warn-in 0.45s cubic-bezier(0.22,1,0.36,1) 0.2s both, ws-warn-pulse 3s ease-in-out 0.8s infinite; }

        .ws-copy-btn {
          display:flex; align-items:center; gap:10px;
          background:var(--th-surface); border:1px solid var(--th-border);
          border-radius:99px; padding:11px 18px;
          cursor:pointer; transition:border-color 0.2s ease,background 0.2s ease;
          width:100%; max-width:340px; font-family:'Playfair Display',Georgia,serif;
        }
        .ws-copy-btn:hover { border-color:var(--th-border-2); background:var(--th-surface-2); }

        .ws-confirm-btn {
          display:flex; align-items:center; justify-content:center; gap:8px;
          width:100%; max-width:340px; padding:13px 0; border-radius:14px;
          border:1px solid rgba(251,191,36,0.30); background:rgba(251,191,36,0.08);
          color:#fbbf24; font-family:'Playfair Display',Georgia,serif;
          font-size:0.82rem; font-weight:600; font-style:italic; letter-spacing:0.04em;
          cursor:pointer; transition:background 0.2s ease,border-color 0.2s ease;
        }
        .ws-confirm-btn:hover { background:rgba(251,191,36,0.14); border-color:rgba(251,191,36,0.42); }
        .ws-confirm-btn.done  { border-color:rgba(74,222,128,0.30); background:rgba(74,222,128,0.08); color:#4ade80; cursor:default; }
      `}</style>

      <div className="ws-root" style={{ position:'fixed', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', background:'var(--th-bg)', fontFamily:"'Playfair Display',Georgia,serif", overflowY:'auto' }}>

        <div className="ws-mark-anim" style={{ marginBottom:16 }}><Room13Mark size={36} opacity={1}/></div>

        <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'0.78rem', fontWeight:400, fontStyle:'italic', letterSpacing:'0.18em', color:'var(--th-text-4)', textTransform:'lowercase', marginBottom:28 }}>
          room 13
        </span>

        <div style={{ display:'flex', gap:10, marginBottom:32 }}>
          {TIER_COLORS.map((color,i) => (
            <div key={color} className={`ws-dot-${i}`} style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}99` }}/>
          ))}
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-1)', fontSize:'1.6rem', fontWeight:600, textAlign:'center', marginBottom:8 }}>
          Waiting for them
        </h1>
        <p style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-3)', fontSize:'0.88rem', fontStyle:'italic', textAlign:'center', marginBottom:28, lineHeight:1.6 }}>
          Share the link below.<br/>The game starts once they join.
        </p>

        <button className="ws-copy-btn" onClick={copy}>
          <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--th-text-3)', fontSize:'0.72rem', fontStyle:'italic', textAlign:'left' }}>{shareUrl}</span>
          <span style={{ color: copied ? '#4ade80' : 'var(--th-text-2)', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', flexShrink:0, transition:'color 0.2s ease' }}>
            {copied ? '✓ Copied' : 'Copy'}
          </span>
        </button>

        {/* Link safety warning */}
        <div className="ws-warn" style={{ marginTop:20, width:'100%', maxWidth:340, borderRadius:16, background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.22)', padding:'16px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbbf24', boxShadow:'0 0 8px #fbbf2488', flexShrink:0 }}/>
            <span style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'#fbbf24', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.06em' }}>
              Save your link — don&apos;t lose your session
            </span>
          </div>
          <p style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-2)', fontSize:'0.80rem', fontStyle:'italic', lineHeight:1.65, margin:'0 0 14px 0' }}>
            This game lives at <strong style={{ fontStyle:'normal', color:'var(--th-text-1)' }}>your unique link</strong>. Close this tab without saving it and you may not be able to return.
          </p>
          <ul style={{ margin:'0 0 16px 0', padding:'0 0 0 2px', listStyle:'none', display:'flex', flexDirection:'column', gap:7 }}>
            {[
              { icon:'📋', text:'Copy the link above and paste it somewhere safe.' },
              { icon:'🔖', text:'Or bookmark this page in your browser right now.' },
              { icon:'🔗', text:'Send this same link to the other player to join.' },
            ].map(({ icon, text }) => (
              <li key={icon} style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
                <span style={{ fontSize:'0.82rem', flexShrink:0, lineHeight:1.6 }}>{icon}</span>
                <span style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-3)', fontSize:'0.76rem', fontStyle:'italic', lineHeight:1.6 }}>{text}</span>
              </li>
            ))}
          </ul>
          <button className={`ws-confirm-btn${linkSaved?' done':''}`} onClick={() => setLinkSaved(true)} disabled={linkSaved}>
            {linkSaved ? (
              <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#4ade80" strokeWidth="1.2"/><path d="M4.5 7l1.8 1.8L9.5 5" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Got it — link is saved</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="3" stroke="#fbbf24" strokeWidth="1.2"/></svg>I&apos;ve saved my link</>
            )}
          </button>
        </div>

        <BrandWatermark/>
      </div>
    </>
  )
}