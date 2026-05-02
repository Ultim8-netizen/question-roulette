import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { PlayerSlot } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// GET /api/messages?roomId=...&questionIndex=...
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')
  const questionIndexRaw = searchParams.get('questionIndex')

  if (!roomId || questionIndexRaw === null) {
    return NextResponse.json(
      { error: 'roomId and questionIndex are required' },
      { status: 400 }
    )
  }

  const questionIndex = parseInt(questionIndexRaw, 10)
  if (Number.isNaN(questionIndex) || questionIndex < 0) {
    return NextResponse.json({ error: 'Invalid questionIndex' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: room, error: roomError } = await supabase
    .from('roulette_rooms')
    .select('expires_at')
    .eq('id', roomId)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Room has expired' }, { status: 410 })
  }

  const { data: messages, error: messagesError } = await supabase
    .from('room_messages')
    .select('id, room_id, question_index, player, player_name, content, created_at, reply_to_message_id, edited_at')
    .eq('room_id', roomId)
    .eq('question_index', questionIndex)
    .order('created_at', { ascending: true })

  if (messagesError) {
    console.error('[messages/GET] fetch failed:', messagesError)
    return NextResponse.json({ error: 'Failed to load thread' }, { status: 500 })
  }

  return NextResponse.json({ messages: messages ?? [] })
}

// ---------------------------------------------------------------------------
// POST /api/messages — insert new message
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.json()

  const roomId        = body?.roomId as string
  const player        = body?.player as PlayerSlot
  const playerName    = body?.playerName?.trim() as string
  const content       = body?.content?.trim() as string
  const questionIndex = body?.questionIndex
  const replyToMessageId = body?.replyToMessageId as string | undefined

  if (
    !roomId ||
    !playerName ||
    !content ||
    questionIndex === undefined ||
    questionIndex === null
  ) {
    return NextResponse.json(
      { error: 'roomId, questionIndex, player, playerName, and content are required' },
      { status: 400 }
    )
  }

  if (!Number.isInteger(questionIndex) || questionIndex < 0) {
    return NextResponse.json({ error: 'Invalid questionIndex' }, { status: 400 })
  }

  if (player !== 1 && player !== 2) {
    return NextResponse.json({ error: 'Invalid player slot' }, { status: 400 })
  }

  if (content.length < 1 || content.length > 500) {
    return NextResponse.json(
      { error: 'Message must be between 1 and 500 characters' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServerClient()

  const { data: room, error: roomError } = await supabase
    .from('roulette_rooms')
    .select('expires_at')
    .eq('id', roomId)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Room has expired' }, { status: 410 })
  }

  const insertPayload: Record<string, unknown> = {
    room_id: roomId,
    question_index: questionIndex,
    player,
    player_name: playerName,
    content,
  }

  if (replyToMessageId) {
    insertPayload.reply_to_message_id = replyToMessageId
  }

  const { data: message, error: insertError } = await supabase
    .from('room_messages')
    .insert(insertPayload)
    .select('id, created_at')
    .single()

  if (insertError || !message) {
    console.error('[messages/POST] insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({
    messageId: message.id,
    createdAt: message.created_at,
  })
}

// ---------------------------------------------------------------------------
// PATCH /api/messages — edit an existing message (no time restriction)
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  const body = await req.json()

  const messageId = body?.messageId as string
  const player    = body?.player as PlayerSlot
  const content   = body?.content?.trim() as string

  if (!messageId || !player || !content) {
    return NextResponse.json(
      { error: 'messageId, player, and content are required' },
      { status: 400 }
    )
  }

  if (player !== 1 && player !== 2) {
    return NextResponse.json({ error: 'Invalid player slot' }, { status: 400 })
  }

  if (content.length < 1 || content.length > 500) {
    return NextResponse.json(
      { error: 'Message must be between 1 and 500 characters' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServerClient()

  // Verify ownership before touching the row
  const { data: existing, error: fetchError } = await supabase
    .from('room_messages')
    .select('id, player')
    .eq('id', messageId)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  if (existing.player !== player) {
    return NextResponse.json(
      { error: 'You can only edit your own messages' },
      { status: 403 }
    )
  }

  const editedAt = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('room_messages')
    .update({ content, edited_at: editedAt })
    .eq('id', messageId)

  if (updateError) {
    console.error('[messages/PATCH] update failed:', updateError)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, editedAt })
}