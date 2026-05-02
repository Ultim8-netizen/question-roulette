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

  useEffect(() => {
    try { const stored = localStorage.getItem('abyss-theme'); if (!stored) setTheme('lemon') } catch {}
  }, [setTheme])

  return (
    <>
      <style>{`
        /* Pre-game font: Playfair Display */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');

        @keyframes js-in      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes js-mark    { 0%,100%{opacity:0.65} 50%{opacity:1} }
        @keyframes js-shimmer { 0%{transform:translateX(-130%) skewX(-14deg);opacity:0} 12%{opacity:1} 88%{opacity:1} 100%{transform:translateX(270%) skewX(-14deg);opacity:0} }

        .js-root    { animation: js-in        0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .js-mark    { animation: js-mark-pulse 3s   ease-in-out infinite; }
        .js-shimmer { animation: js-shimmer   2.8s  ease-in-out infinite; }
        @keyframes js-mark-pulse { 0%,100%{opacity:0.65} 50%{opacity:1} }
      `}</style>

      <div style={{ position:'fixed', top:18, right:20, zIndex:9999 }}>
        <ThemeToggle/>
      </div>

      <div className="js-root" style={{ position:'fixed', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', background:'var(--th-bg)', fontFamily:"'Playfair Display',Georgia,serif" }}>

        <div className="js-mark" style={{ marginBottom:20 }}>
          <Room13Mark size={44} opacity={1}/>
        </div>

        {/* Wordmark */}
        <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'0.80rem', fontWeight:400, fontStyle:'italic', letterSpacing:'0.18em', color:'var(--th-text-4)', textTransform:'lowercase', marginBottom:6 }}>
          room 13
        </span>
        <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'0.60rem', fontWeight:400, fontStyle:'italic', letterSpacing:'0.12em', color:'var(--th-text-4)', textTransform:'lowercase', marginBottom:28, opacity:0.6 }}>
          by abyss protocol
        </span>

        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-1)', fontSize:'1.7rem', fontWeight:600, textAlign:'center', marginBottom:8, lineHeight:1.25 }}>
          You&apos;ve been invited
        </h1>

        <p style={{ fontFamily:"'Playfair Display',Georgia,serif", color:'var(--th-text-3)', fontSize:'0.88rem', fontStyle:'italic', textAlign:'center', marginBottom:36, lineHeight:1.6 }}>
          A game of questions.<br/>Enter your name to begin.
        </p>

        <div style={{ width:'100%', maxWidth:320 }}>
          <input
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onJoin(name.trim())}
            placeholder="Your name"
            maxLength={32} autoFocus
            style={{ width:'100%', height:52, borderRadius:14, background:'var(--th-input-bg)', border:'1px solid var(--th-input-border)', color:'var(--th-fg)', fontSize:'1rem', fontStyle:'italic', padding:'0 16px', outline:'none', boxSizing:'border-box', fontFamily:"'Playfair Display',Georgia,serif", marginBottom:12, transition:'border-color 0.2s ease' }}
            onFocus={e => (e.target.style.borderColor='var(--th-border-2)')}
            onBlur={e  => (e.target.style.borderColor='var(--th-input-border)')}
          />

          <button
            disabled={!name.trim() || loading}
            onClick={() => name.trim() && onJoin(name.trim())}
            style={{ position:'relative', width:'100%', height:52, borderRadius:14, background: name.trim() ? 'var(--th-surface)' : 'var(--th-bg-alt)', border: name.trim() ? '1px solid var(--th-border-2)' : '1px solid var(--th-border)', color: name.trim() ? 'var(--th-text-1)' : 'var(--th-text-4)', fontSize:'1.10rem', fontWeight:400, fontStyle:'italic', letterSpacing:'0.04em', cursor: name.trim() && !loading ? 'pointer' : 'default', overflow:'hidden', fontFamily:"'Playfair Display',Georgia,serif", transition:'all 0.2s ease' }}
          >
            {name.trim() && !loading && (
              <div className="js-shimmer" style={{ position:'absolute', top:0, bottom:0, width:'35%', background:'linear-gradient(90deg,transparent,var(--th-border-2),transparent)', pointerEvents:'none' }}/>
            )}
            {loading ? 'entering room 13...' : 'join game'}
          </button>
        </div>

        <BrandWatermark/>
      </div>
    </>
  )
}