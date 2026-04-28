'use client'

import { useState } from 'react'
import type { QuestionTier } from '@/lib/supabase'
import { TIER_CONFIG } from '@/components/PickModal'

// ---------------------------------------------------------------------------
// Types — exported so page.tsx can build the array correctly.
// questionIndex is required so onOpen can restore the full PickModal state.
// ---------------------------------------------------------------------------

export type DrawnCard = {
  key:           string        // unique render key: `${questionIndex}-${Date.now()}`
  questionIndex: number        // index into room.question_pool — needed for onOpen
  questionText:  string
  tier:          QuestionTier
  isCustom:      boolean
  drawnByName:   string
  drawnByMe:     boolean       // true when the local player drew this card
}

type QuestionGridProps = {
  cards:    DrawnCard[]
  /**
   * When provided, tapping a mini card calls onOpen(card) and opens the
   * full PickModal rather than doing an inline local reveal.
   * page.tsx always provides this so both players get the modal experience
   * and can re-open any past card.
   */
  onOpen?:  (card: DrawnCard) => void
}

// ---------------------------------------------------------------------------
// Individual mini card
// ---------------------------------------------------------------------------

function MiniCard({
  card,
  index,
  onOpen,
}: {
  card:    DrawnCard
  index:   number
  onOpen?: (card: DrawnCard) => void
}) {
  // Local reveal is only used when onOpen is NOT provided (fallback).
  const [localRevealed, setLocalRevealed] = useState(false)
  const conf          = TIER_CONFIG[card.tier]
  const entranceDelay = `${Math.min(index * 0.06, 0.5)}s`

  function handleTap() {
    if (onOpen) {
      onOpen(card)
    } else {
      setLocalRevealed(prev => !prev)
    }
  }

  const revealed = onOpen ? false : localRevealed

  return (
    <>
      <style>{`
        @keyframes mc-enter {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes mc-flip-in {
          0%   { transform: rotateY(90deg);  opacity: 0; }
          100% { transform: rotateY(0deg);   opacity: 1; }
        }
        .mc-card      { animation: mc-enter   0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .mc-flip      { animation: mc-flip-in 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .mc-font-serif{ font-family: 'Cormorant Garamond', Georgia, serif; }
        .mc-font-sans { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>

      <div
        className="mc-card relative overflow-hidden rounded-2xl cursor-pointer select-none active:scale-[0.97] transition-transform"
        style={{
          animationDelay: entranceDelay,
          height: 260,
          background: revealed
            ? 'linear-gradient(160deg, #0b0c12 0%, #080810 100%)'
            : `linear-gradient(150deg, ${conf.midBg} 0%, ${conf.darkBg} 100%)`,
          border:    `1px solid ${conf.border}`,
          boxShadow: revealed
            ? `0 4px 20px ${conf.glow}`
            : `0 4px 24px ${conf.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
          transition: 'background 0.5s ease, box-shadow 0.5s ease',
        }}
        onClick={handleTap}
      >

        {/* ── UNREVEALED STATE ── */}
        {!revealed && (
          <>
            {/* Mini CSS gradient pattern */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: card.tier === 'light'
                ? `repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${conf.primary}08 3deg, transparent 6deg)`
                : card.tier === 'medium'
                ? `radial-gradient(circle at 0% 0%, ${conf.primary}10 0%, transparent 50%), radial-gradient(circle at 100% 100%, ${conf.primary}10 0%, transparent 50%)`
                : card.tier === 'deep'
                ? `repeating-linear-gradient(135deg, ${conf.primary}08 0px, transparent 1px, transparent 14px, ${conf.primary}06 15px)`
                : `repeating-linear-gradient(60deg, ${conf.primary}09 0px, transparent 1px, transparent 10px, ${conf.primary}06 11px)`,
            }} />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse at 50% 50%, transparent 35%, ${conf.darkBg}cc 100%)`,
            }} />

            {/* Center: tier symbol + label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div style={{ opacity: 0.65 }}>
                <MiniTierSymbol tier={card.tier} color={conf.primary} />
              </div>
              <span
                className="mc-font-sans"
                style={{
                  color:         `${conf.primary}80`,
                  fontSize:      '0.60rem',
                  fontWeight:    600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {conf.label}
              </span>
            </div>

            {/* Attribution chip */}
            <div
              className="mc-font-sans absolute top-3 left-3 right-3 flex items-center justify-between"
              style={{ gap: 4 }}
            >
              <span style={{
                color:         `${conf.primary}55`,
                fontSize:      '0.52rem',
                fontWeight:    600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {card.drawnByMe ? 'you' : card.drawnByName}
              </span>
              {card.isCustom && (
                <span style={{
                  color:        `${conf.primary}70`,
                  fontSize:     '0.48rem',
                  fontWeight:   600,
                  letterSpacing:'0.10em',
                  textTransform:'uppercase',
                  background:   `${conf.primary}10`,
                  border:       `1px solid ${conf.primary}22`,
                  borderRadius:  99,
                  padding:      '1px 6px',
                }}>
                  custom
                </span>
              )}
            </div>

            {/* Tap hint */}
            <div
              className="mc-font-sans absolute bottom-4 left-0 right-0 flex justify-center"
              style={{ color: `${conf.primary}45`, fontSize: '0.58rem', letterSpacing: '0.08em' }}
            >
              tap to open
            </div>
          </>
        )}

        {/* ── LOCAL REVEAL (fallback only — used when onOpen is not provided) ── */}
        {revealed && (
          <div className="mc-flip absolute inset-0 flex flex-col p-4">
            <div style={{
              height: 2, borderRadius: 1, flexShrink: 0,
              background: `linear-gradient(90deg, ${conf.primary}, ${conf.secondary ?? conf.primary}55)`,
              marginBottom: 12,
            }} />
            <p
              className="mc-font-serif flex-1 overflow-hidden"
              style={{
                color:              '#dde4ed',
                fontSize:           '0.88rem',
                fontWeight:         500,
                lineHeight:         1.6,
                display:            '-webkit-box',
                WebkitLineClamp:    7,
                WebkitBoxOrient:    'vertical',
                overflow:           'hidden',
              } as React.CSSProperties}
            >
              {card.questionText}
            </p>
            <div className="mc-font-sans flex items-center justify-between mt-3" style={{ flexShrink: 0 }}>
              <span style={{ color: `${conf.primary}70`, fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {conf.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#1e2535', fontSize: '0.52rem', letterSpacing: '0.06em' }}>
                  tap to close
                </span>
                <span style={{ color: '#334155', fontSize: '0.58rem' }}>
                  {card.isCustom ? 'custom' : card.drawnByName}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Minimal inline SVG per tier — no ID conflicts
function MiniTierSymbol({ tier, color }: { tier: QuestionTier; color: string }) {
  const s = 32
  if (tier === 'light') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <ellipse key={deg} cx="12" cy="12" rx="3.5" ry="8" fill={color} opacity="0.55" transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.95" />
    </svg>
  )
  if (tier === 'medium') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {[10, 7, 4].map((r, i) => (
        <circle key={r} cx="12" cy="12" r={r} stroke={color} strokeWidth="1" opacity={0.4 + i * 0.2} fill="none" />
      ))}
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.95" />
    </svg>
  )
  if (tier === 'deep') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L21 20 H3 Z" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.18" strokeLinejoin="round" opacity="0.85" />
      <path d="M12 8 L17 18 H7 Z" fill={color} opacity="0.55" />
    </svg>
  )
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M14 2 L5 13 H11 L10 22 L19 11 H13 Z" fill={color} opacity="0.80" strokeLinejoin="round" />
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
        @keyframes es-fade { from { opacity: 0 } to { opacity: 1 } }
        .es-root { animation: es-fade 0.5s ease 0.2s both; font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>
      <div className="es-root col-span-2 flex flex-col items-center justify-center py-14 gap-3">
        <div className="relative" style={{ width: 52, height: 52 }}>
          {[
            { bg: '#0f172a', border: 'rgba(255,255,255,0.06)', rotate: '-6deg', z: 0 },
            { bg: '#111827', border: 'rgba(255,255,255,0.08)', rotate:  '0deg', z: 1 },
            { bg: '#1e293b', border: 'rgba(255,255,255,0.10)', rotate:  '6deg', z: 0 },
          ].map((card, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-xl"
              style={{
                background: card.bg,
                border:     `1px solid ${card.border}`,
                transform:  `rotate(${card.rotate})`,
                zIndex:     card.z,
              }}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span style={{ color: '#334155', fontSize: '0.80rem', fontWeight: 500 }}>
            No cards drawn yet
          </span>
          <span style={{ color: '#1e293b', fontSize: '0.72rem' }}>
            The first move changes everything
          </span>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// QuestionGrid
// ---------------------------------------------------------------------------

export function QuestionGrid({ cards, onOpen }: QuestionGridProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=DM+Sans:wght@400;500&display=swap');
      `}</style>

      <div className="px-4 pb-6">
        {cards.length > 0 && (
          <div
            className="flex items-center gap-3 mb-4"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            <span style={{
              color:         '#334155',
              fontSize:      '0.65rem',
              fontWeight:    600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>
              Drawn this session
            </span>
            <div
              className="flex-1"
              style={{ height: '1px', background: 'linear-gradient(90deg, rgba(51,65,85,0.6), transparent)' }}
            />
            <span style={{ color: '#1e293b', fontSize: '0.65rem', fontWeight: 500 }}>
              {cards.length}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {cards.length === 0
            ? <EmptyState />
            : cards.map((card, idx) => (
                <MiniCard
                  key={card.key}
                  card={card}
                  index={idx}
                  onOpen={onOpen}
                />
              ))
          }
        </div>
      </div>
    </>
  )
}