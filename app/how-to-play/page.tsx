// app/how-to-play/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Exportable overlay — used by homepage for first-visit onboarding.
// When `onClose` is provided the component renders as a full-screen overlay
// with a dismiss button. When rendered as a standalone page (direct route),
// onClose is undefined and a back-link is shown instead.
// ---------------------------------------------------------------------------

export type HowToPlayOverlayProps = {
  onClose?: () => void
}

type Tab = 'steps' | 'tiers' | 'faq'

// ---------------------------------------------------------------------------
// Sigil
// ---------------------------------------------------------------------------

function AbyssSignil({ size = 10, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 32 32"
      fill="none" aria-hidden="true"
      style={{ opacity, flexShrink: 0 }}
    >
      <circle cx="16" cy="16" r="9" stroke="var(--th-brand)" strokeWidth="1.4"
        strokeDasharray="22 6" strokeDashoffset="3" />
      <line x1="16" y1="4" x2="16" y2="28" stroke="var(--th-brand)"
        strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill="var(--th-brand)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Step
// ---------------------------------------------------------------------------

function Step({
  number, title, body, hint, flow, active,
}: {
  number: number
  title: string
  body: React.ReactNode
  hint?: React.ReactNode
  flow?: string[]
  active?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: 28, position: 'relative' }}>
      {/* Connector line */}
      <div style={{
        position: 'absolute', left: 13, top: 30, bottom: 0, width: 1,
        background: 'linear-gradient(to bottom, var(--th-border-2) 0%, transparent 100%)',
      }} />

      {/* Number badge */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        border: active ? '1.5px solid var(--th-border-2)' : '1px solid var(--th-border)',
        background: active ? 'var(--th-surface-2)' : 'var(--th-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? 'var(--th-text-1)' : 'var(--th-text-3)',
        fontSize: '0.66rem', fontWeight: 700,
        fontFamily: 'var(--font-brand-mono)',
        letterSpacing: '0.04em', zIndex: 1,
        transition: 'all 0.2s ease',
      }}>
        {number}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingTop: 3 }}>
        <h3 style={{
          fontFamily: 'var(--font-brand-serif)',
          color: 'var(--th-text-1)',
          fontSize: '1.05rem', fontWeight: 600,
          lineHeight: 1.3, marginBottom: 6,
        }}>
          {title}
        </h3>
        <div style={{
          fontFamily: 'var(--font-brand-sans)',
          color: 'var(--th-text-3)',
          fontSize: '0.82rem', lineHeight: 1.75,
        }}>
          {body}
        </div>

        {flow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, flexWrap: 'wrap' }}>
            {flow.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  fontFamily: 'var(--font-brand-sans)',
                  fontSize: '0.66rem', fontWeight: 500,
                  color: 'var(--th-text-3)',
                  background: 'var(--th-surface)',
                  border: '1px solid var(--th-border)',
                  borderRadius: 8, padding: '3px 9px',
                }}>
                  {s}
                </span>
                {i < flow.length - 1 && (
                  <span style={{ color: 'var(--th-text-4)', fontSize: '0.65rem' }}>→</span>
                )}
              </div>
            ))}
          </div>
        )}

        {hint && (
          <div style={{
            marginTop: 10, padding: '10px 13px',
            background: 'var(--th-surface)',
            border: '1px solid var(--th-border)',
            borderRadius: 10, display: 'flex', gap: 8,
          }}>
            <div style={{
              width: 4, height: 4, borderRadius: '50%',
              background: 'var(--th-text-3)',
              flexShrink: 0, marginTop: 6,
            }} />
            <div style={{
              fontFamily: 'var(--font-brand-sans)',
              color: 'var(--th-text-3)',
              fontSize: '0.74rem', lineHeight: 1.65,
            }}>
              {hint}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier card
// ---------------------------------------------------------------------------

const TIER_COLORS: Record<string, string> = {
  light:  'var(--tier-light)',
  medium: 'var(--tier-medium)',
  deep:   'var(--tier-deep)',
  spicy:  'var(--tier-spicy)',
}

function TierCard({
  name, colorKey, tagline, description, examples, symbol,
}: {
  name: string
  colorKey: string
  tagline: string
  description: string
  examples: string[]
  symbol: React.ReactNode
}) {
  const color = TIER_COLORS[colorKey]
  return (
    <div style={{
      background: 'var(--th-surface)',
      border: `1px solid var(--th-border)`,
      borderRadius: 18, padding: '18px 16px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ opacity: 0.80 }}>{symbol}</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-brand-sans)',
            color, fontSize: '0.60rem', fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 1,
          }}>
            {name}
          </div>
          <div style={{
            fontFamily: 'var(--font-brand-serif)',
            color: 'var(--th-text-2)', fontSize: '0.86rem', fontStyle: 'italic',
          }}>
            {tagline}
          </div>
        </div>
      </div>

      <p style={{
        fontFamily: 'var(--font-brand-sans)',
        color: 'var(--th-text-3)', fontSize: '0.78rem',
        lineHeight: 1.65, margin: 0,
      }}>
        {description}
      </p>

      <div style={{ height: 1, background: 'var(--th-border)' }} />

      <div>
        <div style={{
          fontFamily: 'var(--font-brand-sans)',
          color: 'var(--th-text-4)', fontSize: '0.56rem', fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 7,
        }}>
          Sample questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {examples.map((ex, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-brand-serif)',
              color: 'var(--th-text-3)', fontSize: '0.82rem',
              fontStyle: 'italic', lineHeight: 1.5,
              paddingLeft: 10, borderLeft: `1.5px solid var(--th-border-2)`,
            }}>
              &ldquo;{ex}&rdquo;
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FAQ entry
// ---------------------------------------------------------------------------

function FAQ({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--th-border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '15px 0', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-brand-sans)',
          color: open ? 'var(--th-text-2)' : 'var(--th-text-3)',
          fontSize: '0.83rem', fontWeight: 500, lineHeight: 1.5,
          transition: 'color 0.2s ease',
        }}>
          {q}
        </span>
        <span style={{
          color: open ? 'var(--tier-light)' : 'var(--th-text-4)',
          fontSize: '1rem', flexShrink: 0,
          transition: 'transform 0.2s ease, color 0.2s ease',
          transform: open ? 'rotate(45deg)' : 'none',
          display: 'inline-block', lineHeight: 1,
        }}>
          +
        </span>
      </button>
      {open && (
        <div style={{
          fontFamily: 'var(--font-brand-sans)',
          color: 'var(--th-text-3)', fontSize: '0.79rem',
          lineHeight: 1.72, paddingBottom: 14, paddingRight: 20,
        }}>
          {a}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier symbols
// ---------------------------------------------------------------------------

function LightSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <ellipse key={deg} cx="12" cy="12" rx="3.5" ry="8"
          fill="var(--tier-light)" opacity="0.55"
          transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2" fill="var(--tier-light)" opacity="0.95" />
    </svg>
  )
}
function MediumSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {[10, 7, 4].map((r, i) => (
        <circle key={r} cx="12" cy="12" r={r} stroke="var(--tier-medium)"
          strokeWidth="1" opacity={0.4 + i * 0.2} fill="none" />
      ))}
      <circle cx="12" cy="12" r="1.5" fill="var(--tier-medium)" opacity="0.95" />
    </svg>
  )
}
function DeepSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L21 20 H3 Z" stroke="var(--tier-deep)" strokeWidth="1.2"
        fill="var(--tier-deep)" fillOpacity="0.18" strokeLinejoin="round" opacity="0.85" />
      <path d="M12 8 L17 18 H7 Z" fill="var(--tier-deep)" opacity="0.55" />
    </svg>
  )
}
function SpicySymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 2 L5 13 H11 L10 22 L19 11 H13 Z"
        fill="var(--tier-spicy)" opacity="0.80" strokeLinejoin="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main component — works as standalone page AND importable overlay
