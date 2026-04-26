'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseBrowserClient, RoomEvent } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChannelStatus = 'connecting' | 'connected' | 'disconnected'

type UseRoomChannelOptions = {
  roomId: string
  onEvent: (event: RoomEvent) => void
  /**
   * Set to false to defer subscribing until both players have joined.
   * Defaults to true.
   */
  enabled?: boolean
}

type UseRoomChannelReturn = {
  /** Broadcast a typed event to the other player. */
  sendEvent: (event: RoomEvent) => Promise<void>
  status: ChannelStatus
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRoomChannel({
  roomId,
  onEvent,
  enabled = true,
}: UseRoomChannelOptions): UseRoomChannelReturn {
  const [status, setStatus] = useState<ChannelStatus>('connecting')

  // Refs avoid stale closures in callbacks without triggering re-subscription
  const channelRef  = useRef<RealtimeChannel | null>(null)
  const statusRef   = useRef<ChannelStatus>('connecting')
  const onEventRef  = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  // ---------------------------------------------------------------------------
  // Subscribe / unsubscribe
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!enabled || !roomId) return

    const supabase = getSupabaseBrowserClient()

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: {
          // self: false means the sender never receives their own events.
          // The sender already handles the outcome of their own action
          // (draw, propose, respond) directly from the API response.
          self: false,
        },
      },
    })

    channel
      .on('broadcast', { event: '*' }, ({ event, payload }) => {
        // Reconstruct the RoomEvent discriminated union.
        // Supabase separates the event name from the payload body;
        // we reunite them here so callers get the full typed shape.
        const roomEvent = { type: event, ...(payload ?? {}) } as RoomEvent
        onEventRef.current(roomEvent)
      })
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') {
          statusRef.current = 'connected'
          setStatus('connected')
        } else if (s === 'CLOSED' || s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          statusRef.current = 'disconnected'
          setStatus('disconnected')
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      statusRef.current  = 'disconnected'
      setStatus('disconnected')
    }
  }, [roomId, enabled])

  // ---------------------------------------------------------------------------
  // Send
  // ---------------------------------------------------------------------------
  const sendEvent = useCallback(async (event: RoomEvent) => {
    if (!channelRef.current || statusRef.current !== 'connected') {
      console.warn('[useRoomChannel] send skipped: channel not ready', statusRef.current)
      return
    }

    // Split the discriminated union back into Supabase's expected shape:
    // { type: 'broadcast', event: <event name>, payload: <rest of data> }
    const { type, ...payload } = event

    await channelRef.current.send({
      type: 'broadcast',
      event: type,
      payload,
    })
  }, [])

  return { sendEvent, status }
}