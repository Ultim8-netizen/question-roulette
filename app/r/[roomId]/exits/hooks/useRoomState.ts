'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type {
  Room,
  PlayerSlot,
  QuestionTier,
  PendingQuestion,
  RoomEvent,
  Message,
} from '@/lib/supabase'
import { useRoomChannel } from '@/hooks/useRoomChannel'
import type { DrawnCard } from '@/components/QuestionGrid'
import type { ChannelStatus } from '@/hooks/useRoomChannel'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PickState = {
  questionIndex: number
  questionText:  string
  tier:          QuestionTier
  isCustom:      boolean
  drawnByName:   string
  isMyDraw:      boolean
}

export type RoomStateReturn = {
  // ── Data ──────────────────────────────────────────────────────────────────
  room:               Room | null
  mySlot:             PlayerSlot | null
  needsJoin:          boolean
  hasBothPlayers:     boolean
  currentTurn:        PlayerSlot
  cards:              DrawnCard[]
  activePick:         PickState | null
  pendingProposal:    PendingQuestion | null
  messages:           Message[]
  toast:              string | null
  /** Indices of cards that have received new messages since they were last opened. */
  unreadCardIndices:  number[]

  // ── Loading flags ──────────────────────────────────────────────────────────
  joinLoading:        boolean
  drawLoading:        boolean
  proposeLoading:     boolean
  consentLoading:     boolean
  isSendingMessage:   boolean

  // ── Realtime ───────────────────────────────────────────────────────────────
  channelStatus:      ChannelStatus
  otherIsTyping:      boolean
  otherTypingIndex:   number | null

  // ── Actions ───────────────────────────────────────────────────────────────
  handleJoin:         (name: string) => Promise<void>
  handleDraw:         () => Promise<void>
  handleOpenCard:     (card: DrawnCard) => void
  handleCloseCard:    () => Promise<void>
  handlePropose:      (text: string, tier: QuestionTier) => Promise<void>
  handleConsent:      (accepted: boolean) => Promise<void>
  handleSendMessage:  (content: string) => Promise<void>
  handleTyping:       () => Promise<void>
  clearToast:         () => void
}

// ---------------------------------------------------------------------------
// Helper — read the ?h=1 query param from the current URL.
// Only runs in the browser; returns false during SSR.
// ---------------------------------------------------------------------------

