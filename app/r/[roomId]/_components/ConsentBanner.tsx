'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PendingQuestion, PlayerSlot } from '@/lib/supabase'

/* In-game font import — shared across all in-game components */
const IN_GAME_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Figtree:wght@300;400;500;600&display=swap');`

const TIER_COLORS: Record<string,string> = { light:'#4ade80', medium:'#60a5fa', deep:'#f87171', spicy:'#c084fc' }
const TIER_LABELS: Record<string,string> = { light:'Light', medium:'Medium', deep:'Deep', spicy:'Spicy' }

// ---------------------------------------------------------------------------
// ConsentBanner
// ---------------------------------------------------------------------------

export function ConsentBanner({ proposal, onAccept, onDecline, loading }: {
  proposal: PendingQuestion; onAccept:()=>void; onDecline:()=>void; loading:boolean
}) {
  const color = TIER_COLORS[proposal.tier]
  return (
    <>
      <style>{`${IN_GAME_FONTS}
        @keyframes cb-in{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        .cb-root{animation:cb-in 0.32s cubic-bezier(0.22,1,0.36,1) both;font-family:'Figtree',system-ui,sans-serif;}
      `}</style>
      <div className="cb-root" style={{ margin:'12px 16px 0', borderRadius:18, background:'var(--th-surface)', border:`1px solid ${color}22`, boxShadow:`0 4px 24px ${color}0e`, padding:'16px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }}/>
          <span style={{ fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.64rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase' }}>Question proposal</span>
          <span style={{ marginLeft:'auto', fontFamily:"'Syne',system-ui,sans-serif", color, fontSize:'0.68rem', fontWeight:700 }}>{TIER_LABELS[proposal.tier]}</span>
        </div>
        <p style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-1)', fontSize:'0.92rem', fontWeight:400, lineHeight:1.55, marginBottom:14 }}>
          &ldquo;{proposal.text}&rdquo;
        </p>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onDecline} disabled={loading} style={{ flex:1, height:40, borderRadius:11, background:'transparent', border:'1px solid var(--th-border)', color:'var(--th-text-3)', fontSize:'0.78rem', fontWeight:500, cursor:'pointer', fontFamily:"'Figtree',system-ui,sans-serif" }}>Decline</button>
          <button onClick={onAccept} disabled={loading} style={{ flex:2, height:40, borderRadius:11, background:`linear-gradient(135deg,${color}18,${color}0c)`, border:`1px solid ${color}33`, color, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:"'Figtree',system-ui,sans-serif" }}>{loading?'Adding...':'Accept'}</button>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// PendingNotice
// ---------------------------------------------------------------------------

export function PendingNotice() {
  return (
    <>
      <style>{IN_GAME_FONTS}</style>
      <div style={{ margin:'12px 16px 0', padding:'10px 16px', borderRadius:12, background:'var(--th-surface)', border:'1px solid var(--th-border)', fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:'#fbbf24', boxShadow:'0 0 6px #fbbf24', flexShrink:0 }}/>
        Waiting for them to accept your question...
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// PlayerHeader
// ---------------------------------------------------------------------------

export function PlayerHeader({ p1Name, p2Name, mySlot, myPersonalUrl, themeToggle }: {
  p1Name:string; p2Name:string; mySlot:PlayerSlot; myPersonalUrl:string; themeToggle?:React.ReactNode
}) {
  return (
    <>
      <style>{`${IN_GAME_FONTS}
        .guide-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;border:1px solid var(--th-border);background:transparent;color:var(--th-text-3);text-decoration:none;transition:border-color 0.2s ease,color 0.2s ease;flex-shrink:0;}
        .guide-btn:hover{border-color:var(--th-border-2);color:var(--th-text-2);}
      `}</style>
      <div style={{ display:'flex', alignItems:'center', padding:'14px 16px 0', fontFamily:"'Figtree',system-ui,sans-serif", gap:8 }}>
        <PlayerChip name={p1Name} isMe={mySlot===1} align="left"  myPersonalUrl={myPersonalUrl}/>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <span style={{ fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-4)', fontSize:'0.60rem', fontWeight:700, letterSpacing:'0.16em' }}>VS</span>
          <Link href="/how-to-play" target="_blank" rel="noopener noreferrer" className="guide-btn" aria-label="How to play">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1"/><path d="M5.5 5.5C5.5 4.67 6.17 4 7 4s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><circle cx="7" cy="9.5" r="0.6" fill="currentColor"/></svg>
          </Link>
        </div>
        <PlayerChip name={p2Name} isMe={mySlot===2} align="right" myPersonalUrl={myPersonalUrl}/>
        {themeToggle && <div style={{ flexShrink:0, marginLeft:4 }}>{themeToggle}</div>}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// PlayerChip
// ---------------------------------------------------------------------------

function PlayerChip({ name, isMe, align, myPersonalUrl }: {
  name:string; isMe:boolean; align:'left'|'right'; myPersonalUrl:string
}) {
  const reversed = align === 'right'
  const [copied,  setCopied]  = useState(false)
  const [showTip, setShowTip] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    if (!myPersonalUrl) return
    navigator.clipboard.writeText(myPersonalUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2400)
    }).catch(()=>{})
  }

  return (
    <>
      <style>{`
        @keyframes chip-copy-in{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
        @keyframes chip-tip-in {from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .chip-copy-btn{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:7px;flex-shrink:0;background:none;border:1px solid var(--th-border);color:var(--th-text-4);cursor:pointer;font-family:'Figtree',system-ui,sans-serif;font-size:0.56rem;font-weight:600;letter-spacing:0.06em;white-space:nowrap;transition:border-color 0.18s ease,color 0.18s ease,background 0.18s ease;}
        .chip-copy-btn:hover{border-color:var(--th-border-2);color:var(--th-text-2);background:var(--th-surface-2);}
        .chip-copy-confirm{animation:chip-copy-in 0.18s ease both;color:#4ade80;}
        .chip-tip{animation:chip-tip-in 0.18s ease both;}
      `}</style>
      <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0, flexDirection:reversed?'row-reverse':'row' }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--th-surface-2)', border:'1px solid var(--th-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--th-text-2)', fontSize:'0.60rem', fontWeight:700, fontFamily:"'Syne',system-ui,sans-serif", letterSpacing:'0.05em', flexShrink:0 }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, minWidth:0, flex:1, flexDirection:reversed?'row-reverse':'row', position:'relative' }}>
          <span style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:isMe?'var(--th-text-1)':'var(--th-text-3)', fontSize:'0.80rem', fontWeight:isMe?500:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {name}
            {isMe && <span style={{ color:'var(--th-text-4)', fontSize:'0.60rem', marginLeft:5, fontWeight:300 }}>you</span>}
          </span>
          {isMe && myPersonalUrl && (
            <div style={{ position:'relative', flexShrink:0 }}>
              <button className="chip-copy-btn" onClick={handleCopy} onMouseEnter={()=>setShowTip(true)} onMouseLeave={()=>setShowTip(false)} aria-label={copied?'Link copied!':'Copy your personal return link'}>
                {copied ? (
                  <><span className="chip-copy-confirm" style={{ fontSize:'0.60rem', lineHeight:1 }}>✓</span><span className="chip-copy-confirm">Copied!</span></>
                ) : (
                  <><svg width="9" height="9" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1h6A1.5 1.5 0 0 1 13 2.5v6A1.5 1.5 0 0 1 11.5 10H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>Copy my link</>
                )}
              </button>
              {showTip && !copied && (
                <div className="chip-tip" style={{ position:'absolute', top:'calc(100% + 7px)', [reversed?'right':'left']:0, background:'var(--th-surface-2)', border:'1px solid var(--th-border-2)', borderRadius:10, padding:'8px 11px', width:200, zIndex:400, pointerEvents:'none', boxShadow:'0 8px 24px rgba(0,0,0,0.18)' }}>
                  <div style={{ fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-1)', fontSize:'0.66rem', fontWeight:600, marginBottom:4 }}>Your personal return link</div>
                  <div style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.62rem', lineHeight:1.55 }}>Save this to return to your session from any device, even if you close this tab.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}