import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, PlayerSlot, PoolQuestion } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body             = await req.json()
  const roomId           = body?.roomId as string
  const respondingPlayer = body?.respondingPlayer as PlayerSlot
  const accepted         = body?.accepted as boolean

  if (!roomId || !respondingPlayer || typeof accepted !== 'boolean') {
    return NextResponse.json(
      { error: 'roomId, respondingPlayer, and accepted are required' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServerClient()

  const { data: room, error: fetchError } = await supabase
    .from('roulette_rooms')
    .select('pending_question, question_pool, expires_at')
    .eq('id', roomId)
    .single()

  if (fetchError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Room has expired' }, { status: 410 })
  }

  if (!room.pending_question) {
    return NextResponse.json({ error: 'No pending proposal' }, { status: 404 })
  }

  // A player cannot respond to their own proposal
  if (room.pending_question.proposedBy === respondingPlayer) {
    return NextResponse.json(
      { error: 'You cannot respond to your own proposal' },
      { status: 403 }
    )
  }

  if (!accepted) {
    // Declined: clear the pending state, nothing added to pool
    await supabase
      .from('roulette_rooms')
      .update({ pending_question: null })
      .eq('id', roomId)

    return NextResponse.json({ ok: true, accepted: false })
  }

  // Accepted: append to pool, clear pending
  const newQuestion: PoolQuestion = {
    text: room.pending_question.text,
    tier: room.pending_question.tier,
    isCustom: true,
  }

  const updatedPool: PoolQuestion[] = [
    ...(room.question_pool ?? []),
    newQuestion,
  ]

  const questionIndex = updatedPool.length - 1

  const { error: updateError } = await supabase
    .from('roulette_rooms')
    .update({ question_pool: updatedPool, pending_question: null })
    .eq('id', roomId)

  if (updateError) {
    console.error('[question/respond] failed:', updateError)
    return NextResponse.json({ error: 'Failed to add question' }, { status: 500 })
  }

  // The calling client broadcasts QUESTION_ACCEPTED so both players
  // see confirmation and the question enters the live pool.
  return NextResponse.json({
    ok: true,
    accepted: true,
    questionIndex,
    questionText: newQuestion.text,
    tier: newQuestion.tier,
  })
}