// ---------------------------------------------------------------------------

export default function HowToPlayPage({ onClose }: HowToPlayOverlayProps) {
  const [tab, setTab] = useState<Tab>('steps')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'steps', label: 'How it works' },
    { id: 'tiers', label: 'The four tiers' },
    { id: 'faq',   label: 'Questions' },
  ]

  const isOverlay = !!onClose

  return (
    <>
      <style>{`
        @keyframes htp-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes htp-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes htp-sigil {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.9;  }
        }

        .htp-root  { animation: htp-in   0.48s cubic-bezier(0.22,1,0.36,1) both; }
        .htp-fade  { animation: htp-fade 0.32s ease both; }
        .htp-sigil { animation: htp-sigil 3.5s ease-in-out infinite; }

        .htp-tab {
          background: none;
          border: 1px solid var(--th-border);
          border-radius: 10px;
          padding: 7px 14px;
          font-family: var(--font-brand-sans);
          font-size: 0.76rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
          color: var(--th-text-4);
        }
        .htp-tab:hover {
          border-color: var(--th-border-2);
          color: var(--th-text-2);
        }
        .htp-tab.active {
          background: var(--th-surface-2);
          border-color: var(--th-border-2);
          color: var(--th-text-1);
        }

        .htp-cta {
          width: 100%;
          padding: 16px 0;
          border-radius: 16px;
          background: var(--th-surface);
          border: 1px solid var(--th-border-2);
          color: var(--th-text-1);
          font-family: var(--font-brand-sans);
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .htp-cta:hover {
          background: var(--th-surface-2);
        }

        .htp-scroll::-webkit-scrollbar { width: 3px; }
        .htp-scroll::-webkit-scrollbar-track { background: transparent; }
        .htp-scroll::-webkit-scrollbar-thumb {
          background: var(--th-border-2);
          border-radius: 99px;
        }
      `}</style>

      {/* Overlay wrapper — only added when used as onboarding modal */}
      <div
        className={isOverlay ? 'htp-fade' : ''}
        style={isOverlay ? {
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'var(--th-overlay)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 0 0 0',
          overflowY: 'auto',
        } : {}}
      >
        <main
          className="htp-root"
          style={{
            width: '100%',
            maxWidth: 480,
            minHeight: isOverlay ? undefined : '100dvh',
            maxHeight: isOverlay ? '96dvh' : undefined,
            background: 'var(--th-bg)',
            color: 'var(--th-fg)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isOverlay ? '24px 24px 0 0' : 0,
            border: isOverlay ? '1px solid var(--th-border-2)' : 'none',
            borderBottom: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Drag handle — overlay only */}
          {isOverlay && (
            <div style={{
              display: 'flex', justifyContent: 'center',
              paddingTop: 14, paddingBottom: 4, flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 4, borderRadius: 2,
                background: 'var(--th-border-2)',
              }} />
            </div>
          )}

          {/* Scrollable content */}
          <div
            className="htp-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isOverlay ? '8px 0 0' : '0',
            }}
          >
            {/* ── Header ── */}
            <div style={{ padding: '20px 20px 0' }}>

              {/* Nav row */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 24,
              }}>
                {isOverlay ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="htp-sigil">
                      <AbyssSignil size={14} opacity={1} />
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-brand-mono)',
                      fontSize: '0.58rem', color: 'var(--th-text-4)',
                      letterSpacing: '0.18em', textTransform: 'lowercase',
                    }}>
                      abyssprotocol
                    </span>
                  </div>
                ) : (
                  <Link
                    href="/"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      textDecoration: 'none', color: 'var(--th-text-4)',
                      fontSize: '0.70rem',
                      fontFamily: 'var(--font-brand-sans)',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--th-text-3)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--th-text-4)')}
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M9 2L4 7l5 5" stroke="currentColor"
                        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    back
                  </Link>
                )}

                {!isOverlay && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AbyssSignil size={13} opacity={0.5} />
                    <span style={{
                      fontFamily: 'var(--font-brand-mono)',
                      fontSize: '0.58rem', color: 'var(--th-text-4)',
                      letterSpacing: '0.18em', textTransform: 'lowercase',
                    }}>
                      abyssprotocol
                    </span>
                  </div>
                )}
              </div>

              {/* Title block */}
              <div style={{ marginBottom: 6 }}>
                <div style={{
                  fontFamily: 'var(--font-brand-sans)',
                  fontSize: '0.60rem', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--th-text-4)', marginBottom: 8,
                }}>
                  Before you begin
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-brand-serif)',
                  color: 'var(--th-text-1)',
                  fontSize: '2rem', fontWeight: 500, lineHeight: 1.15,
                  marginBottom: 8,
                }}>
                  A game of honest draws
                </h1>
                <p style={{
                  fontFamily: 'var(--font-brand-sans)',
                  color: 'var(--th-text-3)',
                  fontSize: '0.82rem', fontWeight: 300, lineHeight: 1.7,
                }}>
                  Two players. Alternating draws. Every card is a question —
                  some light, some not. The only rule is honesty.
                </p>
              </div>

              {/* Tier dot row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginTop: 16, marginBottom: 24,
              }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, var(--th-border-2))' }} />
                {(['light', 'medium', 'deep', 'spicy'] as const).map((t, i) => (
                  <div key={t} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: TIER_COLORS[t],
                    boxShadow: `0 0 6px ${TIER_COLORS[t]}`,
                    animation: `htp-sigil ${2.8 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, var(--th-border-2))' }} />
              </div>
            </div>

            {/* ── Tab bar ── */}
            <div style={{
              padding: '0 20px', marginBottom: 24,
              display: 'flex', gap: 7,
              overflowX: 'auto', scrollbarWidth: 'none',
            }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`htp-tab ${tab === t.id ? 'active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}
            <div style={{ padding: '0 20px', paddingBottom: isOverlay ? 0 : 40 }}>

              {/* STEPS */}
              {tab === 'steps' && (
                <div>
                  <Step number={1} title="You enter your name" active
                    body={<>On the home screen, type your name and tap <strong style={{ color: 'var(--th-text-2)', fontWeight: 600 }}>begin</strong>. A private room is created — no account, no sign-up.</>}
                  />
                  <Step number={2} title="Share the link"
                    body={<>You land on a waiting screen with a unique link. Copy it and send it to the other person. Nothing starts until they arrive.</>}
                    hint={<>The link is single-use and expires after 24 hours.</>}
                  />
                  <Step number={3} title="They join, the game begins"
                    body={<>They enter their name and tap <strong style={{ color: 'var(--th-text-2)', fontWeight: 600 }}>Join game</strong>. Your waiting screen disappears — both screens come alive at the same moment.</>}
                  />
                  <Step number={4} title="You draw first, then take turns"
                    body={<>The banner at the top shows whose move it is. When it glows, it&apos;s yours. Tap <strong style={{ color: 'var(--th-text-2)', fontWeight: 600 }}>Draw</strong> to pull a random card from the deck.</>}
                    hint={<>Early draws are lighter in tone. As the game develops, the questions go deeper.</>}
                  />
                  <Step number={5} title="Tap the card to reveal it"
                    body={<>The card lands face-down — you see the tier but not the question. Tap it to flip and read. The other player sees it appear in the grid and can open it too.</>}
                  />
                  <Step number={6} title="Both players can respond"
                    body={<>A message thread opens beneath the question. Either player can write. No limit. You can see when the other person is typing.</>}
                  />
                  <Step number={7} title="Done closes the card for both of you"
                    body={<>When you&apos;re ready to move on, tap <strong style={{ color: 'var(--th-text-2)', fontWeight: 600 }}>Done</strong>. This closes the card on both screens simultaneously. The thread is still there — tap the card again from the grid to re-read it.</>}
                  />
                  <Step number={8} title="You can add your own question"
                    body={<>On your turn, an <strong style={{ color: 'var(--th-text-2)', fontWeight: 600 }}>Add a question</strong> link appears above the Draw button. Write it, choose a tier, send it. The other player accepts or declines. If accepted, it enters the live pool.</>}
                    flow={['Your turn', 'Add question', 'They accept', 'Enters pool']}
                  />
                </div>
              )}

              {/* TIERS */}
              {tab === 'tiers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{
                    fontFamily: 'var(--font-brand-sans)',
                    color: 'var(--th-text-3)', fontSize: '0.80rem',
                    lineHeight: 1.7, marginBottom: 4,
                  }}>
                    Each card belongs to one of four tiers. You see the tier before you flip — the question itself is always a surprise.
                  </p>
                  <TierCard name="Light" colorKey="light" tagline="Easy terrain"
                    description="Surface questions. Playful, casual, lightly revealing. Good for getting comfortable before the depth arrives."
                    examples={[
                      "What's the worst advice you've ever followed?",
                      "A habit of yours would confuse a stranger instantly — what is it?",
                    ]}
                    symbol={<LightSymbol />}
                  />
                  <TierCard name="Medium" colorKey="medium" tagline="Going deeper"
                    description="Questions about patterns, preferences, and how you move through relationships. You start to see each other more clearly here."
                    examples={[
                      "What do people almost always misread about you?",
                      "You trust people — but only to a point. Where is that line?",
                    ]}
                    symbol={<MediumSymbol />}
                  />
                  <TierCard name="Deep" colorKey="deep" tagline="Raw territory"
                    description="Honest questions about fear, unresolved things, and what you want but won't always say."
                    examples={[
                      "Is there a version of your life that almost happened that you still think about?",
                      "A fear that quietly shapes your decisions more than it should?",
                    ]}
                    symbol={<DeepSymbol />}
                  />
                  <TierCard name="Spicy" colorKey="spicy" tagline="No going back"
                    description="Attraction, tension, and charged territory. These questions go where most conversations don't."
                    examples={[
                      "The line between curiosity and action — where do you usually stop?",
                      "You've held eye contact a second too long — what was behind it?",
                    ]}
                    symbol={<SpicySymbol />}
                  />
                </div>
              )}

              {/* FAQ */}
              {tab === 'faq' && (
                <div>
                  <FAQ q="Do we need accounts to play?"
                    a="No. Enter a name, share a link, and the game starts. Nothing is stored beyond the session." />
                  <FAQ q="What if I close the tab mid-game?"
                    a="The game is still there. Reopen the same URL and your cards and responses are exactly where you left them. The room stays active for 24 hours." />
                  <FAQ q="Can both players close a card?"
                    a="Yes — tapping Done closes it for both of you at once. Either player can trigger it." />
                  <FAQ q="What happens when we run out of questions?"
                    a="The pool resets quietly and starts again. You'll never be stuck with nothing to draw." />
                  <FAQ q="Can we skip a question?"
                    a="There's no skip button. Part of the game is not knowing what you'll get. You can always close the card and talk about something else if it feels like too much." />
                  <FAQ q="Are our responses saved?"
                    a="Yes. Messages are stored and tied to each card. Tap any card in the grid to re-open the thread." />
                  <FAQ q="Can we add our own questions?"
                    a={<>On your turn, tap <strong style={{ color: 'var(--th-text-2)' }}>Add a question</strong> above the Draw button. Write it, choose a tier, and send it to the other player.</>} />
                  <FAQ q="What does the connection indicator mean?"
                    a={<>The dot in the top corner shows your live status. <strong style={{ color: 'var(--tier-light)' }}>Green</strong> means connected. <strong style={{ color: '#fbbf24' }}>Yellow</strong> means reconnecting. <strong style={{ color: 'var(--tier-deep)' }}>Red</strong> means offline — refresh to restore.</>} />
                </div>
              )}

              <div style={{ height: 16 }} />
            </div>
          </div>

          {/* ── Fixed bottom CTA ── */}
          {isOverlay && (
            <div style={{
              padding: '12px 20px max(20px, env(safe-area-inset-bottom)) 20px',
              background: 'linear-gradient(to top, var(--th-bg) 70%, transparent)',
              flexShrink: 0,
            }}>
              <button className="htp-cta" onClick={onClose}>
                I&apos;m ready — let&apos;s begin
              </button>
            </div>
          )}

          {/* Standalone footer watermark */}
          {!isOverlay && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 5, opacity: 0.12, userSelect: 'none', pointerEvents: 'none',
              padding: '24px 0 32px',
            }}>
              <AbyssSignil size={9} opacity={1} />
              <span style={{
                fontFamily: 'var(--font-brand-mono)',
                fontSize: '0.55rem', color: 'var(--th-brand)',
                letterSpacing: '0.18em', textTransform: 'lowercase',
              }}>
                abyssprotocol
              </span>
            </div>
          )}
        </main>
      </div>
    </>
  )
}