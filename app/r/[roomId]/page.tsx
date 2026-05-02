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
import { useState }       from 'react'

// ---------------------------------------------------------------------------
// Loading spinner
// ---------------------------------------------------------------------------

function LoadingSpinner() {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div
        style={{
          minHeight:      '100dvh',
          background:     'var(--th-bg)',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:             20,
        }}
      >
        <div
          style={{
            width:          28,
            height:         28,
            borderRadius:  '50%',
            border:         '2px solid var(--th-border-2)',
            borderTopColor:'var(--th-text-3)',
            animation:     'spin 0.8s linear infinite',
          }}
        />
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

  const {
    room,
    mySlot,
    needsJoin,
    hasBothPlayers,
    currentTurn,
    cards,
    activePick,
    pendingProposal,
    messages,
    toast,

    joinLoading,
    drawLoading,
    proposeLoading,
    consentLoading,
    isSendingMessage,

    channelStatus,
    otherIsTyping,
    otherTypingIndex,

    handleJoin,
    handleDraw,
    handleOpenCard,
    handleCloseCard,
    handlePropose,
    handleConsent,
    handleSendMessage,
    handleTyping,
    clearToast,
  } = useRoomState(roomId)

  // ── Derived ────────────────────────────────────────────────────────────────

  const isMyTurn   = mySlot !== null && currentTurn === mySlot
  const canPropose = !pendingProposal
  const shareUrl   = typeof window !== 'undefined' ? window.location.href : ''

  const p1Name = room?.player1_name ?? 'Player 1'
  const p2Name = room?.player2_name ?? 'Player 2'
  const myName = mySlot === 1 ? p1Name : p2Name

  // ── Early exits ────────────────────────────────────────────────────────────
  // JoinScreen renders its own ThemeToggle internally.
  if (!room)                           return <LoadingSpinner />
  if (needsJoin)                       return <JoinScreen onJoin={handleJoin} loading={joinLoading} />
  if (!hasBothPlayers && mySlot === 1) return <WaitingScreen shareUrl={shareUrl} />

  // ── Main game UI ───────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/*
        ThemeToggle — fixed position, highest z-index in the document.
        Rendered here (page level) rather than inside TurnBanner so it is
        never trapped inside an animated stacking context. This single
        instance covers both the host and player 2 game views.
      */}
      <div style={{ position: 'fixed', top: 18, right: 20, zIndex: 9999 }}>
        <ThemeToggle />
      </div>

      <main style={{ minHeight: '100dvh', background: 'var(--th-bg)', paddingBottom: 140 }}>

        {/* ── Nameplate header ── */}
        <PlayerHeader
          p1Name={p1Name}
          p2Name={p2Name}
          mySlot={mySlot ?? 1}
        />

        {/* ── Turn banner + connection indicator ── */}
        <TurnBanner
          currentTurn={currentTurn}
          mySlot={mySlot ?? 1}
          player1Name={p1Name}
          player2Name={p2Name}
          channelStatus={channelStatus}
        />

        {/* ── Incoming proposal ── */}
        {pendingProposal && pendingProposal.proposedBy !== mySlot && (
          <ConsentBanner
            proposal={pendingProposal}
            onAccept={() => handleConsent(true)}
            onDecline={() => handleConsent(false)}
            loading={consentLoading}
          />
        )}

        {/* ── Outgoing proposal waiting notice ── */}
        {pendingProposal && pendingProposal.proposedBy === mySlot && (
          <PendingNotice />
        )}

        <div style={{ height: 16 }} />

        {/* ── Card grid ── */}
        <QuestionGrid cards={cards} onOpen={handleOpenCard} />

        <div style={{ paddingBottom: 8 }}>
          <BrandWatermark />
        </div>
      </main>

      {/* ── Fixed draw button ── */}
      <DrawButton
        isMyTurn={isMyTurn && hasBothPlayers}
        isLoading={drawLoading}
        canPropose={canPropose}
        onDraw={handleDraw}
        onPropose={() => setProposeOpen(true)}
      />

      {/* ── Card reveal modal ── */}
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
          isOtherTyping={
            otherIsTyping && otherTypingIndex === activePick.questionIndex
          }
        />
      )}

      {/* ── Propose modal ── */}
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

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onDone={clearToast} />}
    </>
  )
}