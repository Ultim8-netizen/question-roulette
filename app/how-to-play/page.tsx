'use client'

import { useState } from 'react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'steps' | 'tiers' | 'faq'

// ---------------------------------------------------------------------------
// Brand sigil
// ---------------------------------------------------------------------------

function AbyssSignil({ size = 10, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ opacity, flexShrink: 0 }}
    >
      <circle cx="16" cy="16" r="9" stroke="#c8d0de" strokeWidth="1.4" strokeDasharray="22 6" strokeDashoffset="3" />
      <line x1="16" y1="4" x2="16" y2="28" stroke="#c8d0de" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill="#c8d0de" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Step — numbered guide entry
// ---------------------------------------------------------------------------

type StepProps = {
  number: number
  title: string
  body: React.ReactNode
  accent?: string
  hint?: React.ReactNode
  flow?: string[]
  active?: boolean
}

function Step({ number, title, body, accent = '#c8d0de', hint, flow, active }: StepProps) {
  return (
    <>
      <style>{`
        @keyframes step-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .step-root { animation: step-in 0.35s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
      <div
        className="step-root"
        style={{
          display: 'flex',
          gap: 18,
          paddingBottom: 32,
          position: 'relative',
        }}
      >
        {/* Connector line */}
        <div style={{
          position: 'absolute',
          left: 15,
          top: 32,
          bottom: 0,
          width: 1,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 100%)',
        }} />

        {/* Number badge */}
        <div style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          flexShrink: 0,
          border: active
            ? `1.5px solid ${accent}55`
            : '1px solid rgba(255,255,255,0.08)',
          background: active
            ? `${accent}12`
            : 'linear-gradient(135deg, #0d0f18, #090a12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: active ? accent : '#2a3244',
          fontSize: '0.68rem',
          fontWeight: 700,
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          letterSpacing: '0.04em',
          zIndex: 1,
        }}>
          {number}
        </div>

        {/* Content */}
        <div style={{ flex: 1, paddingTop: 4 }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: '#c8d0de',
            fontSize: '1.05rem',
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: 8,
          }}>
            {title}
          </h3>
          <div style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: '#64748b',
            fontSize: '0.82rem',
            lineHeight: 1.7,
          }}>
            {body}
          </div>

          {/* Flow diagram */}
          {flow && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 14,
              flexWrap: 'wrap',
            }}>
              {flow.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    color: '#475569',
                    background: '#0d0f18',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    letterSpacing: '0.02em',
                  }}>
                    {step}
                  </span>
                  {i < flow.length - 1 && (
                    <span style={{ color: '#1e2535', fontSize: '0.70rem' }}>→</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Hint box */}
          {hint && (
            <div style={{
              marginTop: 12,
              padding: '10px 14px',
              background: '#06070d',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              display: 'flex',
              gap: 8,
            }}>
              <div style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 6px ${accent}`,
                flexShrink: 0,
                marginTop: 5,
              }} />
              <div style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                color: '#334155',
                fontSize: '0.75rem',
                lineHeight: 1.6,
              }}>
                {hint}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Tier card
// ---------------------------------------------------------------------------

type TierCardProps = {
  name: string
  color: string
  tagline: string
  description: string
  examples: string[]
  symbol: React.ReactNode
}

function TierCard({ name, color, tagline, description, examples, symbol }: TierCardProps) {
  return (
    <div style={{
      background: `linear-gradient(150deg, ${color}08 0%, transparent 60%)`,
      border: `1px solid ${color}20`,
      borderRadius: 18,
      padding: '20px 18px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ opacity: 0.75 }}>{symbol}</div>
        <div>
          <div style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color,
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: 1,
          }}>
            {name}
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: '#94a3b8',
            fontSize: '0.88rem',
            fontStyle: 'italic',
          }}>
            {tagline}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: '#475569',
        fontSize: '0.78rem',
        lineHeight: 1.65,
        margin: 0,
      }}>
        {description}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: `${color}14` }} />

      {/* Examples */}
      <div>
        <div style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          color: '#1e2535',
          fontSize: '0.58rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Sample questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {examples.map((ex, i) => (
            <div key={i} style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#334155',
              fontSize: '0.82rem',
              fontStyle: 'italic',
              lineHeight: 1.5,
              paddingLeft: 10,
              borderLeft: `1.5px solid ${color}30`,
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
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          color: open ? '#94a3b8' : '#64748b',
          fontSize: '0.85rem',
          fontWeight: 500,
          lineHeight: 1.5,
          transition: 'color 0.2s ease',
        }}>
          {q}
        </span>
        <span style={{
          color: open ? '#4ade80' : '#334155',
          fontSize: '1rem',
          flexShrink: 0,
          transition: 'transform 0.2s ease, color 0.2s ease',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          display: 'inline-block',
          lineHeight: 1,
        }}>
          +
        </span>
      </button>
      {open && (
        <div style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          color: '#475569',
          fontSize: '0.80rem',
          lineHeight: 1.7,
          paddingBottom: 16,
          paddingRight: 24,
        }}>
          {a}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier SVG symbols — small versions
