'use client'

import { useParams }      from 'next/navigation'
import { useRouter }      from 'next/navigation'
import { useRoomState }   from './exits/hooks/useRoomState'
import { JoinScreen }     from './_components/JoinScreen'
import { WaitingScreen }  from './_components/WaitingScreen'
import { Toast }          from './_components/Toast'
import { BrandWatermark } from './_components/BrandWatermark'
import {
  ConsentBanner,
  PendingNotice,
  PlayerHeader,
} from './_components/ConsentBanner'
import { CoachTip }       from './_components/CoachTip'
import { ProposeModal }   from './_components/ProposeModal'
import { TurnBanner }     from '@/components/TurnBanner'
import { QuestionGrid }   from '@/components/QuestionGrid'
import { DrawButton }     from '@/components/DrawButton'
import { PickModal }      from '@/components/PickModal'
import { ThemeToggle }    from '@/components/ThemeToggle'
import {
  notificationsNeverAsked,
  requestNotificationPermission,
} from '@/lib/notifications'
import type { PlayerSlot } from '@/lib/supabase'
import Link               from 'next/link'
import { useState, useEffect } from 'react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function LoadingSpinner() {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{
        minHeight:      '100dvh',
        background:     'var(--th-bg)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:             20,
      }}>
        <div style={{
          width:          28,
          height:         28,
          borderRadius:   '50%',
          border:         '2px solid var(--th-border-2)',
          borderTopColor: 'var(--th-text-3)',
          animation:      'spin 0.8s linear infinite',
        }} />
        <BrandWatermark />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// NotificationPromptBanner
// ---------------------------------------------------------------------------

