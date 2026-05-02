'use client'

import { useParams } from 'next/navigation'
import { useRoomState } from './exits/hooks/useRoomState'
import { JoinScreen }     from './_components/JoinScreen'
import { WaitingScreen }  from './_components/WaitingScreen'
import { Toast }          from './_components/Toast'
import { BrandWatermark } from './_components/BrandWatermark'
import {
  ConsentBanner,
  PendingNotice,
  PlayerHeader,
} from './_components/ConsentBanner'
import { ProposeModal }   from './_components/ProposeModal'
import { TurnBanner }     from '@/components/TurnBanner'
import { QuestionGrid }   from '@/components/QuestionGrid'
import { DrawButton }     from '@/components/DrawButton'
import { PickModal }      from '@/components/PickModal'
import { ThemeToggle }    from '@/components/ThemeToggle'
import HowToPlayPage      from '@/app/how-to-play/page'
import { useState }       from 'react'

// ---------------------------------------------------------------------------
// sessionStorage — resets per browser tab
// ---------------------------------------------------------------------------

const HTP_SEEN_KEY = 'f9q-htp-seen'

function hasSeenHTP(): boolean {
  if (typeof window === 'undefined') return false
  try { return !!sessionStorage.getItem(HTP_SEEN_KEY) } catch { return false }
}

function markHTPSeen(): void {
  try { sessionStorage.setItem(HTP_SEEN_KEY, '1') } catch { /* private browsing */ }
}

// ---------------------------------------------------------------------------
// Loading spinner
// ---------------------------------------------------------------------------

function LoadingSpinner() {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ minHeight: '100dvh', background: 'var(--th-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--th-border-2)', borderTopColor: 'var(--th-text-3)', animation: 'spin 0.8s linear infinite' }} />
        <BrandWatermark />
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

  const [showHTP, setShowHTP] = useState<boolean>(() => !hasSeenHTP())

  function handleHTPClose() {
    markHTPSeen()
    setShowHTP(false)
  }

  const {
    room, mySlot, needsJoin, hasBothPlayers, currentTurn, cards, activePick,
    pendingProposal, messages, toast, unreadCardIndices, myPersonalUrl,
    joinLoading, drawLoading, proposeLoading, consentLoading, isSendingMessage,
    channelStatus, otherIsTyping, otherTypingIndex,
    handleJoin, handleDraw, handleOpenCard, handleCloseCard,
    handlePropose, handleConsent, handleSendMessage, handleTyping, clearToast,
  } = useRoomState(roomId)

  const isMyTurn   = mySlot !== null && currentTurn === mySlot
  const canPropose = !pendingProposal

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/r/${roomId}` : ''

  const p1Name = room?.player1_name ?? 'Player 1'
  const p2Name = room?.player2_name ?? 'Player 2'
  const myName = mySlot === 1 ? p1Name : p2Name

  // Stable draft key scoped to room + question so drafts never bleed across cards
  const draftKey = activePick
    ? `f9q-draft-${roomId}-${activePick.questionIndex}`
    : ''

  // ── HTP overlay ──────────────────────────────────────────────────────────
  if (showHTP) return <HowToPlayPage onClose={handleHTPClose} />

  // ── Early exits ──────────────────────────────────────────────────────────
  if (!room)                           return <LoadingSpinner />
  if (needsJoin)                       return <JoinScreen onJoin={handleJoin} loading={joinLoading} />
  if (!hasBothPlayers && mySlot === 1) return <WaitingScreen shareUrl={shareUrl} />

  // ── Main game UI ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ position: 'fixed', top: 18, right: 20, zIndex: 9999 }}>
        <ThemeToggle />
      </div>

      <main style={{ minHeight: '100dvh', background: 'var(--th-bg)', paddingBottom: 140 }}>
        <PlayerHeader p1Name={p1Name} p2Name={p2Name} mySlot={mySlot ?? 1} myPersonalUrl={myPersonalUrl} />
        <TurnBanner currentTurn={currentTurn} mySlot={mySlot ?? 1} player1Name={p1Name} player2Name={p2Name} channelStatus={channelStatus} />

        {pendingProposal && pendingProposal.proposedBy !== mySlot && (
          <ConsentBanner proposal={pendingProposal} onAccept={() => handleConsent(true)} onDecline={() => handleConsent(false)} loading={consentLoading} />
        )}
        {pendingProposal && pendingProposal.proposedBy === mySlot && <PendingNotice />}

        <div style={{ height: 16 }} />

        <QuestionGrid cards={cards} onOpen={handleOpenCard} unreadIndices={unreadCardIndices} />

        <div style={{ paddingBottom: 8 }}>
          <BrandWatermark />
        </div>
      </main>

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
          isSendingMessage={isSendingMessage}
          onTyping={handleTyping}
          isOtherTyping={otherIsTyping && otherTypingIndex === activePick.questionIndex}
          draftKey={draftKey}
        />
      )}

      {proposeOpen && (
        <ProposeModal
          onSubmit={async (text, tier) => { await handlePropose(text, tier); setProposeOpen(false) }}
          onCancel={() => setProposeOpen(false)}
          loading={proposeLoading}
        />
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </>
  )
}