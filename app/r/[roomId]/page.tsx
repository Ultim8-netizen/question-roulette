'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { Room, PlayerSlot, QuestionTier, PendingQuestion, RoomEvent, Message } from '@/lib/supabase'
import { useRoomChannel } from '@/hooks/useRoomChannel'
import { TurnBanner } from '@/components/TurnBanner'
import { QuestionGrid, type DrawnCard } from '@/components/QuestionGrid'
import { DrawButton } from '@/components/DrawButton'
import { PickModal } from '@/components/PickModal'

// ---------------------------------------------------------------------------
// Brand sigil — inline, reused across all screens in this file
// ---------------------------------------------------------------------------

function AbyssSignil({ size = 10, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity, flexShrink: 0 }}
    >
      <circle
        cx="16" cy="16" r="9"
        stroke="#c8d0de"
        strokeWidth="1.4"
        strokeDasharray="22 6"
        strokeDashoffset="3"
      />
      <line
        x1="16" y1="4" x2="16" y2="28"
        stroke="#c8d0de"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2" fill="#c8d0de" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Shared ghost watermark
// ---------------------------------------------------------------------------

function BrandWatermark() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        opacity: 0.18,
        userSelect: 'none',
        pointerEvents: 'none',
        marginTop: 24,
      }}
    >
      <AbyssSignil size={9} opacity={1} />
      <span
        style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: '0.55rem',
          fontWeight: 400,
          letterSpacing: '0.18em',
          color: '#c8d0de',
          textTransform: 'lowercase',
        }}
      >
        abyssprotocol
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier config
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<QuestionTier, string> = {
  light: 'Light', medium: 'Medium', deep: 'Deep', spicy: 'Spicy',
}
const TIER_COLORS: Record<QuestionTier, string> = {
  light: '#4ade80', medium: '#60a5fa', deep: '#f87171', spicy: '#c084fc',
}
const ALL_TIERS: QuestionTier[] = ['light', 'medium', 'deep', 'spicy']

// ---------------------------------------------------------------------------
// Propose modal
// ---------------------------------------------------------------------------

