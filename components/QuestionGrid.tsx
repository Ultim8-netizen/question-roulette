'use client'

import { useState } from 'react'
import type { QuestionTier } from '@/lib/supabase'
import { getTierConfig } from '@/lib/tierConfig'
import { useTheme } from '@/context/ThemeContext'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DrawnCard = {
  key:           string
  questionIndex: number
  questionText:  string
  tier:          QuestionTier
  isCustom:      boolean
  drawnByName:   string
  drawnByMe:     boolean
}

type QuestionGridProps = {
  cards:          DrawnCard[]
  onOpen?:        (card: DrawnCard) => void
  /** Indices of cards that have received new messages since last opened. */
  unreadIndices?: number[]
}

// ---------------------------------------------------------------------------
// MiniCard
// ---------------------------------------------------------------------------

function MiniCard({
  card,
  index,
  onOpen,
  hasUnread,
}: {
  card:      DrawnCard
  index:     number
  onOpen?:   (card: DrawnCard) => void
  hasUnread: boolean
}) {
  const { isDark }    = useTheme()
  const TIER_CONFIG   = getTierConfig(isDark)
  const [localRevealed, setLocalRevealed] = useState(false)
  const conf          = TIER_CONFIG[card.tier]
  const entranceDelay = `${Math.min(index * 0.06, 0.5)}s`

  function handleTap() {
    if (onOpen) { onOpen(card) }
    else { setLocalRevealed(prev => !prev) }
  }

  const revealed = onOpen ? false : localRevealed

  return (
    <>
      <style>{`
        @keyframes mc-enter   { from{opacity:0;transform:translateY(14px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes mc-flip-in { 0%{transform:rotateY(90deg);opacity:0} 100%{transform:rotateY(0deg);opacity:1} }
        @keyframes mc-unread  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(1.25)} }
        .mc-card       { animation: mc-enter   0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .mc-flip       { animation: mc-flip-in 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .mc-unread-dot { animation: mc-unread  1.4s ease-in-out infinite; }
        .mc-font-serif { font-family:'Cormorant Garamond',Georgia,serif; }
        .mc-font-sans  { font-family:'DM Sans',system-ui,sans-serif; }
      `}</style>

      <div
        className="mc-card relative overflow-hidden rounded-2xl cursor-pointer select-none active:scale-[0.97] transition-transform"
        style={{
          animationDelay: entranceDelay,
          height: 260,
          background: revealed
            ? 'var(--th-surface)'
            : `linear-gradient(150deg, ${conf.midBg} 0%, ${conf.darkBg} 100%)`,
          border:    `1px solid ${conf.border}`,
          boxShadow: `0 4px 24px ${conf.glow}`,
          transition: 'background 0.5s ease, box-shadow 0.5s ease',
        }}
        onClick={handleTap}
      >
        {/* ── Unread message badge ── */}
        {hasUnread && (
          <div
            className="mc-unread-dot"
            style={{
              position:     'absolute',
              top:           10,
              right:         10,
              zIndex:        20,
              width:         11,
              height:        11,
              borderRadius: '50%',
              background:   '#4ade80',
              boxShadow:    '0 0 10px #4ade80, 0 0 20px rgba(74,222,128,0.4)',
              border:       '2px solid var(--th-bg)',
            }}
            title="New message"
          />
        )}

        {/* ── UNREVEALED ── */}
        {!revealed && (
          <>
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: card.tier === 'light'
                ? `repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${conf.primary}08 3deg, transparent 6deg)`
                : card.tier === 'medium'
                ? `radial-gradient(circle at 0% 0%, ${conf.primary}10 0%, transparent 50%), radial-gradient(circle at 100% 100%, ${conf.primary}10 0%, transparent 50%)`
                : card.tier === 'deep'
                ? `repeating-linear-gradient(135deg, ${conf.primary}08 0px, transparent 1px, transparent 14px, ${conf.primary}06 15px)`
                : `repeating-linear-gradient(60deg, ${conf.primary}09 0px, transparent 1px, transparent 10px, ${conf.primary}06 11px)`,
            }}/>
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse at 50% 50%, transparent 35%, ${conf.darkBg}cc 100%)`,
            }}/>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div style={{ opacity: 0.65 }}><MiniTierSymbol tier={card.tier} color={conf.primary}/></div>
              <span className="mc-font-sans" style={{ color:`${conf.primary}80`, fontSize:'0.60rem', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase' }}>
                {conf.label}
              </span>
            </div>
            <div className="mc-font-sans absolute top-3 left-3 right-3 flex items-center justify-between" style={{ gap:4 }}>
              <span style={{ color:`${conf.primary}55`, fontSize:'0.52rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                {card.drawnByMe ? 'you' : card.drawnByName}
              </span>
              {card.isCustom && (
                <span style={{ color:`${conf.primary}70`, fontSize:'0.48rem', fontWeight:600, letterSpacing:'0.10em', textTransform:'uppercase', background:`${conf.primary}10`, border:`1px solid ${conf.primary}22`, borderRadius:99, padding:'1px 6px' }}>
                  custom
                </span>
              )}
            </div>
            {/* Tap hint — show different label when unread */}
            <div className="mc-font-sans absolute bottom-4 left-0 right-0 flex justify-center" style={{ color:`${conf.primary}45`, fontSize:'0.58rem', letterSpacing:'0.08em' }}>
              {hasUnread ? (
                <span style={{ color: '#4ade80', opacity: 0.8 }}>new message · tap to open</span>
              ) : (
                'tap to open'
              )}
            </div>
          </>
        )}

        {/* ── LOCAL REVEAL (fallback — no onOpen) ── */}
        {revealed && (
          <div className="mc-flip absolute inset-0 flex flex-col p-4">
            <div style={{ height:2, borderRadius:1, flexShrink:0, background:`linear-gradient(90deg,${conf.primary},${conf.secondary}55)`, marginBottom:12 }}/>
            <p
              className="mc-font-serif flex-1 overflow-hidden"
              style={{
                color: 'var(--th-fg)',
                fontSize:'0.88rem', fontWeight:500, lineHeight:1.6,
                display:'-webkit-box', WebkitLineClamp:7,
                WebkitBoxOrient:'vertical', overflow:'hidden',
              } as React.CSSProperties}
            >
              {card.questionText}
            </p>
            <div className="mc-font-sans flex items-center justify-between mt-3" style={{ flexShrink:0 }}>
              <span style={{ color:`${conf.primary}70`, fontSize:'0.58rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>{conf.label}</span>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'var(--th-text-4)', fontSize:'0.52rem', letterSpacing:'0.06em' }}>tap to close</span>
                <span style={{ color:'var(--th-text-3)', fontSize:'0.58rem' }}>{card.isCustom ? 'custom' : card.drawnByName}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Mini tier symbol (no ID conflicts with PickModal)
// ---------------------------------------------------------------------------

function MiniTierSymbol({ tier, color }: { tier: QuestionTier; color: string }) {
  const s = 32
  if (tier === 'light') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {[0,60,120,180,240,300].map(deg => <ellipse key={deg} cx="12" cy="12" rx="3.5" ry="8" fill={color} opacity="0.55" transform={`rotate(${deg} 12 12)`}/>)}
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.95"/>
    </svg>
  )
  if (tier === 'medium') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {[10,7,4].map((r,i) => <circle key={r} cx="12" cy="12" r={r} stroke={color} strokeWidth="1" opacity={0.4+i*0.2} fill="none"/>)}
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.95"/>
    </svg>
  )
  if (tier === 'deep') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L21 20 H3 Z" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.18" strokeLinejoin="round" opacity="0.85"/>
      <path d="M12 8 L17 18 H7 Z" fill={color} opacity="0.55"/>
    </svg>
  )
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M14 2 L5 13 H11 L10 22 L19 11 H13 Z" fill={color} opacity="0.80" strokeLinejoin="round"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <>
      <style>{`
        @keyframes es-fade { from{opacity:0} to{opacity:1} }
        .es-root { animation:es-fade 0.5s ease 0.2s both; font-family:'DM Sans',system-ui,sans-serif; }
      `}</style>
      <div className="es-root col-span-2 flex flex-col items-center justify-center py-14 gap-3">
        <div className="relative" style={{ width:52, height:52 }}>
          {[
            { rotate:'-6deg', z:0 },
            { rotate: '0deg', z:1 },
            { rotate: '6deg', z:0 },
          ].map((c,i) => (
            <div key={i} className="absolute inset-0 rounded-xl" style={{
              background: 'var(--th-surface)',
              border: '1px solid var(--th-border-2)',
              transform: `rotate(${c.rotate})`,
              zIndex: c.z,
            }}/>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span style={{ color:'var(--th-text-3)', fontSize:'0.80rem', fontWeight:500 }}>No cards drawn yet</span>
          <span style={{ color:'var(--th-text-4)', fontSize:'0.72rem' }}>The first move changes everything</span>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// QuestionGrid
// ---------------------------------------------------------------------------

export function QuestionGrid({ cards, onOpen, unreadIndices = [] }: QuestionGridProps) {
  const unreadSet = new Set(unreadIndices)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=DM+Sans:wght@400;500&display=swap');
      `}</style>
      <div className="px-4 pb-6">
        {cards.length > 0 && (
          <div className="flex items-center gap-3 mb-4" style={{ fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <span style={{ color:'var(--th-text-3)', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase' }}>
              Drawn this session
            </span>
            <div className="flex-1" style={{ height:'1px', background:'linear-gradient(90deg,var(--th-border-2),transparent)' }}/>
            {unreadIndices.length > 0 && (
              <span style={{
                color:         '#4ade80',
                fontSize:      '0.60rem',
                fontWeight:     600,
                background:    'rgba(74,222,128,0.10)',
                border:        '1px solid rgba(74,222,128,0.22)',
                borderRadius:   99,
                padding:       '2px 8px',
                letterSpacing: '0.06em',
              }}>
                {unreadIndices.length} new
              </span>
            )}
            <span style={{ color:'var(--th-text-4)', fontSize:'0.65rem', fontWeight:500 }}>{cards.length}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {cards.length === 0
            ? <EmptyState/>
            : cards.map((card, idx) => (
                <MiniCard
                  key={card.key}
                  card={card}
                  index={idx}
                  onOpen={onOpen}
                  hasUnread={unreadSet.has(card.questionIndex)}
                />
              ))
          }
        </div>
      </div>
    </>
  )
}