// ---------------------------------------------------------------------------

function LightSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <ellipse key={deg} cx="12" cy="12" rx="3.5" ry="8" fill="#4ade80" opacity="0.55" transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2" fill="#4ade80" opacity="0.95" />
    </svg>
  )
}
function MediumSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {[10, 7, 4].map((r, i) => (
        <circle key={r} cx="12" cy="12" r={r} stroke="#60a5fa" strokeWidth="1" opacity={0.4 + i * 0.2} fill="none" />
      ))}
      <circle cx="12" cy="12" r="1.5" fill="#60a5fa" opacity="0.95" />
    </svg>
  )
}
function DeepSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L21 20 H3 Z" stroke="#f87171" strokeWidth="1.2" fill="#f87171" fillOpacity="0.18" strokeLinejoin="round" opacity="0.85" />
      <path d="M12 8 L17 18 H7 Z" fill="#f87171" opacity="0.55" />
    </svg>
  )
}
function SpicySymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 2 L5 13 H11 L10 22 L19 11 H13 Z" fill="#c084fc" opacity="0.80" strokeLinejoin="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function HowToPlayPage() {
  const [tab, setTab] = useState<Tab>('steps')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'steps', label: 'Step by step' },
    { id: 'tiers', label: 'The four tiers' },
    { id: 'faq',   label: 'Common questions' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        body { background: #020308; margin: 0; }

        @keyframes page-in  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes hdr-in   { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes tab-in   { from { opacity:0; transform:translateY(6px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes content-in { from { opacity:0 } to { opacity:1 } }

        .page-root  { animation: page-in   0.40s cubic-bezier(0.22,1,0.36,1) both; }
        .hdr-root   { animation: hdr-in    0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .tab-row    { animation: tab-in    0.35s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
        .content    { animation: content-in 0.30s ease 0.12s both; }

        .tab-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 8px 16px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .tab-btn:hover {
          border-color: rgba(255,255,255,0.13);
          color: #94a3b8;
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.14);
          color: #c8d0de;
        }
        .tab-btn.inactive { color: #334155; }
      `}</style>

      <main
        className="page-root"
        style={{
          minHeight: '100dvh',
          background: '#020308',
          color: '#ededed',
          maxWidth: 480,
          margin: '0 auto',
          padding: '0 0 80px',
        }}
      >
        {/* ── Header ── */}
        <div
          className="hdr-root"
          style={{
            padding: '24px 20px 0',
            marginBottom: 28,
          }}
        >
          {/* Back + wordmark row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
          }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                color: '#2a3244',
                fontSize: '0.72rem',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 400,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#475569')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#2a3244')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              back
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AbyssSignil size={14} opacity={0.55} />
              <span style={{
                fontFamily: "'Geist Mono', ui-monospace, monospace",
                fontSize: '0.60rem',
                color: '#1e2535',
                letterSpacing: '0.18em',
                textTransform: 'lowercase',
              }}>
                abyssprotocol
              </span>
            </div>
          </div>

          {/* Title block */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: '#c8d0de',
            fontSize: '2rem',
            fontWeight: 500,
            lineHeight: 1.15,
            marginBottom: 6,
          }}>
            How to play
          </h1>
          <p style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: '#2a3244',
            fontSize: '0.78rem',
            fontWeight: 300,
            lineHeight: 1.6,
            marginBottom: 0,
          }}>
            Two players. Alternating draws. Every card is a question — some light, some not.
          </p>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="tab-row"
          style={{
            padding: '0 20px',
            marginBottom: 28,
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-btn ${tab === t.id ? 'active' : 'inactive'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="content" style={{ padding: '0 20px' }}>

          {/* ── STEP BY STEP ── */}
          {tab === 'steps' && (
            <div>
              <div style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                color: '#1e2535',
                fontSize: '0.58rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 22,
              }}>
                Setting up
              </div>

              <Step
                number={1}
                title="The host enters their name"
                active
                body={
                  <>On the homepage, type your name and click <strong style={{ color: '#94a3b8', fontWeight: 600 }}>begin</strong>. A private game room is created just for you two — no account needed.</>
                }
              />

              <Step
                number={2}
                title="Share the link"
                body={
                  <>You land on a waiting screen. A unique link is shown — copy it and send it to the other person. <strong style={{ color: '#c8d0de', fontWeight: 600 }}>Nothing happens until they join.</strong></>
                }
                hint={
                  <>The link only works once and expires after 24 hours. Each game gets its own fresh link.</>
                }
              />

              <Step
                number={3}
                title="The other person opens the link"
                body={
                  <>They see a join screen, enter their name, and tap <strong style={{ color: '#94a3b8', fontWeight: 600 }}>Join game</strong>. The host&apos;s waiting screen disappears — the game begins automatically for both of you at the same time.</>
                }
              />

              <div style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                color: '#1e2535',
                fontSize: '0.58rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 22,
                marginTop: 4,
              }}>
                Playing
              </div>

              <Step
                number={4}
                title="The host always goes first"
                body={
                  <>A banner at the top tells you whose turn it is. If it&apos;s your turn, the banner glows green and says <strong style={{ color: '#4ade80', fontWeight: 600 }}>Your draw</strong>. If it&apos;s theirs, it says who is deciding. The draw button at the bottom is only active on your turn.</>
                }
                hint={
                  <>A small <strong style={{ color: '#4ade80' }}>Live</strong> indicator shows your connection status. If it turns red, refresh the page.</>
                }
              />

              <Step
                number={5}
                title="Tap Draw to pull a card"
                body={
                  <>When it&apos;s your turn, the <strong style={{ color: '#c8d0de', fontWeight: 600 }}>Draw</strong> button at the bottom activates. Tap it — a random card is pulled from the pool. The card belongs to you this round.</>
                }
                flow={['Your turn', 'Tap Draw', 'Card appears', 'Their turn']}
              />

              <Step
                number={6}
                title="The card opens — but it's face-down first"
                body={
                  <>A card appears on your screen automatically. It shows the tier (light, medium, deep, or spicy) but hides the question. <strong style={{ color: '#c8d0de', fontWeight: 600 }}>Tap the card</strong> to flip it and reveal the question.</>
                }
                hint={
                  <><strong style={{ color: '#f59e0b' }}>Other player:</strong> you also see the card appear in the grid at the bottom. Tap it to open it and read the question — it won&apos;t open on your screen automatically.</>
                }
              />

              <Step
                number={7}
                title="Both players can respond"
                body={
                  <>Once the card is flipped, a text thread appears below the question. <strong style={{ color: '#c8d0de', fontWeight: 600 }}>Either player</strong> can type a response. You can go back and forth — there&apos;s no limit. You can see a typing indicator when the other person is composing.</>
                }
                hint={
                  <>Responses are saved. You can close a card and re-open it later from the card grid to continue the conversation.</>
                }
              />

              <Step
                number={8}
                title="Tap Done to close the card"
                body={
                  <>When you&apos;re both ready to move on, either player can tap the <strong style={{ color: '#c8d0de', fontWeight: 600 }}>Done</strong> button at the bottom of the card. <strong style={{ color: '#c8d0de', fontWeight: 600 }}>This closes the card for both of you</strong> — no need to coordinate. The turn then passes automatically to the next player.</>
                }
                hint={
                  <>Closing a card doesn&apos;t delete anything. Tap it again from the card grid at any point to re-read it or continue responding.</>
                }
              />

              <div style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                color: '#1e2535',
                fontSize: '0.58rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 22,
                marginTop: 4,
              }}>
                Extra
              </div>

              <Step
                number={9}
                title="Add your own question to the pool"
                body={
                  <>On your turn, a small <strong style={{ color: '#94a3b8', fontWeight: 600 }}>Add a question</strong> link appears above the Draw button. Tap it, write your question, choose a tier, and send it. The other player sees it and can accept or decline. If accepted, it enters the live pool and can be drawn at any point during the game.</>
                }
                hint={
                  <>Only one proposal can be pending at a time. Wait for a response before sending another.</>
                }
              />
            </div>
          )}

          {/* ── THE FOUR TIERS ── */}
          {tab === 'tiers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                color: '#334155',
                fontSize: '0.80rem',
                lineHeight: 1.7,
                marginBottom: 6,
              }}>
                Every card belongs to one of four tiers. The tier tells you the approximate depth of the question before you flip it — though it&apos;s always a surprise what exactly comes up.
              </p>

              <TierCard
                name="Light"
                color="#4ade80"
                tagline="Easy terrain"
                description="Surface questions. Funny, casual, or lightly revealing. Good for warming up and learning someone's quirks without any pressure."
                examples={[
                  "What's the worst advice you've ever followed?",
                  "A habit of yours would confuse a stranger instantly — what is it?",
                ]}
                symbol={<LightSymbol />}
              />

              <TierCard
                name="Medium"
                color="#60a5fa"
                tagline="Going deeper"
                description="Questions about patterns, preferences, and how you move through relationships. You'll start to see each other more clearly here."
                examples={[
                  "What do people almost always misread about you?",
                  "You trust people... but only up to a point — where is that line?",
                ]}
                symbol={<MediumSymbol />}
              />

              <TierCard
                name="Deep"
                color="#f87171"
                tagline="Raw territory"
                description="Honest questions about fear, unresolved things, and what you want but won't always say. Not for the faint-hearted."
                examples={[
                  "Is there a version of your life that almost happened that you still think about?",
                  "A fear that quietly shapes your decisions more than it should?",
                ]}
                symbol={<DeepSymbol />}
              />

              <TierCard
                name="Spicy"
                color="#c084fc"
                tagline="No going back"
                description="Attraction, tension, and charged situations. These questions go where most conversations don't. Play them when you're ready."
                examples={[
                  "The line between curiosity and action — where do you usually stop?",
                  "You've held eye contact a second too long — what was behind it?",
                ]}
                symbol={<SpicySymbol />}
              />
            </div>
          )}

          {/* ── FAQ ── */}
          {tab === 'faq' && (
            <div>
              <FAQ
                q="Do we need accounts to play?"
                a="No. You enter a name, share a link, and the game starts. Nothing is stored beyond the session."
              />
              <FAQ
                q="What happens if I close the tab mid-game?"
                a="The game is still there. Reopen the same URL and your cards and responses are exactly where you left them. The room stays active for 24 hours."
              />
              <FAQ
                q="Can both players close a card?"
                a="Yes — tapping Done closes it for both of you simultaneously. You don't need to coordinate. Either player can trigger it."
              />
              <FAQ
                q="What if one player draws all the questions?"
                a="The draw alternates automatically after every card. You can't draw twice in a row."
              />
              <FAQ
                q="What happens when we run out of questions?"
                a="The pool resets silently and starts again from the beginning. You'll never get stuck with nothing to draw."
              />
              <FAQ
                q="Can we skip a question we don't like?"
                a="There's no skip button — part of the game is not knowing what you'll get. If something feels too much, you can just close the card and talk about something else."
              />
              <FAQ
                q="Are our responses saved?"
                a="Yes. Messages are stored and tied to each card. You can re-open any card from the grid and the full thread is still there."
              />
              <FAQ
                q="Can we add our own questions?"
                a={
                  <>On your turn, tap <strong style={{ color: '#94a3b8' }}>Add a question</strong> above the Draw button. Write it, choose a tier, and send it. The other player accepts or declines — if accepted it enters the pool immediately.</>
                }
              />
              <FAQ
                q="Is there a way to see all drawn cards?"
                a="Yes — the grid below the turn banner shows every card drawn this session. Tap any card to re-open it and read or continue the thread."
              />
              <FAQ
                q="What does the connection indicator mean?"
                a={
                  <>The coloured dot in the top-right shows your real-time status. <strong style={{ color: '#4ade80' }}>Green</strong> means live. <strong style={{ color: '#f59e0b' }}>Yellow</strong> means reconnecting. <strong style={{ color: '#f87171' }}>Red</strong> means disconnected — refresh the page to restore it.</>
                }
              />
            </div>
          )}

        </div>

        {/* ── Footer watermark ── */}
        <div style={{
          marginTop: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: 0.12,
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          <AbyssSignil size={10} opacity={1} />
          <span style={{
            fontFamily: "'Geist Mono', ui-monospace, monospace",
            fontSize: '0.55rem',
            color: '#c8d0de',
            letterSpacing: '0.18em',
            textTransform: 'lowercase',
          }}>
            abyssprotocol
          </span>
        </div>

      </main>
    </>
  )
}