function ProposeModal({
  onSubmit, onCancel, loading,
}: {
  onSubmit: (text: string, tier: QuestionTier) => void
  onCancel: () => void
  loading:  boolean
}) {
  const [text, setText] = useState('')
  const [tier, setTier] = useState<QuestionTier>('medium')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes pm2-in { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pm2-bg { from { opacity:0 } to { opacity:1 } }
        .pm2-bg   { animation: pm2-bg 0.22s ease both; font-family:'DM Sans',system-ui,sans-serif; }
        .pm2-sheet{ animation: pm2-in 0.38s cubic-bezier(0.22,1.2,0.36,1) both; }
      `}</style>
      <div
        className="pm2-bg fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
        style={{ background:'rgba(2,2,6,0.88)', backdropFilter:'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      >
        <div className="pm2-sheet w-full" style={{ maxWidth:390 }}>
          <div style={{
            background:'linear-gradient(160deg,#0c0e16,#090a12)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:22,
            padding:'24px 20px 20px',
          }}>
            <div className="flex items-center justify-between mb-5">
              <span style={{ fontFamily:"'Cormorant Garamond',serif", color:'#c8d0de', fontSize:'1.1rem', fontWeight:600 }}>
                Propose a question
              </span>
              <button onClick={onCancel} style={{ background:'none', border:'none', color:'#334155', cursor:'pointer', padding:4 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={280}
              placeholder="Write your question..."
              rows={3}
              style={{
                width:'100%', resize:'none', borderRadius:12,
                background:'#070810', border:'1px solid rgba(255,255,255,0.07)',
                color:'#d1d9e6', fontSize:'0.90rem', padding:'12px 14px',
                fontFamily:"'DM Sans',system-ui,sans-serif",
                outline:'none', boxSizing:'border-box', lineHeight:1.55,
              }}
            />
            <div style={{ textAlign:'right', color:'#1e2535', fontSize:'0.65rem', marginTop:4, marginBottom:16 }}>
              {text.length}/280
            </div>

            <div style={{ marginBottom:20 }}>
              <span style={{ color:'#334155', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', display:'block', marginBottom:8 }}>
                Intensity
              </span>
              <div style={{ display:'flex', gap:8 }}>
                {ALL_TIERS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    style={{
                      flex:1, height:34, borderRadius:10,
                      border: tier === t ? `1.5px solid ${TIER_COLORS[t]}55` : '1px solid rgba(255,255,255,0.06)',
                      background: tier === t ? `${TIER_COLORS[t]}12` : 'transparent',
                      color: tier === t ? TIER_COLORS[t] : '#334155',
                      fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.06em',
                      cursor:'pointer', transition:'all 0.18s ease',
                    }}
                  >
                    {TIER_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!text.trim() || loading}
              onClick={() => text.trim() && onSubmit(text.trim(), tier)}
              style={{
                width:'100%', height:50, borderRadius:14,
                background: text.trim() && !loading ? 'linear-gradient(135deg,#151820,#0e1018)' : '#06070c',
                border: text.trim() && !loading ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.03)',
                color: text.trim() && !loading ? '#c8d0de' : '#1e2535',
                fontSize:'0.82rem', fontWeight:500, letterSpacing:'0.04em',
                cursor: text.trim() && !loading ? 'pointer' : 'default',
                transition:'all 0.2s ease',
                fontFamily:"'DM Sans',system-ui,sans-serif",
              }}
            >
              {loading ? 'Sending...' : 'Send to other player'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Consent banner
// ---------------------------------------------------------------------------

function ConsentBanner({
  proposal, onAccept, onDecline, loading,
}: {
  proposal: PendingQuestion
  onAccept: () => void
  onDecline: () => void
  loading:  boolean
}) {
  const color = TIER_COLORS[proposal.tier]
  return (
    <>
      <style>{`
        @keyframes cb-in { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        .cb-root { animation: cb-in 0.32s cubic-bezier(0.22,1,0.36,1) both; font-family:'DM Sans',system-ui,sans-serif; }
      `}</style>
      <div
        className="cb-root mx-4 mt-3 rounded-[18px] overflow-hidden"
        style={{
          background:'linear-gradient(150deg,#0a0c14,#07080f)',
          border:`1px solid ${color}22`,
          boxShadow:`0 4px 24px ${color}0e`,
          padding:'16px 18px',
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }} />
          <span style={{ color:'#475569', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            Question proposal
          </span>
          <span style={{ marginLeft:'auto', color:color, fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.06em' }}>
            {TIER_LABELS[proposal.tier]}
          </span>
        </div>

        <p style={{
          fontFamily:"'Cormorant Garamond',serif",
          color:'#94a3b8', fontSize:'0.92rem', fontWeight:500,
          lineHeight:1.55, marginBottom:14,
        }}>
          &ldquo;{proposal.text}&rdquo;
        </p>

        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={onDecline}
            disabled={loading}
            style={{
              flex:1, height:40, borderRadius:11,
              background:'transparent',
              border:'1px solid rgba(255,255,255,0.06)',
              color:'#334155', fontSize:'0.78rem', fontWeight:500,
              cursor:'pointer', transition:'all 0.18s ease',
              fontFamily:"'DM Sans',system-ui,sans-serif",
            }}
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={loading}
            style={{
              flex:2, height:40, borderRadius:11,
              background:`linear-gradient(135deg,${color}18,${color}0c)`,
              border:`1px solid ${color}33`,
              color, fontSize:'0.78rem', fontWeight:600,
              cursor:'pointer', transition:'all 0.18s ease',
              fontFamily:"'DM Sans',system-ui,sans-serif",
            }}
          >
            {loading ? 'Adding...' : 'Accept'}
          </button>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <>
      <style>{`
        @keyframes toast-in  { from { opacity:0; transform:translateY(8px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes toast-out { from { opacity:1 } to { opacity:0 } }
        .toast-anim { animation: toast-in 0.28s ease both, toast-out 0.28s ease 2.3s both; }
      `}</style>
      <div className="toast-anim fixed top-5 left-0 right-0 flex justify-center z-60 pointer-events-none">
        <div style={{
          fontFamily:"'DM Sans',system-ui,sans-serif",
          background:'#13151e', border:'1px solid rgba(255,255,255,0.09)',
          borderRadius:99, padding:'9px 18px',
          color:'#94a3b8', fontSize:'0.78rem', fontWeight:400,
          boxShadow:'0 8px 32px rgba(0,0,0,0.55)',
        }}>
          {message}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Join screen
// ---------------------------------------------------------------------------

function JoinScreen({
  onJoin, loading,
}: { onJoin: (name: string) => void; loading: boolean }) {
  const [name, setName] = useState('')
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes js-in { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes js-sigil-pulse { 0%,100%{opacity:0.65} 50%{opacity:1} }
        .js-root   { animation: js-in 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .js-sigil  { animation: js-sigil-pulse 3s ease-in-out infinite; }
      `}</style>
      <div
        className="js-root fixed inset-0 flex flex-col items-center justify-center px-6"
        style={{ background:'#020308', fontFamily:"'DM Sans',system-ui,sans-serif" }}
      >
        <div className="js-sigil" style={{ marginBottom: 24 }}>
          <AbyssSignil size={36} />
        </div>
        <span style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.22em',
          color: '#334155', textTransform: 'lowercase', marginBottom: 20,
        }}>
          abyssprotocol
        </span>
        <h1 style={{
          fontFamily:"'Cormorant Garamond',serif",
          color:'#c8d0de', fontSize:'1.6rem', fontWeight:600,
          textAlign:'center', marginBottom:8, lineHeight:1.25,
        }}>
          You&apos;ve been invited
        </h1>
        <p style={{ color:'#334155', fontSize:'0.82rem', textAlign:'center', marginBottom:36, lineHeight:1.6 }}>
          A game of questions.<br />Enter your name to begin.
        </p>
        <div style={{ width:'100%', maxWidth:320 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onJoin(name.trim())}
            placeholder="Your name"
            maxLength={32}
            autoFocus
            style={{
              width:'100%', height:52, borderRadius:14,
              background:'#070810', border:'1px solid rgba(255,255,255,0.08)',
              color:'#d1d9e6', fontSize:'0.95rem', padding:'0 16px',
              outline:'none', boxSizing:'border-box',
              fontFamily:"'DM Sans',system-ui,sans-serif", marginBottom:12,
              transition:'border-color 0.2s ease',
            }}
            onFocus={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.14)')}
            onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
          <button
            disabled={!name.trim() || loading}
            onClick={() => name.trim() && onJoin(name.trim())}
            style={{
              width:'100%', height:52, borderRadius:14,
              background: name.trim() ? 'linear-gradient(135deg,#161921,#0f1017)' : '#06070c',
              border: name.trim() ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.03)',
              color: name.trim() ? '#c8d0de' : '#1e2535',
              fontSize:'0.88rem', fontWeight:500, letterSpacing:'0.04em',
              cursor: name.trim() && !loading ? 'pointer' : 'default',
              fontFamily:"'DM Sans',system-ui,sans-serif", transition:'all 0.2s ease',
            }}
          >
            {loading ? 'Entering the abyss...' : 'Join game'}
          </button>
        </div>
        <BrandWatermark />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Waiting screen
// ---------------------------------------------------------------------------

function WaitingScreen({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes ws-pulse  { 0%,100%{opacity:0.35} 50%{opacity:1} }
        @keyframes ws-in     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ws-sigil-pulse { 0%,100%{opacity:0.55} 50%{opacity:0.9} }
        .ws-root   { animation: ws-in 0.4s ease both; }
        .ws-dot    { animation: ws-pulse 1.4s ease-in-out infinite; }
        .ws-dot:nth-child(2) { animation-delay:0.2s }
        .ws-dot:nth-child(3) { animation-delay:0.4s }
        .ws-sigil  { animation: ws-sigil-pulse 3s ease-in-out infinite; }
      `}</style>
      <div
        className="ws-root fixed inset-0 flex flex-col items-center justify-center px-6"
        style={{ background:'#020308', fontFamily:"'DM Sans',system-ui,sans-serif" }}
      >
        <div className="ws-sigil" style={{ marginBottom: 20 }}>
          <AbyssSignil size={32} />
        </div>
        <span style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: '0.70rem', fontWeight: 500, letterSpacing: '0.22em',
          color: '#1e2535', textTransform: 'lowercase', marginBottom: 28,
        }}>
          abyssprotocol
        </span>
        <div className="flex gap-2 mb-8">
          {[0,1,2].map(i => (
            <div key={i} className="ws-dot" style={{ width:8, height:8, borderRadius:'50%', background:'#1e2535' }} />
          ))}
        </div>
        <h1 style={{
          fontFamily:"'Cormorant Garamond',serif",
          color:'#c8d0de', fontSize:'1.55rem', fontWeight:600,
          textAlign:'center', marginBottom:8,
        }}>
          Waiting for them
        </h1>
        <p style={{ color:'#334155', fontSize:'0.82rem', textAlign:'center', marginBottom:36, lineHeight:1.6 }}>
          Share the link below.<br />The game starts once they join.
        </p>
        <button
          onClick={copy}
          style={{
            display:'flex', alignItems:'center', gap:10,
            background:'#07080f', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:99, padding:'11px 18px',
            cursor:'pointer', transition:'border-color 0.2s ease',
            maxWidth: 320, width:'100%',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)')}
        >
          <span style={{
            flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            color:'#334155', fontSize:'0.72rem', textAlign:'left',
          }}>
            {shareUrl}
          </span>
          <span style={{
            color: copied ? '#4ade80' : '#475569',
            fontSize:'0.70rem', fontWeight:600, letterSpacing:'0.08em',
            flexShrink:0, transition:'color 0.2s ease',
          }}>
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
        <BrandWatermark />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type PickState = {
  questionIndex: number   // added: needed to scope message thread
  questionText:  string
  tier:          QuestionTier
  isCustom:      boolean
  drawnByName:   string
  isMyDraw:      boolean
}

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string

  // Core game state
  const [room,           setRoom]           = useState<Room | null>(null)
  const [mySlot,         setMySlot]         = useState<PlayerSlot | null>(null)
  const [needsJoin,      setNeedsJoin]      = useState(false)
  const [joinLoading,    setJoinLoading]    = useState(false)
  const [currentTurn,    setCurrentTurn]    = useState<PlayerSlot>(1)
  const [hasBothPlayers, setHasBothPlayers] = useState(false)
  const [cards,          setCards]          = useState<DrawnCard[]>([])
  const [drawLoading,    setDrawLoading]    = useState(false)
  const [activePick,     setActivePick]     = useState<PickState | null>(null)

  // Proposal / consent state
  const [proposeOpen,    setProposeOpen]    = useState(false)
  const [proposeLoading, setProposeLoading] = useState(false)
  const [pendingProposal,setPendingProposal]= useState<PendingQuestion | null>(null)
  const [consentLoading, setConsentLoading] = useState(false)

  // Toast
  const [toast, setToast] = useState<string | null>(null)

  // Messaging state — scoped to the currently open pick modal.
  // Cleared whenever activePick changes (new card drawn / modal closed).
  const [messages,         setMessages]         = useState<Message[]>([])
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // Stable refs to avoid stale closures inside useCallback
  const roomRef          = useRef<Room | null>(null)
  const mySlotRef        = useRef<PlayerSlot | null>(null)
  const activePickRef    = useRef<PickState | null>(null)

  useEffect(() => { roomRef.current       = room       }, [room])
  useEffect(() => { mySlotRef.current     = mySlot     }, [mySlot])
  useEffect(() => { activePickRef.current = activePick }, [activePick])

  // ── Realtime event handler ───────────────────────────────────────────────
  const handleEvent = useCallback((event: RoomEvent) => {
    const r = roomRef.current
    if (!r) return

    if (event.type === 'PLAYER_JOINED') {
      setRoom(prev => prev ? { ...prev, player2_name: event.name } : prev)
      setHasBothPlayers(true)
      setToast(`${event.name} joined the game`)
    }

    if (event.type === 'QUESTION_DRAWN') {
      const drawnByName = event.player === 1
        ? (r.player1_name ?? 'Player 1')
        : (r.player2_name ?? 'Player 2')

      setCards(prev => [...prev, {
        key:          `${event.questionIndex}-${Date.now()}`,
        questionText: event.questionText,
        tier:         event.tier,
        isCustom:     event.isCustom,
        drawnByName,
      }])

      setMessages([])
      setActivePick({
        questionIndex: event.questionIndex,
        questionText:  event.questionText,
        tier:          event.tier,
        isCustom:      event.isCustom,
        drawnByName,
        isMyDraw:      event.player === mySlotRef.current,
      })
    }

    if (event.type === 'TURN_ADVANCED') {
      setCurrentTurn(event.nextTurn)
    }

    if (event.type === 'QUESTION_PROPOSED') {
      if (event.proposedBy !== mySlotRef.current) {
        setPendingProposal({ text: event.text, tier: event.tier, proposedBy: event.proposedBy })
      }
    }

    if (event.type === 'QUESTION_ACCEPTED') {
      setPendingProposal(null)
      setToast('Custom question added to the pool')
    }

    if (event.type === 'QUESTION_DECLINED') {
      setPendingProposal(null)
      if (event.proposedBy === mySlotRef.current) {
        setToast('They passed on your question')
      }
    }

    if (event.type === 'MESSAGE_SENT') {
      // Only append if the message belongs to the currently open card thread.
      // (The sender already applied an optimistic update, so self is never received
      // here because channel.config.broadcast.self = false.)
      const current = activePickRef.current
      if (current && event.questionIndex === current.questionIndex) {
        setMessages(prev => [...prev, {
          id:             event.messageId,
          room_id:        roomId,
          question_index: event.questionIndex,
          player:         event.player,
          player_name:    event.playerName,
          content:        event.content,
          created_at:     event.createdAt,
        }])
      }
    }
  }, [roomId])

  const { sendEvent, status } = useRoomChannel({
    roomId,
    onEvent:  handleEvent,
    enabled:  !!room,
  })

  // ── Initial room load ────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return

    async function load() {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('roulette_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (error || !data) return

      const r = data as Room
      setRoom(r)
      setCurrentTurn(r.current_turn)
      setHasBothPlayers(!!r.player2_name)
      if (r.pending_question) setPendingProposal(r.pending_question)

      const stored = sessionStorage.getItem(`f9q-slot-${roomId}`)
      if (stored === '1') {
        setMySlot(1)
      } else if (stored === '2') {
        setMySlot(2)
      } else {
        if (!r.player2_name) {
          setNeedsJoin(true)
        } else {
          setMySlot(2)
          sessionStorage.setItem(`f9q-slot-${roomId}`, '2')
        }
      }
    }

    load()
  }, [roomId])

  // ── Join ─────────────────────────────────────────────────────────────────
  async function handleJoin(name: string) {
    setJoinLoading(true)
    const res = await fetch('/api/join', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ roomId, player2_name: name }),
    })
    if (!res.ok) {
      setJoinLoading(false)
      setToast('Could not join. Room may be full or expired.')
      return
    }
    const data = await res.json()
    sessionStorage.setItem(`f9q-slot-${roomId}`, '2')
    setMySlot(2)
    setNeedsJoin(false)
    setHasBothPlayers(true)
    setRoom(prev => prev ? { ...prev, player2_name: name, player1_name: data.player1_name } : prev)
    setJoinLoading(false)
    await sendEvent({ type: 'PLAYER_JOINED', player: 2, name })
  }

  // ── Draw ─────────────────────────────────────────────────────────────────
  async function handleDraw() {
    if (!mySlot || drawLoading) return
    setDrawLoading(true)

    const res = await fetch('/api/pick', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ roomId, player: mySlot }),
    })
    setDrawLoading(false)
    if (!res.ok) {
      setToast('Something went wrong. Try again.')
      return
    }

    const { questionIndex, questionText, tier, isCustom, nextTurn } = await res.json()
    const r = roomRef.current!
    const drawnByName = mySlot === 1 ? r.player1_name : (r.player2_name ?? 'Player 2')

    setCurrentTurn(nextTurn)
    setCards(prev => [...prev, {
      key: `${questionIndex}-${Date.now()}`,
      questionText, tier, isCustom, drawnByName,
    }])
    setMessages([])
    setActivePick({ questionIndex, questionText, tier, isCustom, drawnByName, isMyDraw: true })

    await sendEvent({ type: 'QUESTION_DRAWN', player: mySlot, questionIndex, questionText, tier, isCustom })
    await sendEvent({ type: 'TURN_ADVANCED', nextTurn })
  }

  // ── Propose ───────────────────────────────────────────────────────────────
  async function handlePropose(text: string, tier: QuestionTier) {
    if (!mySlot) return
    setProposeLoading(true)
    const res = await fetch('/api/questions/propose', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ roomId, proposedBy: mySlot, text, tier }),
    })
    setProposeLoading(false)
    if (!res.ok) {
      setToast('Could not send proposal. Try again.')
      return
    }
    setProposeOpen(false)
    setToast('Proposal sent. Waiting for their answer...')
    await sendEvent({ type: 'QUESTION_PROPOSED', proposedBy: mySlot, text, tier })
  }

  // ── Consent ───────────────────────────────────────────────────────────────
  async function handleConsent(accepted: boolean) {
    if (!mySlot) return
    setConsentLoading(true)
    const res = await fetch('/api/questions/respond', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ roomId, respondingPlayer: mySlot, accepted }),
    })
    setConsentLoading(false)
    if (!res.ok) { setToast('Something went wrong.'); return }

    const data = await res.json()
    setPendingProposal(null)

    if (accepted) {
      setToast('Question added to the pool')
      await sendEvent({ type: 'QUESTION_ACCEPTED', questionIndex: data.questionIndex, text: data.questionText, tier: data.tier })
    } else {
      await sendEvent({ type: 'QUESTION_DECLINED', proposedBy: pendingProposal!.proposedBy })
    }
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function handleSendMessage(content: string) {
    if (!mySlot || !activePick) return

    const r = roomRef.current
    const playerName = mySlot === 1
      ? (r?.player1_name ?? 'Player 1')
      : (r?.player2_name ?? 'Player 2')

    // Optimistic update — shows the message immediately for the sender.
    const optimisticId  = `optimistic-${Date.now()}`
    const optimisticMsg: Message = {
      id:             optimisticId,
      room_id:        roomId,
      question_index: activePick.questionIndex,
      player:         mySlot,
      player_name:    playerName,
      content,
      created_at:     new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMsg])

    setIsSendingMessage(true)
    const res = await fetch('/api/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        roomId,
        questionIndex: activePick.questionIndex,
        player:        mySlot,
        playerName,
        content,
      }),
    })
    setIsSendingMessage(false)

    if (!res.ok) {
      // Roll back the optimistic message on failure.
      setMessages(prev => prev.filter(m => m.id !== optimisticId))
      setToast('Message failed to send. Try again.')
      return
    }

    const { messageId, createdAt } = await res.json()

    // Replace optimistic placeholder with the real DB-assigned id + timestamp.
    setMessages(prev => prev.map(m =>
      m.id === optimisticId
        ? { ...m, id: messageId, created_at: createdAt }
        : m
    ))

    // Broadcast to the other player.
    await sendEvent({
      type:          'MESSAGE_SENT',
      questionIndex: activePick.questionIndex,
      player:        mySlot,
      playerName,
      content,
      messageId,
      createdAt,
    })
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const isMyTurn   = mySlot !== null && currentTurn === mySlot
  const canPropose = !pendingProposal
  const shareUrl   = typeof window !== 'undefined' ? window.location.href : ''
  const p1Name     = room?.player1_name ?? 'Player 1'
  const p2Name     = room?.player2_name ?? 'Player 2'
  const myName     = mySlot === 1 ? p1Name : p2Name

  // ── Early screens ─────────────────────────────────────────────────────────
  if (!room) {
    return (
      <div style={{
        minHeight:'100dvh', background:'#020308', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        fontFamily:"'DM Sans',system-ui,sans-serif", gap: 20,
      }}>
        <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #1e2535', borderTopColor:'#334155' }}
          className="spin" />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin 0.8s linear infinite}`}</style>
        <BrandWatermark />
      </div>
    )
  }

  if (needsJoin) return <JoinScreen onJoin={handleJoin} loading={joinLoading} />
  if (!hasBothPlayers && mySlot === 1) return <WaitingScreen shareUrl={shareUrl} />

  // ── Full game view ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { background: #020308; margin: 0; }
      `}</style>

      <main style={{ minHeight: '100dvh', background: '#020308', paddingBottom: 140 }}>

        {/* Player nameplate header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'18px 20px 0',
          fontFamily:"'DM Sans',system-ui,sans-serif",
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background:'linear-gradient(135deg,#1a1f30,#111520)',
              border:'1px solid rgba(255,255,255,0.08)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#475569', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.05em',
            }}>
              {p1Name.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: mySlot === 1 ? '#94a3b8' : '#334155', fontSize:'0.82rem', fontWeight:400 }}>
              {p1Name}
              {mySlot === 1 && <span style={{ color:'#1e2535', fontSize:'0.65rem', marginLeft:6 }}>you</span>}
            </span>
          </div>

          <span style={{ color:'#1e2535', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.12em' }}>VS</span>

          <div style={{ display:'flex', alignItems:'center', gap:8, flexDirection:'row-reverse' }}>
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background:'linear-gradient(135deg,#1a1f30,#111520)',
              border:'1px solid rgba(255,255,255,0.08)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#475569', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.05em',
            }}>
              {p2Name.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: mySlot === 2 ? '#94a3b8' : '#334155', fontSize:'0.82rem', fontWeight:400 }}>
              {p2Name}
              {mySlot === 2 && <span style={{ color:'#1e2535', fontSize:'0.65rem', marginRight:6 }}>you</span>}
            </span>
          </div>
        </div>

        {/* Turn banner */}
        <TurnBanner
          currentTurn={currentTurn}
          mySlot={mySlot ?? 1}
          player1Name={p1Name}
          player2Name={p2Name}
          channelStatus={status}
        />

        {/* Consent banner */}
        {pendingProposal && pendingProposal.proposedBy !== mySlot && (
          <ConsentBanner
            proposal={pendingProposal}
            onAccept={() => handleConsent(true)}
            onDecline={() => handleConsent(false)}
            loading={consentLoading}
          />
        )}

        {/* Pending notice */}
        {pendingProposal && pendingProposal.proposedBy === mySlot && (
          <div style={{
            margin:'12px 16px 0', padding:'10px 16px', borderRadius:12,
            background:'#07080f', border:'1px solid rgba(255,255,255,0.05)',
            fontFamily:"'DM Sans',system-ui,sans-serif", color:'#334155',
            fontSize:'0.72rem', display:'flex', alignItems:'center', gap:8,
          }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#fbbf24', boxShadow:'0 0 6px #fbbf24', flexShrink:0 }} />
            Waiting for them to accept your question...
          </div>
        )}

        <div style={{ height: 16 }} />

        <QuestionGrid cards={cards} />

        <div style={{ paddingBottom: 8 }}>
          <BrandWatermark />
        </div>
      </main>

      {/* Fixed draw button */}
      <DrawButton
        isMyTurn={isMyTurn && hasBothPlayers}
        isLoading={drawLoading}
        canPropose={canPropose}
        onDraw={handleDraw}
        onPropose={() => setProposeOpen(true)}
      />

      {/* Pick modal — now includes messaging */}
      {activePick && (
        <PickModal
          questionText={activePick.questionText}
          tier={activePick.tier}
          isCustom={activePick.isCustom}
          drawnByName={activePick.drawnByName}
          isMyDraw={activePick.isMyDraw}
          onClose={() => { setActivePick(null); setMessages([]) }}
          questionIndex={activePick.questionIndex}
          mySlot={mySlot ?? 1}
          myName={myName}
          messages={messages}
          onSendMessage={handleSendMessage}
          isSendingMessage={isSendingMessage}
        />
      )}

      {/* Propose modal */}
      {proposeOpen && (
        <ProposeModal
          onSubmit={handlePropose}
          onCancel={() => setProposeOpen(false)}
          loading={proposeLoading}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}