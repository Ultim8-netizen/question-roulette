'use client'

import { useState } from 'react'
import type { QuestionTier } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Tier visual configuration
// Exported so QuestionGrid can consume colors without re-defining them.
// ---------------------------------------------------------------------------

export const TIER_CONFIG = {
  light: {
    label:     'Light',
    tagline:   'Easy terrain',
    primary:   '#4ade80',
    secondary: '#15803d',
    darkBg:    '#040d07',
    midBg:     '#071a0f',
    textLight: '#bbf7d0',
    border:    'rgba(74,222,128,0.22)',
    glow:      'rgba(74,222,128,0.16)',
  },
  medium: {
    label:     'Medium',
    tagline:   'Going deeper',
    primary:   '#60a5fa',
    secondary: '#1d4ed8',
    darkBg:    '#020815',
    midBg:     '#050f24',
    textLight: '#bfdbfe',
    border:    'rgba(96,165,250,0.22)',
    glow:      'rgba(96,165,250,0.16)',
  },
  deep: {
    label:     'Deep',
    tagline:   'Raw territory',
    primary:   '#f87171',
    secondary: '#991b1b',
    darkBg:    '#0e0202',
    midBg:     '#1c0404',
    textLight: '#fecaca',
    border:    'rgba(248,113,113,0.22)',
    glow:      'rgba(248,113,113,0.16)',
  },
  spicy: {
    label:     'Spicy',
    tagline:   'No going back',
    primary:   '#c084fc',
    secondary: '#6b21a8',
    darkBg:    '#070012',
    midBg:     '#0f0120',
    textLight: '#e9d5ff',
    border:    'rgba(192,132,252,0.22)',
    glow:      'rgba(192,132,252,0.16)',
  },
} satisfies Record<QuestionTier, {
  label: string; tagline: string; primary: string; secondary: string;
  darkBg: string; midBg: string; textLight: string; border: string; glow: string;
}>

// ---------------------------------------------------------------------------
// SVG card-back patterns  — each with a distinct artistic identity
// ---------------------------------------------------------------------------

// Light | "Botanica"
// Six-petal flower with radiating ellipses at 60° offsets. Organic, alive.
function BotanicaPattern({ color }: { color: string }) {
  const angles = [0, 60, 120, 180, 240, 300]
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="p-botanica" x="0" y="0" width="52" height="52" patternUnits="userSpaceOnUse">
          {/* Petal ellipses */}
          {angles.map(deg => (
            <ellipse
              key={deg}
              cx="26" cy="26" rx="7.5" ry="17"
              fill="none"
              stroke={color}
              strokeWidth="0.65"
              opacity="0.26"
              transform={`rotate(${deg} 26 26)`}
            />
          ))}
          {/* Pistil dot */}
          <circle cx="26" cy="26" r="1.8" fill={color} opacity="0.32" />
          {/* Fine outer ring */}
          <circle cx="26" cy="26" r="20" fill="none" stroke={color} strokeWidth="0.4" opacity="0.12" />
          {/* Corner accent */}
          {[0, 52].flatMap(x => [0, 52].map(y => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill={color} opacity="0.14" />
          )))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#p-botanica)" />
    </svg>
  )
}