function NotificationPromptBanner({ onDone }: { onDone: () => void }) {
  const [loading,   setLoading]   = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function handleEnable() {
    setLoading(true)
    await requestNotificationPermission()
    setLoading(false)
    setDismissed(true)
    onDone()
  }

  function handleDismiss() {
    try { localStorage.setItem('r13-notif-asked', '1') } catch { /* ignore */ }
    setDismissed(true)
    onDone()
  }

  return (
    <>
      <style>{`
        @keyframes npb-in { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .npb-root { animation: npb-in 0.32s cubic-bezier(0.22,1,0.36,1) both; font-family:'Figtree',system-ui,sans-serif; }
      `}</style>

      <div
        className="npb-root"
        style={{
          margin:       '10px 16px 0',
          padding:      '12px 15px',
          borderRadius:  14,
          background:   'var(--th-surface)',
          border:       '1px solid rgba(96,165,250,0.22)',
          display:      'flex',
          alignItems:   'flex-start',
          gap:           10,
        }}
      >
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z"
              stroke="#60a5fa" strokeWidth="1.4" strokeLinejoin="round"
            />
            <path
              d="M8.5 16.5a1.5 1.5 0 0 0 3 0"
              stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round"
            />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color:        'var(--th-text-1)',
            fontSize:     '0.78rem',
            fontWeight:    500,
            marginBottom:  3,
            lineHeight:    1.4,
          }}>
            Get notified when they move
          </div>
          <div style={{
            color:      'var(--th-text-3)',
            fontSize:   '0.70rem',
            lineHeight:  1.55,
          }}>
            You&apos;ll get a ping when a card is drawn or a message arrives — even if you&apos;re in another tab.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button
            onClick={handleEnable}
            disabled={loading}
            style={{
              padding:       '5px 12px',
              borderRadius:   8,
              background:    'rgba(96,165,250,0.12)',
              border:        '1px solid rgba(96,165,250,0.30)',
              color:         '#60a5fa',
              fontSize:      '0.70rem',
              fontWeight:     600,
              cursor:         loading ? 'default' : 'pointer',
              fontFamily:    "'Figtree',system-ui,sans-serif",
              whiteSpace:    'nowrap',
              transition:    'background 0.15s ease',
            }}
            onMouseEnter={e => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(96,165,250,0.20)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(96,165,250,0.12)'
            }}
          >
            {loading ? 'Asking…' : 'Enable'}
          </button>

          <button
            onClick={handleDismiss}
            style={{
              padding:    '5px 12px',
              borderRadius: 8,
              background: 'none',
              border:     '1px solid var(--th-border)',
              color:      'var(--th-text-4)',
              fontSize:   '0.70rem',
              cursor:     'pointer',
              fontFamily: "'Figtree',system-ui,sans-serif",
              whiteSpace: 'nowrap',
              transition: 'border-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.borderColor = 'var(--th-border-2)'
              b.style.color = 'var(--th-text-3)'
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.borderColor = 'var(--th-border)'
              b.style.color = 'var(--th-text-4)'
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// GameEndedScreen
// ---------------------------------------------------------------------------

function GameEndedScreen({
  p1Name, p2Name, cardsDrawn, mySlot,
}: {
  p1Name:     string
  p2Name:     string
  cardsDrawn: number
  mySlot:     PlayerSlot
}) {
  const router = useRouter()

  const myName    = mySlot === 1 ? p1Name : p2Name
  const otherName = mySlot === 1 ? p2Name : p1Name

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Figtree:wght@300;400;500;600&display=swap');

        @keyframes ge-in    { from{opacity:0} to{opacity:1} }
        @keyframes ge-card  { from{opacity:0;transform:translateY(32px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes ge-dot-1 { 0%,100%{transform:scale(1);opacity:0.40} 50%{transform:scale(1.30);opacity:1} }
        @keyframes ge-dot-2 { 0%,100%{transform:scale(1);opacity:0.40} 50%{transform:scale(1.30);opacity:1} }
        @keyframes ge-dot-3 { 0%,100%{transform:scale(1);opacity:0.40} 50%{transform:scale(1.30);opacity:1} }
        @keyframes ge-dot-4 { 0%,100%{transform:scale(1);opacity:0.40} 50%{transform:scale(1.30);opacity:1} }

        .ge-backdrop { animation: ge-in   0.35s ease both; }
        .ge-card     { animation: ge-card 0.52s cubic-bezier(0.22,1,0.36,1) 0.10s both; }
        .ge-dot-1    { animation: ge-dot-1 2.8s ease-in-out 0.0s infinite; }
        .ge-dot-2    { animation: ge-dot-2 2.8s ease-in-out 0.3s infinite; }
        .ge-dot-3    { animation: ge-dot-3 2.8s ease-in-out 0.6s infinite; }
        .ge-dot-4    { animation: ge-dot-4 2.8s ease-in-out 0.9s infinite; }

        .ge-home-btn {
          width: 100%;
          height: 52px;
          border-radius: 16px;
          background: var(--th-surface);
          border: 1px solid var(--th-border-2);
          color: var(--th-text-1);
          font-family: 'Figtree', system-ui, sans-serif;
          font-size: 0.92rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.18s ease;
          letter-spacing: 0.02em;
        }
        .ge-home-btn:hover { background: var(--th-surface-2); transform: translateY(-1px); }
        .ge-home-btn:active { transform: scale(0.98); }
      `}</style>

      <div
        className="ge-backdrop"
        style={{
          position:        'fixed',
          inset:            0,
          zIndex:           100,
          background:      'var(--th-overlay)',
          backdropFilter:  'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          padding:         '24px 20px',
          fontFamily:      "'Figtree', system-ui, sans-serif",
        }}
      >
        <div className="ge-card" style={{ width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:0 }}>
          <div style={{
            background:   'var(--th-surface)',
            border:       '1px solid var(--th-border-2)',
            borderRadius: 24,
            padding:      '32px 26px 28px',
            boxShadow:    '0 24px 64px rgba(0,0,0,0.24)',
            display:      'flex',
            flexDirection:'column',
            alignItems:   'center',
            gap:           0,
            marginBottom: 14,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
              {['#4ade80','#60a5fa','#f87171','#c084fc'].map((c, i) => (
                <div key={c} className={`ge-dot-${i+1}`} style={{ width:7, height:7, borderRadius:'50%', background:c, boxShadow:`0 0 8px ${c}99` }}/>
              ))}
            </div>
            <div style={{ fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-4)', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', marginBottom:10 }}>
              Session complete
            </div>
            <h2 style={{ fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-1)', fontSize:'1.8rem', fontWeight:700, lineHeight:1.15, textAlign:'center', marginBottom:8 }}>
              That&apos;s a wrap.
            </h2>
            <p style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.84rem', fontStyle:'italic', textAlign:'center', lineHeight:1.65, marginBottom:28 }}>
              Both of you agreed to end the session.
            </p>
            <div style={{ width:'100%', height:1, background:'var(--th-border)', marginBottom:22 }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginBottom:22 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--th-surface-2)', border:'1px solid var(--th-border-2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-1)', fontSize:'0.70rem', fontWeight:700 }}>
                  {myName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-2)', fontSize:'0.72rem' }}>
                  {myName}<span style={{ color:'var(--th-text-4)', fontSize:'0.60rem', marginLeft:4 }}>you</span>
                </span>
              </div>
              <span style={{ color:'var(--th-text-4)', fontSize:'0.72rem', fontFamily:"'Syne',system-ui,sans-serif", fontWeight:700 }}>×</span>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--th-surface-2)', border:'1px solid var(--th-border)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-2)', fontSize:'0.70rem', fontWeight:700 }}>
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.72rem' }}>{otherName}</span>
              </div>
            </div>
            <div style={{ width:'100%', padding:'12px 16px', borderRadius:12, background:'var(--th-bg-alt)', border:'1px solid var(--th-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.72rem' }}>Cards drawn this session</span>
              <span style={{ fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-1)', fontSize:'1.1rem', fontWeight:700 }}>{cardsDrawn}</span>
            </div>
          </div>
          <button className="ge-home-btn" onClick={() => router.push('/')}>Return home</button>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginTop:16, opacity:0.15, userSelect:'none', pointerEvents:'none' }}>
            <span style={{ fontFamily:"'Syne',system-ui,sans-serif", fontSize:'0.52rem', color:'var(--th-brand)', letterSpacing:'0.18em', textTransform:'lowercase' }}>abyssprotocol · room 13</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// EndGameConsentBanner
// ---------------------------------------------------------------------------

function EndGameConsentBanner({
  proposerSlot, p1Name, p2Name, onAccept, onDecline,
}: {
  proposerSlot: PlayerSlot
  p1Name:       string
  p2Name:       string
  onAccept:     () => void
  onDecline:    () => void
}) {
  const proposerName = proposerSlot === 1 ? p1Name : p2Name
  return (
    <>
      <style>{`
        @keyframes egcb-in { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .egcb-root { animation: egcb-in 0.32s cubic-bezier(0.22,1,0.36,1) both; font-family:'Figtree',system-ui,sans-serif; }
      `}</style>
      <div className="egcb-root" style={{ margin:'12px 16px 0', borderRadius:18, background:'var(--th-surface)', border:'1px solid rgba(248,113,113,0.22)', boxShadow:'0 4px 24px rgba(248,113,113,0.08)', padding:'16px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#f87171', boxShadow:'0 0 8px #f87171', flexShrink:0 }}/>
          <span style={{ fontFamily:"'Syne',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.64rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase' }}>End session request</span>
        </div>
        <p style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-2)', fontSize:'0.88rem', lineHeight:1.55, marginBottom:6 }}>
          <strong style={{ color:'var(--th-text-1)' }}>{proposerName}</strong> wants to end the session.
        </p>
        <p style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.76rem', fontStyle:'italic', lineHeight:1.55, marginBottom:16 }}>
          Both players must agree. Declined keeps the game going.
        </p>
        <div style={{ display:'flex', gap:8 }}>
          {/* FIX: const-extract the button ref to eliminate ASI ambiguity on multi-property handlers */}
          <button
            onClick={onDecline}
            style={{ flex:1, height:42, borderRadius:11, background:'transparent', border:'1px solid var(--th-border)', color:'var(--th-text-3)', fontSize:'0.78rem', fontWeight:500, cursor:'pointer', fontFamily:"'Figtree',system-ui,sans-serif", transition:'border-color 0.15s ease,color 0.15s ease' }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.borderColor = 'var(--th-border-2)'
              b.style.color = 'var(--th-text-2)'
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.borderColor = 'var(--th-border)'
              b.style.color = 'var(--th-text-3)'
            }}
          >
            Keep playing
          </button>
          <button
            onClick={onAccept}
            style={{ flex:2, height:42, borderRadius:11, background:'rgba(248,113,113,0.10)', border:'1px solid rgba(248,113,113,0.28)', color:'#f87171', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:"'Figtree',system-ui,sans-serif", transition:'background 0.15s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.16)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.10)' }}
          >
            End session
          </button>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// PendingEndGameNotice
// ---------------------------------------------------------------------------

function PendingEndGameNotice() {
  return (
    <div style={{ margin:'12px 16px 0', padding:'10px 16px', borderRadius:12, background:'var(--th-surface)', border:'1px solid var(--th-border)', fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:5, height:5, borderRadius:'50%', background:'#f87171', boxShadow:'0 0 6px #f87171', flexShrink:0 }}/>
      Waiting for them to accept the end request...
    </div>
  )
}

// ---------------------------------------------------------------------------
// GuestHostBanner
// ---------------------------------------------------------------------------

function GuestHostBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <>
      <style>{`
        @keyframes ghb-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ghb-root { animation: ghb-in 0.40s cubic-bezier(0.22,1,0.36,1) both; font-family:'Figtree',system-ui,sans-serif; }
        .ghb-link { color:var(--th-text-2);text-decoration:none;font-size:0.76rem;font-weight:500;display:inline-flex;align-items:center;gap:4px;transition:color 0.18s ease;white-space:nowrap; }
        .ghb-link:hover { color:var(--th-text-1); }
        .ghb-dismiss { background:none;border:none;color:var(--th-text-4);cursor:pointer;font-size:1rem;line-height:1;padding:0 2px;flex-shrink:0;transition:color 0.15s ease; }
        .ghb-dismiss:hover { color:var(--th-text-3); }
      `}</style>
      <div className="ghb-root" style={{ position:'fixed', bottom:106, left:0, right:0, zIndex:35, display:'flex', justifyContent:'center', padding:'0 16px', pointerEvents:'none' }}>
        <div style={{ pointerEvents:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, width:'100%', maxWidth:390, padding:'10px 14px', borderRadius:12, background:'var(--th-surface)', border:'1px solid var(--th-border-2)', boxShadow:'0 4px 20px rgba(0,0,0,0.14)' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--th-text-4)', flexShrink:0 }}/>
          <span style={{ color:'var(--th-text-3)', fontSize:'0.74rem', flex:1, lineHeight:1.4 }}>Enjoying this?</span>
          <Link href="/" className="ghb-link">
            Host your own room
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <button className="ghb-dismiss" onClick={() => setDismissed(true)} aria-label="Dismiss">×</button>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string

  const [proposeOpen,       setProposeOpen]       = useState(false)
  const [endConfirm,        setEndConfirm]        = useState(false)
  const [showNotifBanner,   setShowNotifBanner]   = useState(false)

  const {
    room, mySlot, needsJoin, hasBothPlayers, currentTurn, cards, activePick,
    pendingProposal, messages, toast, unreadCardIndices, myPersonalUrl,
    joinLoading, drawLoading, proposeLoading, consentLoading, isSendingMessage,
    channelStatus, otherIsTyping, otherTypingIndex,
    endGameProposal, gameEnded,
    handleJoin, handleDraw, handleOpenCard, handleCloseCard,
    handlePropose, handleConsent, handleSendMessage, handleEditMessage,
    handleTyping, handleProposeEnd, handleEndGameConsent, clearToast,
  } = useRoomState(roomId)

  useEffect(() => {
    if (hasBothPlayers && notificationsNeverAsked()) {
      const t = setTimeout(() => setShowNotifBanner(true), 1_200)
      return () => clearTimeout(t)
    }
  }, [hasBothPlayers])

  const isMyTurn   = mySlot !== null && currentTurn === mySlot
  const canPropose = !pendingProposal

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/r/${roomId}` : ''

  const p1Name = room?.player1_name ?? 'Player 1'
  const p2Name = room?.player2_name ?? 'Player 2'
  const myName = mySlot === 1 ? p1Name : p2Name

  const drawerName = currentTurn === 1 ? p1Name : p2Name

  const draftKey = activePick
    ? `f9q-draft-${roomId}-${activePick.questionIndex}`
    : ''

  const showGuestHostBanner = mySlot === 2 && hasBothPlayers && cards.length >= 5

  const showEndSessionTrigger =
    hasBothPlayers &&
    endGameProposal === null &&
    !gameEnded

  if (!room)                           return <LoadingSpinner />
  if (needsJoin)                       return <JoinScreen onJoin={handleJoin} loading={joinLoading} />
  if (!hasBothPlayers && mySlot === 1) return <WaitingScreen shareUrl={shareUrl} />

  const showCoachTip = hasBothPlayers && cards.length === 0 && !pendingProposal && !endGameProposal

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }

        @keyframes es-arm {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0);   }
        }
        .es-armed { animation: es-arm 0.22s ease both; }
      `}</style>

      <main style={{ minHeight:'100dvh', background:'var(--th-bg)', paddingBottom:140 }}>

        <PlayerHeader
          p1Name={p1Name}
          p2Name={p2Name}
          mySlot={mySlot ?? 1}
          myPersonalUrl={myPersonalUrl}
          themeToggle={<ThemeToggle />}
        />

        <TurnBanner
          currentTurn={currentTurn}
          mySlot={mySlot ?? 1}
          player1Name={p1Name}
          player2Name={p2Name}
          channelStatus={channelStatus}
        />

        {showCoachTip && (
          <CoachTip isMyTurn={isMyTurn} drawerName={drawerName} />
        )}

        {showNotifBanner && (
          <NotificationPromptBanner onDone={() => setShowNotifBanner(false)} />
        )}

        {pendingProposal && pendingProposal.proposedBy !== mySlot && (
          <ConsentBanner
            proposal={pendingProposal}
            onAccept={() => handleConsent(true)}
            onDecline={() => handleConsent(false)}
            loading={consentLoading}
          />
        )}
        {pendingProposal && pendingProposal.proposedBy === mySlot && <PendingNotice />}

        {endGameProposal !== null && endGameProposal !== mySlot && (
          <EndGameConsentBanner
            proposerSlot={endGameProposal}
            p1Name={p1Name}
            p2Name={p2Name}
            onAccept={() => handleEndGameConsent(true)}
            onDecline={() => handleEndGameConsent(false)}
          />
        )}

        {endGameProposal !== null && endGameProposal === mySlot && (
          <PendingEndGameNotice />
        )}

        <div style={{ height:16 }} />

        <QuestionGrid
          cards={cards}
          onOpen={handleOpenCard}
          unreadIndices={unreadCardIndices}
        />

        {showEndSessionTrigger && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'4px 16px 8px' }}>
            {!endConfirm ? (
              <button
                onClick={() => setEndConfirm(true)}
                style={{ background:'none', border:'none', padding:'6px 12px', cursor:'pointer', color:'var(--th-text-4)', fontSize:'0.68rem', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.04em', transition:'color 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--th-text-3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--th-text-4)' }}
              >
                End session
              </button>
            ) : (
              <div className="es-armed" style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:12, background:'var(--th-surface)', border:'1px solid rgba(248,113,113,0.22)' }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'#f87171', flexShrink:0 }}/>
                <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", color:'var(--th-text-3)', fontSize:'0.70rem' }}>
                  Both players must agree to end.
                </span>
                <button
                  onClick={async () => { setEndConfirm(false); await handleProposeEnd() }}
                  style={{ background:'rgba(248,113,113,0.10)', border:'1px solid rgba(248,113,113,0.28)', borderRadius:8, padding:'4px 12px', color:'#f87171', fontSize:'0.70rem', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", whiteSpace:'nowrap', transition:'background 0.15s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.18)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.10)' }}
                >
                  Send request
                </button>
                <button
                  onClick={() => setEndConfirm(false)}
                  style={{ background:'none', border:'none', color:'var(--th-text-4)', fontSize:'0.9rem', cursor:'pointer', padding:'0 2px', lineHeight:1 }}
                  aria-label="Cancel"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ paddingBottom:8 }}>
          <BrandWatermark />
        </div>
      </main>

      {showGuestHostBanner && <GuestHostBanner />}

      <DrawButton
        isMyTurn={isMyTurn && hasBothPlayers}
        isLoading={drawLoading}
        canPropose={canPropose}
        onDraw={handleDraw}
        onPropose={() => setProposeOpen(true)}
      />

      {activePick && (
        <PickModal
          questionText={activePick.questionText}
          tier={activePick.tier}
          isCustom={activePick.isCustom}
          drawnByName={activePick.drawnByName}
          isMyDraw={activePick.isMyDraw}
          onClose={handleCloseCard}
          questionIndex={activePick.questionIndex}
          mySlot={mySlot ?? 1}
          myName={myName}
          messages={messages}
          onSendMessage={handleSendMessage}
          onEdit={handleEditMessage}
          isSendingMessage={isSendingMessage}
          onTyping={handleTyping}
          isOtherTyping={otherIsTyping && otherTypingIndex === activePick.questionIndex}
          draftKey={draftKey}
        />
      )}

      {proposeOpen && (
        <ProposeModal
          onSubmit={async (text, tier) => {
            await handlePropose(text, tier)
            setProposeOpen(false)
          }}
          onCancel={() => setProposeOpen(false)}
          loading={proposeLoading}
        />
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}

      {gameEnded && (
        <GameEndedScreen
          p1Name={p1Name}
          p2Name={p2Name}
          cardsDrawn={cards.length}
          mySlot={mySlot ?? 1}
        />
      )}
    </>
  )
}