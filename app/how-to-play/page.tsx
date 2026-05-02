'use client'

import { useState } from 'react'
import Link from 'next/link'

export type HowToPlayOverlayProps = {
  onClose?: () => void
}

type Tab = 'steps' | 'tiers' | 'faq'

// ---------------------------------------------------------------------------
// Sigil
// ---------------------------------------------------------------------------

function AbyssSignil({ size = 10, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ opacity, flexShrink:0 }}>
      <circle cx="16" cy="16" r="9" stroke="var(--th-brand)" strokeWidth="1.4" strokeDasharray="22 6" strokeDashoffset="3"/>
      <line x1="16" y1="4" x2="16" y2="28" stroke="var(--th-brand)" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="2" fill="var(--th-brand)"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Tier colours
// ---------------------------------------------------------------------------

const TIER_COLORS: Record<string, string> = {
  light: 'var(--tier-light)', medium: 'var(--tier-medium)',
  deep:  'var(--tier-deep)',  spicy:  'var(--tier-spicy)',
}

// ---------------------------------------------------------------------------
// Step
// ---------------------------------------------------------------------------

function Step({ number, title, body, hint, flow, active }: {
  number: number; title: string; body: React.ReactNode
  hint?: React.ReactNode; flow?: string[]; active?: boolean
}) {
  return (
    <div style={{ display:'flex', gap:16, paddingBottom:28, position:'relative' }}>
      <div style={{ position:'absolute', left:13, top:30, bottom:0, width:1, background:'linear-gradient(to bottom,var(--th-border-2) 0%,transparent 100%)' }}/>
      <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, border: active ? '1.5px solid var(--th-border-2)' : '1px solid var(--th-border)', background: active ? 'var(--th-surface-2)' : 'var(--th-surface)', display:'flex', alignItems:'center', justifyContent:'center', color: active ? 'var(--th-text-1)' : 'var(--th-text-3)', fontSize:'0.66rem', fontWeight:700, fontFamily:'var(--font-brand-mono)', letterSpacing:'0.04em', zIndex:1 }}>
        {number}
      </div>
      <div style={{ flex:1, paddingTop:3 }}>
        <h3 style={{ fontFamily:'var(--font-brand-serif)', color:'var(--th-text-1)', fontSize:'1.05rem', fontWeight:600, lineHeight:1.3, marginBottom:6 }}>{title}</h3>
        <div style={{ fontFamily:'var(--font-brand-sans)', color:'var(--th-text-3)', fontSize:'0.82rem', lineHeight:1.75 }}>{body}</div>
        {flow && (
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:12, flexWrap:'wrap' }}>
            {flow.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontFamily:'var(--font-brand-sans)', fontSize:'0.66rem', fontWeight:500, color:'var(--th-text-3)', background:'var(--th-surface)', border:'1px solid var(--th-border)', borderRadius:8, padding:'3px 9px' }}>{s}</span>
                {i < flow.length - 1 && <span style={{ color:'var(--th-text-4)', fontSize:'0.65rem' }}>→</span>}
              </div>
            ))}
          </div>
        )}
        {hint && (
          <div style={{ marginTop:10, padding:'10px 13px', background:'var(--th-surface)', border:'1px solid var(--th-border)', borderRadius:10, display:'flex', gap:8 }}>
            <div style={{ width:4, height:4, borderRadius:'50%', background:'var(--th-text-3)', flexShrink:0, marginTop:6 }}/>
            <div style={{ fontFamily:'var(--font-brand-sans)', color:'var(--th-text-3)', fontSize:'0.74rem', lineHeight:1.65 }}>{hint}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TierCard
// ---------------------------------------------------------------------------

function TierCard({ name, colorKey, tagline, description, examples, symbol }: {
  name: string; colorKey: string; tagline: string
  description: string; examples: string[]; symbol: React.ReactNode
}) {
  const color = TIER_COLORS[colorKey]
  return (
    <div style={{ background:'var(--th-surface)', border:'1px solid var(--th-border)', borderRadius:18, padding:'18px 16px 16px', display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ opacity:0.80 }}>{symbol}</div>
        <div>
          <div style={{ fontFamily:'var(--font-brand-sans)', color, fontSize:'0.60rem', fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:1 }}>{name}</div>
          <div style={{ fontFamily:'var(--font-brand-serif)', color:'var(--th-text-2)', fontSize:'0.86rem', fontStyle:'italic' }}>{tagline}</div>
        </div>
      </div>
      <p style={{ fontFamily:'var(--font-brand-sans)', color:'var(--th-text-3)', fontSize:'0.78rem', lineHeight:1.65, margin:0 }}>{description}</p>
      <div style={{ height:1, background:'var(--th-border)' }}/>
      <div>
        <div style={{ fontFamily:'var(--font-brand-sans)', color:'var(--th-text-4)', fontSize:'0.56rem', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:7 }}>Sample questions</div>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {examples.map((ex, i) => (
            <div key={i} style={{ fontFamily:'var(--font-brand-serif)', color:'var(--th-text-3)', fontSize:'0.82rem', fontStyle:'italic', lineHeight:1.5, paddingLeft:10, borderLeft:'1.5px solid var(--th-border-2)' }}>
              &ldquo;{ex}&rdquo;
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

function FAQ({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:'1px solid var(--th-border)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:'100%', background:'none', border:'none', padding:'15px 0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, cursor:'pointer', textAlign:'left' }}>
        <span style={{ fontFamily:'var(--font-brand-sans)', color: open ? 'var(--th-text-2)' : 'var(--th-text-3)', fontSize:'0.83rem', fontWeight:500, lineHeight:1.5, transition:'color 0.2s ease' }}>{q}</span>
        <span style={{ color: open ? 'var(--tier-light)' : 'var(--th-text-4)', fontSize:'1rem', flexShrink:0, transition:'transform 0.2s ease,color 0.2s ease', transform: open ? 'rotate(45deg)' : 'none', display:'inline-block', lineHeight:1 }}>+</span>
      </button>
      {open && (
        <div style={{ fontFamily:'var(--font-brand-sans)', color:'var(--th-text-3)', fontSize:'0.79rem', lineHeight:1.72, paddingBottom:14, paddingRight:20 }}>{a}</div>
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
      {[0,60,120,180,240,300].map(deg => <ellipse key={deg} cx="12" cy="12" rx="3.5" ry="8" fill="var(--tier-light)" opacity="0.55" transform={`rotate(${deg} 12 12)`}/>)}
      <circle cx="12" cy="12" r="2" fill="var(--tier-light)" opacity="0.95"/>
    </svg>
  )
}
function MediumSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {[10,7,4].map((r,i) => <circle key={r} cx="12" cy="12" r={r} stroke="var(--tier-medium)" strokeWidth="1" opacity={0.4+i*0.2} fill="none"/>)}
      <circle cx="12" cy="12" r="1.5" fill="var(--tier-medium)" opacity="0.95"/>
    </svg>
  )
}
function DeepSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L21 20 H3 Z" stroke="var(--tier-deep)" strokeWidth="1.2" fill="var(--tier-deep)" fillOpacity="0.18" strokeLinejoin="round" opacity="0.85"/>
      <path d="M12 8 L17 18 H7 Z" fill="var(--tier-deep)" opacity="0.55"/>
    </svg>
  )
}
function SpicySymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 2 L5 13 H11 L10 22 L19 11 H13 Z" fill="var(--tier-spicy)" opacity="0.80" strokeLinejoin="round"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HowToPlayPage({ onClose }: HowToPlayOverlayProps) {
  const [tab, setTab] = useState<Tab>('steps')
  const isOverlay = !!onClose

  const TABS: { id: Tab; label: string }[] = [
    { id:'steps', label:'How it works' },
    { id:'tiers', label:'The four tiers' },
    { id:'faq',   label:'Questions' },
  ]

  return (
    <>
      <style>{`
        @keyframes htp-in    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes htp-fade  { from{opacity:0} to{opacity:1} }
        @keyframes htp-sigil { 0%,100%{opacity:0.55} 50%{opacity:0.9} }
        @keyframes htp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes htp-glow  {
          0%  { text-shadow: 0 0 20px rgba(74,222,128,0.0);  color: var(--th-text-1); }
          33% { text-shadow: 0 0 28px rgba(96,165,250,0.18); color: #bfdbfe; }
          66% { text-shadow: 0 0 28px rgba(248,113,113,0.18);color: #fecaca; }
          100%{ text-shadow: 0 0 20px rgba(74,222,128,0.0);  color: var(--th-text-1); }
        }

        .htp-root   { animation: htp-in   0.52s cubic-bezier(0.22,1,0.36,1) both; }
        .htp-fade   { animation: htp-fade 0.32s ease both; }
        .htp-sigil  { animation: htp-sigil 3.5s ease-in-out infinite; }
        .htp-float  { animation: htp-float 4s ease-in-out infinite; }
        .htp-glow   { animation: htp-glow 10s ease-in-out infinite; }

        .htp-tab {
          background:none; border:1px solid var(--th-border); border-radius:10px;
          padding:7px 14px; font-family:var(--font-brand-sans); font-size:0.76rem;
          font-weight:500; letter-spacing:0.02em; cursor:pointer;
          transition:all 0.18s ease; white-space:nowrap; color:var(--th-text-4);
        }
        .htp-tab:hover  { border-color:var(--th-border-2); color:var(--th-text-2); }
        .htp-tab.active { background:var(--th-surface-2); border-color:var(--th-border-2); color:var(--th-text-1); }

        .htp-cta {
          width:100%; padding:17px 0; border-radius:18px;
          background:var(--th-surface); border:1px solid var(--th-border-2);
          color:var(--th-text-1); font-family:var(--font-brand-serif);
          font-size:1.05rem; font-weight:500; font-style:italic;
          letter-spacing:0.04em; cursor:pointer;
          transition:background 0.22s ease,border-color 0.22s ease,transform 0.18s ease;
          position:relative; overflow:hidden;
        }
        .htp-cta:hover { background:var(--th-surface-2); transform:translateY(-1px); }

        .htp-scroll::-webkit-scrollbar { width:3px; }
        .htp-scroll::-webkit-scrollbar-track { background:transparent; }
        .htp-scroll::-webkit-scrollbar-thumb { background:var(--th-border-2); border-radius:99px; }

        @keyframes htp-shimmer {
          0%  { transform:translateX(-130%) skewX(-14deg); opacity:0; }
          12% { opacity:1; }
          88% { opacity:1; }
          100%{ transform:translateX(270%)  skewX(-14deg); opacity:0; }
        }
        .htp-cta-shimmer { animation: htp-shimmer 2.6s ease-in-out 0.8s infinite; }
      `}</style>

      <div
        className={isOverlay ? 'htp-fade' : ''}
        style={isOverlay ? {
          position:'fixed', inset:0, zIndex:200,
          background:'var(--th-overlay)',
          backdropFilter:'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
          display:'flex', alignItems:'flex-end', justifyContent:'center',
          overflowY:'auto',
        } : {}}
      >
        <main
          className="htp-root"
          style={{
            width:'100%', maxWidth:480,
            minHeight: isOverlay ? undefined : '100dvh',
            maxHeight: isOverlay ? '96dvh' : undefined,
            background:'var(--th-bg)',
            color:'var(--th-fg)',
            display:'flex', flexDirection:'column',
            borderRadius: isOverlay ? '28px 28px 0 0' : 0,
            border: isOverlay ? '1px solid var(--th-border-2)' : 'none',
            borderBottom:'none',
            overflow:'hidden',
          }}
        >
          {/* Drag handle */}
          {isOverlay && (
            <div style={{ display:'flex', justifyContent:'center', paddingTop:14, paddingBottom:4, flexShrink:0 }}>
              <div style={{ width:36, height:4, borderRadius:2, background:'var(--th-border-2)' }}/>
            </div>
          )}

          {/* Scrollable */}
          <div className="htp-scroll" style={{ flex:1, overflowY:'auto', padding: isOverlay ? '8px 0 0' : '0' }}>

            {/* ── Hero ── */}
            <div style={{ padding:'24px 22px 0' }}>

              {/* Nav */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
                {isOverlay ? (
                  <div className="htp-sigil" style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <AbyssSignil size={14}/>
                    <span style={{ fontFamily:'var(--font-brand-mono)', fontSize:'0.58rem', color:'var(--th-text-4)', letterSpacing:'0.18em', textTransform:'lowercase' }}>abyssprotocol</span>
                  </div>
                ) : (
                  <Link href="/" style={{ display:'flex', alignItems:'center', gap:5, textDecoration:'none', color:'var(--th-text-4)', fontSize:'0.70rem', fontFamily:'var(--font-brand-sans)', transition:'color 0.2s ease' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color='var(--th-text-3)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color='var(--th-text-4)')}>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    back
                  </Link>
                )}
                {!isOverlay && (
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <AbyssSignil size={13} opacity={0.5}/>
                    <span style={{ fontFamily:'var(--font-brand-mono)', fontSize:'0.58rem', color:'var(--th-text-4)', letterSpacing:'0.18em', textTransform:'lowercase' }}>abyssprotocol</span>
                  </div>
                )}
              </div>

              {/* Hero copy */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:'var(--font-brand-sans)', fontSize:'0.60rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--th-text-4)', marginBottom:10 }}>
                  Before you begin
                </div>

                {/* Animated headline */}
                <h1 className="htp-glow" style={{ fontFamily:'var(--font-brand-serif)', fontSize:'2.2rem', fontWeight:500, lineHeight:1.15, marginBottom:12 }}>
                  Some conversations change things.
                </h1>

                <p style={{ fontFamily:'var(--font-brand-sans)', color:'var(--th-text-2)', fontSize:'0.88rem', fontWeight:300, lineHeight:1.72, marginBottom:12 }}>
                  Room 13 is a two-player card game built around questions — the kind people don&apos;t usually ask, and the kind that don&apos;t have safe answers.
                </p>

                <p style={{ fontFamily:'var(--font-brand-serif)', color:'var(--th-text-3)', fontSize:'0.92rem', fontStyle:'italic', lineHeight:1.65, marginBottom:0 }}>
                  You take turns drawing. Each card is a question. Each question goes somewhere. You respond in the thread — or you don&apos;t. There&apos;s no score. No timer. Just whatever happens next.
                </p>
              </div>

              {/* Floating tier dot row */}
              <div className="htp-float" style={{ display:'flex', alignItems:'center', gap:8, marginTop:22, marginBottom:26 }}>
                <div style={{ flex:1, height:1, background:'linear-gradient(to right,transparent,var(--th-border-2))' }}/>
                {(['light','medium','deep','spicy'] as const).map((t,i) => (
                  <div key={t} style={{ width:6, height:6, borderRadius:'50%', background:TIER_COLORS[t], boxShadow:`0 0 8px ${TIER_COLORS[t]}, 0 0 18px ${TIER_COLORS[t]}44`, animationDelay:`${i*0.15}s` }}/>
                ))}
                <div style={{ flex:1, height:1, background:'linear-gradient(to left,transparent,var(--th-border-2))' }}/>
              </div>
            </div>

            {/* ── Tab bar ── */}
            <div style={{ padding:'0 22px', marginBottom:24, display:'flex', gap:7, overflowX:'auto', scrollbarWidth:'none' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`htp-tab${tab===t.id?' active':''}`}>{t.label}</button>
              ))}
            </div>

            {/* ── Tab content ── */}
            <div style={{ padding:'0 22px', paddingBottom: isOverlay ? 0 : 40 }}>

              {/* STEPS */}
              {tab === 'steps' && (
                <div>
                  <Step number={1} title="Enter your name, create the room" active
                    body={<>Type your name on the home screen and tap <strong style={{ color:'var(--th-text-2)' }}>enter</strong>. A private room is created instantly — no account, no sign-up, nothing to install.</>}
                  />
                  <Step number={2} title="Save your link before you do anything else"
                    body={<>You land on a waiting screen. Before sharing, <strong style={{ color:'var(--th-text-2)' }}>copy the link and save it somewhere</strong> — notes, a message to yourself, anywhere. This link is the only way back to your session if you close the tab.</>}
                    hint={<>The link expires after 24 hours. Both players need it — you to return, them to join.</>}
                  />
                  <Step number={3} title="Send the link to the other player"
                    body={<>Share the same link with whoever you&apos;re playing with. Nothing happens until they open it and enter their name.</>}
                  />
                  <Step number={4} title="They join — both screens come alive"
                    body={<>The moment they tap <strong style={{ color:'var(--th-text-2)' }}>join game</strong>, your waiting screen disappears. The game opens for both of you at the same instant.</>}
                    hint={<>Save your personal return link (the &ldquo;Copy my link&rdquo; button next to your name) — it&apos;s a direct bookmark that re-opens your session on any device.</>}
                  />
                  <Step number={5} title="Take turns drawing"
                    body={<>The banner at the top shows whose move it is. When it glows green, it&apos;s yours. Tap <strong style={{ color:'var(--th-text-2)' }}>Draw</strong> to pull a random card from the deck. The card lands face-down — you see the tier before you see the question.</>}
                    hint={<>The first few draws are always lighter in tone. The questions go deeper as the game develops.</>}
                  />
                  <Step number={6} title="Tap the card to reveal the question"
                    body={<>Tap the face-down card to flip it. The question appears. The other player can tap the same card in their grid to read it too — both of you see it at the same time.</>}
                  />
                  <Step number={7} title="Respond in the thread"
                    body={<>A message thread opens beneath the question. Either player can write — there&apos;s no limit. You can see when the other person is typing in real time.</>}
                  />
                  <Step number={8} title="Done closes the card for both of you"
                    body={<>Tap <strong style={{ color:'var(--th-text-2)' }}>Done</strong> when you&apos;re ready to move on. This closes the card on both screens at once. The thread stays — tap the card again from the grid anytime to re-read it.</>}
                  />
                  <Step number={9} title="You can add your own question"
                    body={<>On your turn, an <strong style={{ color:'var(--th-text-2)' }}>Add a question</strong> link appears above the Draw button. Write your question, choose a tier, and send it to the other player. They accept or decline. If accepted, it enters the live pool and can be drawn like any other card.</>}
                    flow={['Your turn', 'Add question', 'They accept', 'Enters pool', 'Can be drawn']}
                  />
                  <Step number={10} title="Change the look anytime"
                    body={<>A Theme button lives in the player header row. Tap it to switch between dark and light palettes — Void, Midnight, Lemon, Rose, and more. Your choice is saved across sessions.</>}
                  />
                </div>
              )}

              {/* TIERS */}
              {tab === 'tiers' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <p style={{ fontFamily:'var(--font-brand-sans)', color:'var(--th-text-3)', fontSize:'0.80rem', lineHeight:1.7, marginBottom:4 }}>
                    Every card belongs to one of four tiers. You see the tier before you flip — the question is always a surprise. The game starts light and goes wherever you let it.
                  </p>
                  <TierCard name="Light" colorKey="light" tagline="Easy terrain"
                    description="Surface questions. Playful, lightly revealing, no pressure. These get you talking before the deeper stuff arrives."
                    examples={["What's the worst advice you've ever followed?","If your personality came with a warning label, what would it say?"]}
                    symbol={<LightSymbol/>}
                  />
                  <TierCard name="Medium" colorKey="medium" tagline="Going deeper"
                    description="Questions about patterns, how you move through relationships, and what people usually miss about you. You start to actually see each other here."
                    examples={["What do people almost always get wrong about you?","You trust people — but only to a point. Where's that line?"]}
                    symbol={<MediumSymbol/>}
                  />
                  <TierCard name="Deep" colorKey="deep" tagline="Raw territory"
                    description="Honest questions about fear, the unresolved, and what you want but rarely say. No easy exits."
                    examples={["Is there a version of your life that almost happened that you still think about?","What's a fear that quietly shapes your decisions more than it should?"]}
                    symbol={<DeepSymbol/>}
                  />
                  <TierCard name="Spicy" colorKey="spicy" tagline="No going back"
                    description="Attraction, tension, charged territory. These questions go where most conversations don't, and they're specific about it."
                    examples={["When you're genuinely attracted to someone, where's the line between curiosity and action?","You've held eye contact a beat too long and neither of you broke it — what were you communicating?"]}
                    symbol={<SpicySymbol/>}
                  />
                </div>
              )}

              {/* FAQ */}
              {tab === 'faq' && (
                <div>
                  <FAQ q="Do we need accounts?"
                    a="No. Enter a name, share a link, game starts. Nothing stored beyond your session." />
                  <FAQ q="What if I close the tab?"
                    a={<>Use your personal return link — the <strong style={{ color:'var(--th-text-2)' }}>Copy my link</strong> button next to your name in the header. It re-opens your session on any device, even a different browser. Without it, re-entering from the same browser usually works, but isn&apos;t guaranteed.</>} />
                  <FAQ q="How do I share the game with the other player?"
                    a="Copy the link on the waiting screen and send it to them. That same link is what they use to join — and what you both use to return." />
                  <FAQ q="Can both players close a card?"
                    a="Yes. Tapping Done closes it for both of you simultaneously. Either player can trigger it." />
                  <FAQ q="What happens when we run out of questions?"
                    a="The pool resets quietly and starts again. You'll never be stuck." />
                  <FAQ q="Can we skip a question?"
                    a="There's no skip button — part of the game is not knowing what's coming. You can always close the card and talk about something else if it feels like too much." />
                  <FAQ q="Are our responses saved?"
                    a="Yes. Every message thread is stored and tied to that card. Tap any drawn card in the grid to re-open the thread at any time during the session." />
                  <FAQ q="Can we add our own questions?"
                    a={<>On your turn, tap <strong style={{ color:'var(--th-text-2)' }}>Add a question</strong> above the Draw button. Write it, choose a tier, send it. The other player accepts or declines. Accepted questions enter the live pool and can be drawn randomly just like any other card.</>} />
                  <FAQ q="What does the connection dot mean?"
                    a={<><strong style={{ color:'var(--tier-light)' }}>Green</strong> — connected and live. <strong style={{ color:'#fbbf24' }}>Yellow</strong> — reconnecting. <strong style={{ color:'var(--tier-deep)' }}>Red</strong> — offline, refresh to restore. Real-time events (draws, messages, card closes) all rely on the live connection.</>} />
                  <FAQ q="Can I change the theme?"
                    a="Yes — the Theme button sits in the header row next to the player names. Pick from dark and light palettes. Your choice is saved and applies across all sessions on that device." />
                  <FAQ q="How long does a room last?"
                    a="24 hours from creation. After that the link expires and the session ends. For longer conversations, finish in one sitting or save your return link early." />
                </div>
              )}

              <div style={{ height:16 }}/>
            </div>
          </div>

          {/* ── CTA ── */}
          {isOverlay && (
            <div style={{ padding:'14px 22px max(22px,env(safe-area-inset-bottom)) 22px', background:'linear-gradient(to top,var(--th-bg) 65%,transparent)', flexShrink:0 }}>
              {/* Tiny promise line */}
              <p style={{ fontFamily:'var(--font-brand-serif)', color:'var(--th-text-3)', fontSize:'0.80rem', fontStyle:'italic', textAlign:'center', marginBottom:12, lineHeight:1.5 }}>
                No map. No rules. Just whatever you&apos;re willing to say.
              </p>
              <button className="htp-cta" onClick={onClose}>
                <div className="htp-cta-shimmer" style={{ position:'absolute', top:0, bottom:0, width:'35%', background:'linear-gradient(90deg,transparent,var(--th-border-2),transparent)', pointerEvents:'none' }}/>
                I&apos;m ready — let&apos;s begin
              </button>
            </div>
          )}

          {/* Standalone footer */}
          {!isOverlay && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, opacity:0.12, userSelect:'none', pointerEvents:'none', padding:'24px 0 32px' }}>
              <AbyssSignil size={9} opacity={1}/>
              <span style={{ fontFamily:'var(--font-brand-mono)', fontSize:'0.55rem', color:'var(--th-brand)', letterSpacing:'0.18em', textTransform:'lowercase' }}>abyssprotocol</span>
            </div>
          )}
        </main>
      </div>
    </>
  )
}