// Medium | "Tidal"
// Concentric rings emanating from two sources: top-left corner and center-right.
// Their interference creates a wave moiré that suggests depth accumulating.
function TidalPattern({ color }: { color: string }) {
  const ringsA = [10, 20, 30, 40, 50, 60, 70]
  const ringsB = [8, 18, 28, 38, 48, 58]
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="p-tidal" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
          {/* Source A: corner origin */}
          {ringsA.map(r => (
            <circle key={`a${r}`} cx="0" cy="0" r={r}
              fill="none" stroke={color} strokeWidth="0.55" opacity="0.20" />
          ))}
          {/* Source B: opposite corner, creates interference bands */}
          {ringsB.map(r => (
            <circle key={`b${r}`} cx="70" cy="70" r={r}
              fill="none" stroke={color} strokeWidth="0.55" opacity="0.20" />
          ))}
          {/* Tertiary faint rings from center */}
          {[15, 35].map(r => (
            <circle key={`c${r}`} cx="35" cy="35" r={r}
              fill="none" stroke={color} strokeWidth="0.3" opacity="0.10" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#p-tidal)" />
    </svg>
  )
}

// Deep | "Seismic"
// An irregular network of fault lines and secondary fractures.
// Suggests cracked earth, geological tension, depth below the surface.
function SeismicPattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="p-seismic" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
          {/* Primary fault network */}
          <path d="M0 38 L16 24 L38 42 L54 18 L90 32"
            fill="none" stroke={color} strokeWidth="0.85" opacity="0.30" strokeLinejoin="round"/>
          <path d="M0 72 L24 58 L45 78 L66 52 L90 68"
            fill="none" stroke={color} strokeWidth="0.85" opacity="0.26" strokeLinejoin="round"/>
          {/* Secondary fractures branching off primaries */}
          <path d="M16 24 L16 0"   fill="none" stroke={color} strokeWidth="0.45" opacity="0.18" />
          <path d="M38 42 L38 90"  fill="none" stroke={color} strokeWidth="0.45" opacity="0.18" />
          <path d="M54 18 L54 0"   fill="none" stroke={color} strokeWidth="0.45" opacity="0.18" />
          <path d="M24 58 L24 90"  fill="none" stroke={color} strokeWidth="0.45" opacity="0.18" />
          <path d="M66 52 L90 52"  fill="none" stroke={color} strokeWidth="0.45" opacity="0.18" />
          {/* Micro-cracks */}
          <path d="M8 10 L20 18 L12 30"   fill="none" stroke={color} strokeWidth="0.35" opacity="0.13" strokeLinejoin="round"/>
          <path d="M62 62 L78 55 L82 72"  fill="none" stroke={color} strokeWidth="0.35" opacity="0.13" strokeLinejoin="round"/>
          <path d="M70 10 L80 22 L68 28"  fill="none" stroke={color} strokeWidth="0.35" opacity="0.12" strokeLinejoin="round"/>
          {/* Stress dots at major junctions */}
          {[[16,24],[38,42],[54,18],[24,58],[66,52]].map(([cx,cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill={color} opacity="0.28" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#p-seismic)" />
    </svg>
  )
}

// Spicy | "Voltage"
// A tessellated lightning chevron. Each row slightly offset to imply
// an electric charge rippling through the card face.
function VoltagePattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="p-voltage" x="0" y="0" width="44" height="22" patternUnits="userSpaceOnUse">
          {/* Primary bold zigzag */}
          <polyline
            points="0,11 11,2 22,11 33,2 44,11"
            fill="none" stroke={color} strokeWidth="0.9" opacity="0.30"
            strokeLinejoin="bevel"
          />
          {/* Shadow echo below */}
          <polyline
            points="0,19 11,10 22,19 33,10 44,19"
            fill="none" stroke={color} strokeWidth="0.5" opacity="0.16"
            strokeLinejoin="bevel"
          />
          {/* Vertical spark connectors at peaks */}
          <line x1="11" y1="2"  x2="11" y2="11" stroke={color} strokeWidth="0.4" opacity="0.14" />
          <line x1="33" y1="2"  x2="33" y2="11" stroke={color} strokeWidth="0.4" opacity="0.14" />
          <line x1="22" y1="11" x2="22" y2="19" stroke={color} strokeWidth="0.4" opacity="0.14" />
          {/* Peak accent dots */}
          <circle cx="11" cy="2"  r="1.2" fill={color} opacity="0.26" />
          <circle cx="33" cy="2"  r="1.2" fill={color} opacity="0.26" />
          <circle cx="22" cy="11" r="1.2" fill={color} opacity="0.20" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#p-voltage)" />
    </svg>
  )
}

const PATTERNS: Record<QuestionTier, React.FC<{ color: string }>> = {
  light:  BotanicaPattern,
  medium: TidalPattern,
  deep:   SeismicPattern,
  spicy:  VoltagePattern,
}

// ---------------------------------------------------------------------------
// Tier symbols — shown at center of card face and on revealed card footer
// ---------------------------------------------------------------------------

function TierSymbol({ tier, color, size }: { tier: QuestionTier; color: string; size: number }) {
  const s = size
  if (tier === 'light') return (
    // Three-petal organic flower
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="12" rx="4" ry="9" fill={color} opacity="0.75" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="4" ry="9" fill={color} opacity="0.60" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="4" ry="9" fill={color} opacity="0.60" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="2.5" fill={color} opacity="0.95" />
    </svg>
  )
  if (tier === 'medium') return (
    // Concentric target rings
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.2" opacity="0.50" />
      <circle cx="12" cy="12" r="7"  stroke={color} strokeWidth="1.2" opacity="0.65" />
      <circle cx="12" cy="12" r="4"  stroke={color} strokeWidth="1.2" opacity="0.80" />
      <circle cx="12" cy="12" r="1.8" fill={color} opacity="0.95" />
    </svg>
  )
  if (tier === 'deep') return (
    // Mountain / upward triangle suggesting descent
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L21 20 H3 Z" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.18" strokeLinejoin="round" opacity="0.85"/>
      <path d="M12 8 L17 18 H7 Z"  fill={color} opacity="0.55" />
      <circle cx="12" cy="8" r="1.5" fill={color} opacity="0.95" />
    </svg>
  )
  // spicy: lightning bolt
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M14 2 L5 13 H11 L10 22 L19 11 H13 Z"
        fill={color} opacity="0.80"
        stroke={color} strokeWidth="0.5" strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// PickModal
// ---------------------------------------------------------------------------

type PickModalProps = {
  questionText: string
  tier:         QuestionTier
  isCustom:     boolean
  drawnByName:  string
  isMyDraw:     boolean
  onClose:      () => void
}

export function PickModal({
  questionText,
  tier,
  isCustom,
  drawnByName,
  isMyDraw,
  onClose,
}: PickModalProps) {
  const [revealed, setReveal] = useState(false)
  const conf    = TIER_CONFIG[tier]
  const Pattern = PATTERNS[tier]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes pm-backdrop  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pm-rise {
          from { opacity: 0; transform: translateY(48px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes pm-shimmer {
          0%   { transform: translateX(-120%) skewX(-12deg); opacity: 0;   }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(280%)  skewX(-12deg); opacity: 0;   }
        }
        @keyframes pm-tap-float {
          0%, 100% { transform: translateY(0);   opacity: 0.55; }
          50%       { transform: translateY(-3px); opacity: 0.85; }
        }
        @keyframes pm-text-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pm-bar-in {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes pm-btn-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        .pm-backdrop { animation: pm-backdrop 0.28s ease both; }
        .pm-rise     { animation: pm-rise     0.50s cubic-bezier(0.22,1.20,0.36,1) both; }
        .pm-shimmer  { animation: pm-shimmer  2.2s ease-in-out 0.4s both; }
        .pm-tap-hint { animation: pm-tap-float 2.0s ease-in-out 1.0s infinite; }
        .pm-text-in  { animation: pm-text-in  0.45s ease 0.08s both; }
        .pm-bar-in   { animation: pm-bar-in   0.50s cubic-bezier(0.22,1,0.36,1) 0.05s both; transform-origin: left; }
        .pm-btn-in   { animation: pm-btn-in   0.35s ease both; }

        .pm-font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .pm-font-sans  { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>

      {/* Backdrop */}
      <div
        className="pm-backdrop pm-font-sans fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
        style={{ background: 'rgba(2,2,6,0.88)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => {
          if (revealed && e.target === e.currentTarget) onClose()
        }}
      >
        <div className="pm-rise w-full" style={{ maxWidth: 390 }}>

          {/* Attribution header */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-2">
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: conf.primary,
                boxShadow: `0 0 8px ${conf.primary}`,
              }} />
              <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 400 }}>
                {isMyDraw ? 'Your card' : `${drawnByName}'s card`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isCustom && (
                <span
                  style={{
                    fontSize: '0.68rem', fontWeight: 500,
                    padding: '2px 8px', borderRadius: 99,
                    background: `${conf.primary}14`,
                    border: `1px solid ${conf.border}`,
                    color: conf.primary, letterSpacing: '0.06em',
                  }}
                >
                  CUSTOM
                </span>
              )}
              <span
                style={{
                  fontSize: '0.68rem', fontWeight: 600,
                  padding: '2px 10px', borderRadius: 99,
                  background: `${conf.primary}12`,
                  border: `1px solid ${conf.border}`,
                  color: conf.primary,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                }}
              >
                {conf.label}
              </span>
            </div>
          </div>

          {/* The card — 3D flip container */}
          <div style={{ height: 340, perspective: '1400px' }}>
            <div
              style={{
                position: 'absolute', inset: 0,
                transformStyle:   'preserve-3d',
                transition: 'transform 0.72s cubic-bezier(0.4,0.0,0.2,1)',
                transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                cursor: revealed ? 'default' : 'pointer',
                borderRadius: 22,
                width: '100%',
                height: 340,
              }}
              onClick={() => { if (!revealed) setReveal(true) }}
            >

              {/* ═══ FRONT FACE — blank, artistic ═══ */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  borderRadius: 22,
                  backfaceVisibility:       'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  background: `linear-gradient(150deg, ${conf.midBg} 0%, ${conf.darkBg} 100%)`,
                  border: `1.5px solid ${conf.border}`,
                  boxShadow: `0 24px 64px ${conf.glow}, 0 0 0 1px rgba(255,255,255,0.03)`,
                }}
              >
                {/* Artistic tier pattern */}
                <Pattern color={conf.primary} />

                {/* Inner vignette — pulls focus to center */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, ${conf.darkBg}e0 100%)`,
                }} />

                {/* One-pass shimmer sweep on mount */}
                <div className="pm-shimmer absolute pointer-events-none" style={{
                  top: 0, bottom: 0,
                  width: '45%',
                  background: `linear-gradient(90deg, transparent, ${conf.primary}16, transparent)`,
                }} />

                {/* Top-left corner ornament */}
                <div className="absolute top-5 left-5" style={{ opacity: 0.38 }}>
                  <TierSymbol tier={tier} color={conf.primary} size={18} />
                </div>
                {/* Bottom-right corner ornament (rotated) */}
                <div className="absolute bottom-5 right-5" style={{ opacity: 0.38, transform: 'rotate(180deg)' }}>
                  <TierSymbol tier={tier} color={conf.primary} size={18} />
                </div>

                {/* Center: large symbol + tagline */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                  <div style={{ opacity: 0.72 }}>
                    <TierSymbol tier={tier} color={conf.primary} size={52} />
                  </div>
                  <span
                    className="pm-font-serif"
                    style={{
                      color: `${conf.primary}90`,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      fontStyle: 'italic',
                    }}
                  >
                    {conf.tagline}
                  </span>
                </div>

                {/* Tap hint floats at bottom */}
                <div className="pm-tap-hint absolute bottom-0 left-0 right-0 flex justify-center pb-6 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M9 10V6a3 3 0 0 1 6 0v4" stroke={conf.primary} strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
                      <path d="M12 14v3" stroke={conf.primary} strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                      <rect x="5" y="10" width="14" height="12" rx="3" stroke={conf.primary} strokeWidth="1.5" opacity="0.55"/>
                    </svg>
                    <span
                      className="pm-font-sans"
                      style={{ color: `${conf.primary}70`, fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.08em' }}
                    >
                      tap to reveal
                    </span>
                  </div>
                </div>
              </div>

              {/* ═══ BACK FACE — question text ═══ */}
              <div
                className="absolute inset-0 flex flex-col"
                style={{
                  borderRadius: 22,
                  backfaceVisibility:       'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(160deg, #0b0c12 0%, #080810 100%)',
                  border: `1.5px solid ${conf.border}`,
                  boxShadow: `0 24px 64px ${conf.glow}, 0 0 0 1px rgba(255,255,255,0.03)`,
                  padding: '28px 26px 24px',
                }}
              >
                {/* Accent bar */}
                <div
                  className="pm-bar-in"
                  style={{
                    height: 3,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${conf.primary}, ${conf.secondary}88)`,
                    marginBottom: 24,
                    flexShrink: 0,
                  }}
                />

                {/* Question text — Cormorant Garamond for gravitas */}
                <div className="pm-text-in flex-1 flex items-center">
                  <p
                    className="pm-font-serif"
                    style={{
                      color: '#f0f4f8',
                      fontSize: '1.22rem',
                      fontWeight: 500,
                      lineHeight: 1.62,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {questionText}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4" style={{ flexShrink: 0 }}>
                  <div className="flex items-center gap-2">
                    <TierSymbol tier={tier} color={conf.primary} size={14} />
                    <span
                      className="pm-font-sans"
                      style={{
                        color: `${conf.primary}70`,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {conf.label}
                    </span>
                  </div>
                  {isCustom && (
                    <span className="pm-font-sans" style={{ color: '#334155', fontSize: '0.68rem' }}>
                      custom question
                    </span>
                  )}
                </div>
              </div>

            </div>{/* end flip inner */}
          </div>{/* end perspective wrapper */}

          {/* Done button — appears after reveal */}
          {revealed && (
            <button
              className="pm-btn-in pm-font-sans mt-4 w-full rounded-2xl text-sm font-medium tracking-wide transition-opacity active:opacity-60"
              style={{
                padding: '15px 0',
                background: `linear-gradient(135deg, ${conf.midBg}, ${conf.darkBg})`,
                border: `1px solid ${conf.border}`,
                color: conf.textLight,
                letterSpacing: '0.04em',
              }}
              onClick={onClose}
            >
              Done
            </button>
          )}

        </div>
      </div>
    </>
  )
}