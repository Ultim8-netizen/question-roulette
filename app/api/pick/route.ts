import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, PlayerSlot, PoolQuestion } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const roomId = body?.roomId as string
  const player = body?.player as PlayerSlot

  if (!roomId || !player) {
    return NextResponse.json({ error: 'roomId and player are required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: room, error: fetchError } = await supabase
    .from('roulette_rooms')
    .select('current_turn, drawn_indices, question_pool, expires_at')
    .eq('id', roomId)
    .single()

  if (fetchError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Room has expired' }, { status: 410 })
  }

  if (room.current_turn !== player) {
    return NextResponse.json({ error: 'Not your turn' }, { status: 403 })
  }

  const pool: PoolQuestion[] = room.question_pool ?? []
  const drawn: number[] = room.drawn_indices ?? []

  // Split available indices by type.
  // Custom questions are always prioritised over static ones.
  const customAvailable = pool
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => q.isCustom && !drawn.includes(i))

  const staticAvailable = pool
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => !q.isCustom && !drawn.includes(i))

  let candidates =
    customAvailable.length > 0 ? customAvailable : staticAvailable

  // Full cycle complete: reset silently. Both custom and static re-enter.
  const cycleReset = candidates.length === 0
  if (cycleReset) {
    candidates = pool.map((q, i) => ({ q, i }))
  }

  const picked = candidates[Math.floor(Math.random() * candidates.length)]
  const nextTurn: PlayerSlot = player === 1 ? 2 : 1
  const newDrawn = cycleReset ? [picked.i] : [...drawn, picked.i]

  const { error: updateError } = await supabase
    .from('roulette_rooms')
    .update({ drawn_indices: newDrawn, current_turn: nextTurn })
    .eq('id', roomId)

  if (updateError) {
    console.error('[pick] update failed:', updateError)
    return NextResponse.json({ error: 'Failed to record pick' }, { status: 500 })
  }

  return NextResponse.json({
    questionIndex: picked.i,
    questionText: picked.q.text,
    tier: picked.q.tier,
    isCustom: picked.q.isCustom,
    nextTurn,
  })
}