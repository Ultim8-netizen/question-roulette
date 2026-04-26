import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, PlayerSlot, QuestionTier, PendingQuestion } from '@/lib/supabase'

const VALID_TIERS: QuestionTier[] = ['light', 'medium', 'deep', 'spicy']

export async function POST(req: NextRequest) {
  const body       = await req.json()
  const roomId     = body?.roomId as string
  const proposedBy = body?.proposedBy as PlayerSlot
  const text       = body?.text?.trim() as string
  const tier       = body?.tier as QuestionTier

  if (!roomId || !proposedBy || !text || !tier) {
    return NextResponse.json(
      { error: 'roomId, proposedBy, text, and tier are required' },
      { status: 400 }
    )
  }

  if (!VALID_TIERS.includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  if (text.length > 280) {
    return NextResponse.json(
      { error: 'Question too long (max 280 chars)' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServerClient()

  const { data: room, error: fetchError } = await supabase
    .from('roulette_rooms')
    .select('pending_question, expires_at')
    .eq('id', roomId)
    .single()

  if (fetchError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Room has expired' }, { status: 410 })
  }

  if (room.pending_question) {
    return NextResponse.json(
      { error: 'A proposal is already waiting. Resolve it first.' },
      { status: 409 }
    )
  }

  const pending: PendingQuestion = { text, tier, proposedBy }

  const { error: updateError } = await supabase
    .from('roulette_rooms')
    .update({ pending_question: pending })
    .eq('id', roomId)

  if (updateError) {
    console.error('[question/propose] failed:', updateError)
    return NextResponse.json({ error: 'Failed to store proposal' }, { status: 500 })
  }

  // The calling client is responsible for broadcasting QUESTION_PROPOSED
  // over the Realtime channel so the other player sees the consent UI immediately.
  return NextResponse.json({ ok: true })
}