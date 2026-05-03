'use client'

import { useState } from 'react'
import { Room13Mark, BrandWatermark } from './BrandWatermark'

const TIER_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#c084fc'] as const

type WaitingScreenProps = { shareUrl: string }

export function WaitingScreen({ shareUrl }: WaitingScreenProps) {
  const [copied, setCopied] = useState(false)

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
        @keyframes ws-info-in   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .ws-root      { animation: ws-in       0.4s ease both; }
        .ws-mark-anim { animation: ws-mark     3s ease-in-out infinite; }
        .ws-dot-0     { animation: ws-dot-pulse 1.5s ease-in-out 0.0s infinite; }
        .ws-dot-1     { animation: ws-dot-pulse 1.5s ease-in-out 0.3s infinite; }
        .ws-dot-2     { animation: ws-dot-pulse 1.5s ease-in-out 0.6s infinite; }
        .ws-dot-3     { animation: ws-dot-pulse 1.5s ease-in-out 0.9s infinite; }
        .ws-info      { animation: ws-info-in 0.45s cubic-bezier(0.22,1,0.36,1) 0.2s both; }

        .ws-copy-btn {
          display:flex; align-items:center; gap:10px;
          background:var(--th-surface); border:1px solid var(--th-border);
          border-radius:99px; padding:11px 18px;
          cursor:pointer; transition:border-color 0.2s ease,background 0.2s ease;
          width:100%; max-width:340px; font-family:'Playfair Display',Georgia,serif;
        }
        .ws-copy-btn:hover { border-color:var(--th-border-2); background:var(--th-surface-2); }
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
        <p style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-3)', fontSize:'0.88rem', fontStyle:'italic', textAlign:'center', marginBottom:10, lineHeight:1.6 }}>
          Send the link below to whoever you&apos;re playing with.<br/>The game starts the moment they join.
        </p>

        {/* Guest label — makes clear this is not the host's link */}
        <div style={{ marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#60a5fa', boxShadow:'0 0 6px #60a5fa99', flexShrink:0 }}/>
          <span style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'#60a5fa', fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.06em' }}>
            Guest invite link
          </span>
        </div>

        <button className="ws-copy-btn" onClick={copy}>
          <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--th-text-3)', fontSize:'0.72rem', fontStyle:'italic', textAlign:'left' }}>{shareUrl}</span>
          <span style={{ color: copied ? '#4ade80' : 'var(--th-text-2)', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', flexShrink:0, transition:'color 0.2s ease' }}>
            {copied ? '✓ Copied' : 'Copy'}
          </span>
        </button>

        {/* Clarification block */}
        <div className="ws-info" style={{ marginTop:20, width:'100%', maxWidth:340, borderRadius:16, background:'rgba(96,165,250,0.05)', border:'1px solid rgba(96,165,250,0.18)', padding:'16px 18px' }}>

          {/* Row 1 — what this link is for */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:14 }}>
            <span style={{ fontSize:'0.88rem', flexShrink:0, lineHeight:1.5 }}>🔗</span>
            <div>
              <div style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-1)', fontSize:'0.76rem', fontWeight:700, marginBottom:3 }}>
                This link is for your guest — not you
              </div>
              <div style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-3)', fontSize:'0.74rem', fontStyle:'italic', lineHeight:1.65 }}>
                Send it to the person you&apos;re playing with. Opening it yourself will put you in the wrong seat.
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height:1, background:'rgba(96,165,250,0.12)', marginBottom:14 }}/>

          {/* Row 2 — host's own link */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontSize:'0.88rem', flexShrink:0, lineHeight:1.5 }}>🔖</span>
            <div>
              <div style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-1)', fontSize:'0.76rem', fontWeight:700, marginBottom:3 }}>
                Your personal return link appears once the game starts
              </div>
              <div style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-3)', fontSize:'0.74rem', fontStyle:'italic', lineHeight:1.65 }}>
                Once your guest joins, look for the <strong style={{ fontStyle:'normal', color:'var(--th-text-2)' }}>Copy my link</strong> button next to your name. That link is yours — bookmark it or save it somewhere safe. It&apos;s the only way back if you close the tab.
              </div>
            </div>
          </div>
        </div>

        <BrandWatermark/>
      </div>
    </>
  )
}