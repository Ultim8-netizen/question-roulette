'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PendingQuestion, PlayerSlot } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Tier colour map
// ---------------------------------------------------------------------------

const TIER_COLORS: Record<string, string> = {
  light:  '#4ade80',
  medium: '#60a5fa',
  deep:   '#f87171',
  spicy:  '#c084fc',
}

const TIER_LABELS: Record<string, string> = {
  light: 'Light', medium: 'Medium', deep: 'Deep', spicy: 'Spicy',
}

// ---------------------------------------------------------------------------
// ConsentBanner
// ---------------------------------------------------------------------------

type ConsentBannerProps = {
  proposal:  PendingQuestion
  onAccept:  () => void
  onDecline: () => void
  loading:   boolean
}

export function ConsentBanner({
  proposal,
  onAccept,
  onDecline,
  loading,
}: ConsentBannerProps) {
  const color = TIER_COLORS[proposal.tier]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes cb-in {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        .cb-root { animation: cb-in 0.32s cubic-bezier(0.22,1,0.36,1) both; font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>

      <div
        className="cb-root"
        style={{
          margin:       '12px 16px 0',
          borderRadius:  18,
          overflow:     'hidden',
          background:   'var(--th-surface)',
          border:       `1px solid ${color}22`,
          boxShadow:    `0 4px 24px ${color}0e`,
          padding:      '16px 18px',
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }}/>
          <span style={{ color:'var(--th-text-3)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            Question proposal
          </span>
          <span style={{ marginLeft:'auto', color, fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.06em' }}>
            {TIER_LABELS[proposal.tier]}
          </span>
        </div>

        <p style={{ fontFamily:"'Cormorant Garamond', serif", color:'var(--th-text-1)', fontSize:'0.92rem', fontWeight:500, lineHeight:1.55, marginBottom:14 }}>
          &ldquo;{proposal.text}&rdquo;
        </p>

        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={onDecline}
            disabled={loading}
            style={{ flex:1, height:40, borderRadius:11, background:'transparent', border:'1px solid var(--th-border)', color:'var(--th-text-3)', fontSize:'0.78rem', fontWeight:500, cursor:'pointer', transition:'all 0.18s ease', fontFamily:"'DM Sans', system-ui, sans-serif" }}
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={loading}
            style={{ flex:2, height:40, borderRadius:11, background:`linear-gradient(135deg, ${color}18, ${color}0c)`, border:`1px solid ${color}33`, color, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all 0.18s ease', fontFamily:"'DM Sans', system-ui, sans-serif" }}
          >
            {loading ? 'Adding...' : 'Accept'}
          </button>
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
    <div style={{ margin:'12px 16px 0', padding:'10px 16px', borderRadius:12, background:'var(--th-surface)', border:'1px solid var(--th-border)', fontFamily:"'DM Sans', system-ui, sans-serif", color:'var(--th-text-3)', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:5, height:5, borderRadius:'50%', background:'#fbbf24', boxShadow:'0 0 6px #fbbf24', flexShrink:0 }}/>
      Waiting for them to accept your question...
    </div>
  )
}

// ---------------------------------------------------------------------------
// PlayerHeader
// ---------------------------------------------------------------------------

type PlayerHeaderProps = {
  p1Name:       string
  p2Name:       string
  mySlot:       PlayerSlot
  myPersonalUrl: string
}

export function PlayerHeader({ p1Name, p2Name, mySlot, myPersonalUrl }: PlayerHeaderProps) {
  return (
    <>
      <style>{`
        .guide-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid var(--th-border); background: transparent;
          color: var(--th-text-3); text-decoration: none;
          transition: border-color 0.2s ease, color 0.2s ease; flex-shrink: 0;
        }
        .guide-btn:hover { border-color: var(--th-border-2); color: var(--th-text-2); }
      `}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px 0', fontFamily:"'DM Sans', system-ui, sans-serif", gap:8 }}>
        <PlayerChip name={p1Name} isMe={mySlot === 1} align="left"  myPersonalUrl={myPersonalUrl} />

        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <span style={{ color:'var(--th-text-4)', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.12em' }}>
            VS
          </span>
          <Link href="/how-to-play" target="_blank" rel="noopener noreferrer" className="guide-btn" aria-label="How to play" title="How to play">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M5.5 5.5C5.5 4.67 6.17 4 7 4s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              <circle cx="7" cy="9.5" r="0.6" fill="currentColor"/>
            </svg>
          </Link>
        </div>

        <PlayerChip name={p2Name} isMe={mySlot === 2} align="right" myPersonalUrl={myPersonalUrl} />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// PlayerChip
// ---------------------------------------------------------------------------

function PlayerChip({
  name,
  isMe,
  align,
  myPersonalUrl,
}: {
  name:          string
  isMe:          boolean
  align:         'left' | 'right'
  myPersonalUrl: string
}) {
  const reversed = align === 'right'
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    if (!myPersonalUrl) return
    navigator.clipboard.writeText(myPersonalUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // Clipboard API unavailable — silently ignore.
    })
  }

  return (
    <>
      <style>{`
        @keyframes chip-copy-in { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        .chip-copy-btn {
          display: flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
          background: none; border: 1px solid var(--th-border);
          color: var(--th-text-4); cursor: pointer;
          transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
          padding: 0;
        }
        .chip-copy-btn:hover {
          border-color: var(--th-border-2);
          color: var(--th-text-2);
          background: var(--th-surface-2);
        }
        .chip-copy-confirm {
          animation: chip-copy-in 0.18s ease both;
          color: #4ade80;
        }
      `}</style>

      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:           6,
          flex:          1,
          minWidth:      0,
          flexDirection: reversed ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--th-surface-2)', border:'1px solid var(--th-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--th-text-2)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.05em', flexShrink:0 }}>
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Name + copy button */}
        <div
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:            4,
            minWidth:       0,
            flexDirection:  reversed ? 'row-reverse' : 'row',
            flex:           1,
          }}
        >
          <span style={{ color: isMe ? 'var(--th-text-1)' : 'var(--th-text-3)', fontSize:'0.82rem', fontWeight:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {name}
            {isMe && (
              <span style={{ color:'var(--th-text-4)', fontSize:'0.65rem', marginLeft:6 }}>
                you
              </span>
            )}
          </span>

          {/*
            Copy-my-link button — only visible on the player's own chip.
            Copies their personal recovery URL (?h=1 or ?p=2) so they can
            bookmark it or send it to themselves on another device.
          */}
          {isMe && myPersonalUrl && (
            <button
              className="chip-copy-btn"
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy my session link'}
              aria-label={copied ? 'Link copied' : 'Copy my session link'}
            >
              {copied ? (
                <span className="chip-copy-confirm" style={{ fontSize:'0.60rem', fontWeight:700, lineHeight:1 }}>✓</span>
              ) : (
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1h6A1.5 1.5 0 0 1 13 2.5v6A1.5 1.5 0 0 1 11.5 10H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}