function isHostUrl(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return new URLSearchParams(window.location.search).get('h') === '1'
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRoomState(roomId: string): RoomStateReturn {
  const [room,             setRoom]             = useState<Room | null>(null)
  const [mySlot,           setMySlot]           = useState<PlayerSlot | null>(null)
  const [needsJoin,        setNeedsJoin]        = useState(false)
  const [currentTurn,      setCurrentTurn]      = useState<PlayerSlot>(1)
  const [hasBothPlayers,   setHasBothPlayers]   = useState(false)
  const [cards,            setCards]            = useState<DrawnCard[]>([])
  const [drawLoading,      setDrawLoading]      = useState(false)
  const [activePick,       setActivePick]       = useState<PickState | null>(null)

  const [proposeLoading,   setProposeLoading]   = useState(false)
  const [pendingProposal,  setPendingProposal]  = useState<PendingQuestion | null>(null)
  const [consentLoading,   setConsentLoading]   = useState(false)

  const [joinLoading,      setJoinLoading]      = useState(false)
  const [toast,            setToast]            = useState<string | null>(null)

  const [messages,          setMessages]          = useState<Message[]>([])
  const [isSendingMessage,  setIsSendingMessage]  = useState(false)
  const [otherIsTyping,     setOtherIsTyping]     = useState(false)
  const [otherTypingIndex,  setOtherTypingIndex]  = useState<number | null>(null)

  /**
   * Card indices that have received messages while they were not the active
   * card. Cleared when handleOpenCard is called for that index.
   */
  const [unreadCardIndices, setUnreadCardIndices] = useState<number[]>([])

  // Stable refs — avoid stale closures in callbacks without re-subscribing
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const roomRef          = useRef<Room | null>(null)
  const mySlotRef        = useRef<PlayerSlot | null>(null)
  const activePickRef    = useRef<PickState | null>(null)

  useEffect(() => { roomRef.current       = room      }, [room])
  useEffect(() => { mySlotRef.current     = mySlot    }, [mySlot])
  useEffect(() => { activePickRef.current = activePick }, [activePick])

  // ── Message loader ─────────────────────────────────────────────────────────

  async function loadMessagesForCard(questionIndex: number) {
    const res = await fetch(
      `/api/messages?roomId=${roomId}&questionIndex=${questionIndex}`,
    )
    if (!res.ok) return
    const data = await res.json()
    setMessages(data.messages ?? [])
  }

  // ── Realtime event handler ─────────────────────────────────────────────────

  const handleEvent = useCallback(
    (event: RoomEvent) => {
      const r = roomRef.current
      if (!r) return

      if (event.type === 'PLAYER_JOINED') {
        setRoom(prev => (prev ? { ...prev, player2_name: event.name } : prev))
        setHasBothPlayers(true)
        setToast(`${event.name} joined the game`)
      }

      if (event.type === 'QUESTION_DRAWN') {
        const drawnByName =
          event.player === 1
            ? (r.player1_name ?? 'Player 1')
            : (r.player2_name ?? 'Player 2')

        setCards(prev => [
          ...prev,
          {
            key:           `${event.questionIndex}-${Date.now()}`,
            questionIndex: event.questionIndex,
            questionText:  event.questionText,
            tier:          event.tier,
            isCustom:      event.isCustom,
            drawnByName,
            drawnByMe:     false,
          },
        ])

        if (event.player === mySlotRef.current) {
          setMessages([])
          setActivePick({
            questionIndex: event.questionIndex,
            questionText:  event.questionText,
            tier:          event.tier,
            isCustom:      event.isCustom,
            drawnByName,
            isMyDraw:      true,
          })
        } else {
          setToast(`${drawnByName} drew a card — tap it to read and respond`)
        }
      }

      if (event.type === 'TURN_ADVANCED') setCurrentTurn(event.nextTurn)

      if (event.type === 'QUESTION_PROPOSED') {
        if (event.proposedBy !== mySlotRef.current) {
          setPendingProposal({
            text:       event.text,
            tier:       event.tier,
            proposedBy: event.proposedBy,
          })
        }
      }

      if (event.type === 'QUESTION_ACCEPTED') {
        setPendingProposal(null)
        setToast('Custom question added to the pool')
      }

      if (event.type === 'QUESTION_DECLINED') {
        setPendingProposal(null)
        if (event.proposedBy === mySlotRef.current)
          setToast('They passed on your question')
      }

      if (event.type === 'MESSAGE_SENT') {
        const current = activePickRef.current
        if (current && event.questionIndex === current.questionIndex) {
          // Active card — append to the live thread.
          setMessages(prev => [
            ...prev,
            {
              id:             event.messageId,
              room_id:        roomId,
              question_index: event.questionIndex,
              player:         event.player,
              player_name:    event.playerName,
              content:        event.content,
              created_at:     event.createdAt,
            },
          ])
        } else {
          // Card is not currently open — mark it as having unread messages.
          setUnreadCardIndices(prev =>
            prev.includes(event.questionIndex)
              ? prev
              : [...prev, event.questionIndex],
          )
          setToast('New message on a card')
        }
      }

      if (event.type === 'TYPING') {
        const current = activePickRef.current
        if (current && event.questionIndex === current.questionIndex) {
          setOtherIsTyping(true)
          setOtherTypingIndex(event.questionIndex)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => {
            setOtherIsTyping(false)
            setOtherTypingIndex(null)
          }, 3000)
        }
      }

      if (event.type === 'CARD_CLOSED') {
        const current = activePickRef.current
        if (current && event.questionIndex === current.questionIndex) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          setOtherIsTyping(false)
          setOtherTypingIndex(null)
          setActivePick(null)
          setMessages([])
          setToast('Card closed')
        }
      }
    },
    [roomId],
  )

  const { sendEvent, status: channelStatus } = useRoomChannel({
    roomId,
    onEvent:  handleEvent,
    enabled:  !!room,
  })

  // ── Initial room load ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!roomId) return

    async function load() {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('roulette_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (error || !data) {
        console.error('[load] failed:', error)
        return
      }

      const r = data as Room
      setRoom(r)
      setCurrentTurn(r.current_turn)
      setHasBothPlayers(!!r.player2_name)
      if (r.pending_question) setPendingProposal(r.pending_question)

      // Reconstruct card history from drawn_indices
      if (r.drawn_indices?.length && r.question_pool) {
        const reconstructed: DrawnCard[] = r.drawn_indices
          .map((qi: number, position: number) => {
            const q = r.question_pool[qi]
            if (!q) return null
            return {
              key:           `${qi}-${position}`,
              questionIndex: qi,
              questionText:  q.text,
              tier:          q.tier,
              isCustom:      q.isCustom,
              drawnByName:   r.player1_name,
              drawnByMe:     false,
            }
          })
          .filter(Boolean) as DrawnCard[]
        setCards(reconstructed)
      }

      // ── Slot resolution ────────────────────────────────────────────────────
      //
      // Priority order:
      //   1. localStorage has a slot stored for this room → use it (most cases)
      //   2. ?h=1 is in the URL → treat as host (slot 1), regardless of
      //      player2_name. This covers the case where the host lost their
      //      localStorage but bookmarked the correct host URL.
      //   3. No slot stored, no host param, room is empty → join screen (P2)
      //   4. No slot stored, no host param, room is full → fallback to slot 2
      //      (P2 returning after losing their localStorage)

      const slotKey = `f9q-slot-${roomId}`
      let stored: string | null = null
      try { stored = localStorage.getItem(slotKey) } catch { /* private browsing */ }
      if (!stored) {
        try { stored = sessionStorage.getItem(slotKey) } catch { /* ignore */ }
      }

      const hostParam = isHostUrl()

      if (stored === '1') {
        // Slot explicitly stored as host.
        setMySlot(1)
      } else if (stored === '2') {
        // Slot explicitly stored as P2.
        setMySlot(2)
      } else if (hostParam) {
        // URL encodes host role — recover slot 1 even without localStorage.
        // Also persist it so subsequent loads on this device don't need ?h=1.
        setMySlot(1)
        try { localStorage.setItem(slotKey, '1') } catch { /* ignore */ }
      } else if (!r.player2_name) {
        // No slot, no host param, room is empty → visitor is P2 joining.
        setNeedsJoin(true)
      } else {
        // No slot, no host param, room is full → assume returning P2.
        setMySlot(2)
        try { localStorage.setItem(slotKey, '2') } catch { /* ignore */ }
      }
    }

    void load()
  }, [roomId])

  // ── Actions ────────────────────────────────────────────────────────────────

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
    try { localStorage.setItem(`f9q-slot-${roomId}`, '2') } catch { /* ignore */ }
    setMySlot(2)
    setNeedsJoin(false)
    setHasBothPlayers(true)
    setRoom(prev =>
      prev
        ? { ...prev, player2_name: name, player1_name: data.player1_name }
        : prev,
    )
    setJoinLoading(false)
    await sendEvent({ type: 'PLAYER_JOINED', player: 2, name })
  }

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

    const { questionIndex, questionText, tier, isCustom, nextTurn } =
      await res.json()

    const r           = roomRef.current!
    const drawnByName =
      mySlot === 1 ? r.player1_name : (r.player2_name ?? 'Player 2')

    setCurrentTurn(nextTurn)
    setCards(prev => [
      ...prev,
      {
        key: `${questionIndex}-${Date.now()}`,
        questionIndex,
        questionText,
        tier,
        isCustom,
        drawnByName,
        drawnByMe: true,
      },
    ])
    setMessages([])
    setActivePick({
      questionIndex,
      questionText,
      tier,
      isCustom,
      drawnByName,
      isMyDraw: true,
    })

    await sendEvent({
      type: 'QUESTION_DRAWN',
      player: mySlot,
      questionIndex,
      questionText,
      tier,
      isCustom,
    })
    await sendEvent({ type: 'TURN_ADVANCED', nextTurn })
  }

  function handleOpenCard(card: DrawnCard) {
    // Clear any unread indicator for this card before opening.
    setUnreadCardIndices(prev => prev.filter(i => i !== card.questionIndex))
    setMessages([])
    setActivePick({
      questionIndex: card.questionIndex,
      questionText:  card.questionText,
      tier:          card.tier,
      isCustom:      card.isCustom,
      drawnByName:   card.drawnByName,
      isMyDraw:      card.drawnByMe,
    })
    void loadMessagesForCard(card.questionIndex)
  }

  async function handleCloseCard() {
    const pick = activePickRef.current
    if (!pick) return
    await sendEvent({ type: 'CARD_CLOSED', questionIndex: pick.questionIndex })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    setOtherIsTyping(false)
    setOtherTypingIndex(null)
    setActivePick(null)
    setMessages([])
  }

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

    setToast('Proposal sent. Waiting for their answer...')
    await sendEvent({ type: 'QUESTION_PROPOSED', proposedBy: mySlot, text, tier })
  }

  async function handleConsent(accepted: boolean) {
    if (!mySlot) return
    setConsentLoading(true)

    const res = await fetch('/api/questions/respond', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ roomId, respondingPlayer: mySlot, accepted }),
    })

    setConsentLoading(false)

    if (!res.ok) {
      setToast('Something went wrong.')
      return
    }

    const data = await res.json()
    setPendingProposal(null)

    if (accepted) {
      setToast('Question added to the pool')
      await sendEvent({
        type:          'QUESTION_ACCEPTED',
        questionIndex: data.questionIndex,
        text:          data.questionText,
        tier:          data.tier,
      })
    } else {
      await sendEvent({
        type:       'QUESTION_DECLINED',
        proposedBy: pendingProposal!.proposedBy,
      })
    }
  }

  async function handleSendMessage(content: string) {
    if (!mySlot || !activePick) return

    const r          = roomRef.current
    const playerName =
      mySlot === 1
        ? (r?.player1_name ?? 'Player 1')
        : (r?.player2_name ?? 'Player 2')

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
      setMessages(prev => prev.filter(m => m.id !== optimisticId))
      setToast('Message failed to send. Try again.')
      return
    }

    const { messageId, createdAt } = await res.json()
    setMessages(prev =>
      prev.map(m =>
        m.id === optimisticId ? { ...m, id: messageId, created_at: createdAt } : m,
      ),
    )

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

  async function handleTyping() {
    if (!mySlot || !activePick) return
    await sendEvent({
      type:          'TYPING',
      questionIndex: activePick.questionIndex,
      player:        mySlot,
    })
  }

  function clearToast() {
    setToast(null)
  }

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
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
    unreadCardIndices,

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
  }
}