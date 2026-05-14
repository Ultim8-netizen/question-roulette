'use client'

import { useParams }      from 'next/navigation'
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
import Link               from 'next/link'
import { useState }       from 'react'

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
          width:       28,
          height:      28,
          borderRadius:'50%',
          border:      '2px solid var(--th-border-2)',
          borderTopColor: 'var(--th-text-3)',
          animation:   'spin 0.8s linear infinite',
        }} />
        <BrandWatermark />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// GuestHostBanner — Option A: persistent bottom banner for guests.
// Appears after 5 cards drawn. Sits above the DrawButton tray.
// ---------------------------------------------------------------------------

function GuestHostBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <>
      <style>{`
        @keyframes ghb-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .ghb-root {
          animation: ghb-in 0.40s cubic-bezier(0.22,1,0.36,1) both;
          font-family: 'Figtree', system-ui, sans-serif;
        }
        .ghb-link {
          color: var(--th-text-2);
          text-decoration: none;
          font-size: 0.76rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.18s ease;
          white-space: nowrap;
        }
        .ghb-link:hover { color: var(--th-text-1); }
        .ghb-dismiss {
          background: none;
          border: none;
          color: var(--th-text-4);
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0 2px;
          flex-shrink: 0;
          transition: color 0.15s ease;
        }
        .ghb-dismiss:hover { color: var(--th-text-3); }
      `}</style>

      {/* Fixed strip that sits just above the DrawButton tray.
          DrawButton tray is ~100px tall (64px button + padding).
          We sit at bottom: 106px so we never overlap the button itself. */}
      <div
        className="ghb-root"
        style={{
          position:       'fixed',
          bottom:          106,
          left:            0,
          right:           0,
          zIndex:          35,
          display:        'flex',
          justifyContent: 'center',
          padding:        '0 16px',
          pointerEvents:  'none',
        }}
      >
        <div
          style={{
            pointerEvents:  'auto',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:             12,
            width:           '100%',
            maxWidth:        390,
            padding:        '10px 14px',
            borderRadius:    12,
            background:     'var(--th-surface)',
            border:         '1px solid var(--th-border-2)',
            boxShadow:      '0 4px 20px rgba(0,0,0,0.14)',
          }}
        >
          {/* dot */}
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--th-text-4)', flexShrink: 0 }} />

          <span style={{ color: 'var(--th-text-3)', fontSize: '0.74rem', fontFamily: "'Figtree',system-ui,sans-serif", flex: 1, lineHeight: 1.4 }}>
            Enjoying this?
          </span>

          <Link href="/" className="ghb-link">
            Host your own room
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <button
            className="ghb-dismiss"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
          >
            ×
          </button>
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

  const [proposeOpen, setProposeOpen] = useState(false)

  const {
    room, mySlot, needsJoin, hasBothPlayers, currentTurn, cards, activePick,
    pendingProposal, messages, toast, unreadCardIndices, myPersonalUrl,
    joinLoading, drawLoading, proposeLoading, consentLoading, isSendingMessage,
    channelStatus, otherIsTyping, otherTypingIndex,
    handleJoin, handleDraw, handleOpenCard, handleCloseCard,
    handlePropose, handleConsent, handleSendMessage, handleEditMessage,
    handleTyping, clearToast,
  } = useRoomState(roomId)

  const isMyTurn  = mySlot !== null && currentTurn === mySlot
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

  // Option A: show banner for guests after 5 cards drawn
  const showGuestHostBanner = mySlot === 2 && hasBothPlayers && cards.length >= 5

  // ── Early returns ──────────────────────────────────────────────────────

  if (!room)                           return <LoadingSpinner />
  if (needsJoin)                       return <JoinScreen onJoin={handleJoin} loading={joinLoading} />
  if (!hasBothPlayers && mySlot === 1) return <WaitingScreen shareUrl={shareUrl} />

  // ── Main game render ───────────────────────────────────────────────────

  const showCoachTip = hasBothPlayers && cards.length === 0 && !pendingProposal

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <main style={{ minHeight: '100dvh', background: 'var(--th-bg)', paddingBottom: 140 }}>

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

        {pendingProposal && pendingProposal.proposedBy !== mySlot && (
          <ConsentBanner
            proposal={pendingProposal}
            onAccept={() => handleConsent(true)}
            onDecline={() => handleConsent(false)}
            loading={consentLoading}
          />
        )}
        {pendingProposal && pendingProposal.proposedBy === mySlot && <PendingNotice />}

        <div style={{ height: 16 }} />

        <QuestionGrid
          cards={cards}
          onOpen={handleOpenCard}
          unreadIndices={unreadCardIndices}
        />

        <div style={{ paddingBottom: 8 }}>
          <BrandWatermark />
        </div>
      </main>

      {/* Option A — guest host banner, above the draw tray */}
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
    </>
  )
}