// app/api/pick/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, PlayerSlot, PoolQuestion } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Phase thresholds
// ---------------------------------------------------------------------------

/** How many draws must use light tier questions. */
const LIGHT_PHASE_DRAWS = 3
/** How many draws must use the "deeper" tier (medium|deep) before true random. */
const DEEPER_PHASE_DRAWS = 1 // 1 draw at position index 3

/** Tiers that qualify for the "deeper" gateway draw. */
const DEEPER_TIERS = new Set(['medium', 'deep'])

// ---------------------------------------------------------------------------
// Candidate selection
// ---------------------------------------------------------------------------

/**
 * Returns the filtered candidate list based on the current draw phase.
 *
 * Phase 1 (drawCount 0-2): light only
 * Phase 2 (drawCount 3):   medium or deep only
 * Phase 3 (drawCount 4+):  unrestricted
 *
 * Custom questions always bypass phase filtering — they were deliberately
 * added by the players and should surface as soon as they're accepted.
 */
function getCandidates(
  pool: PoolQuestion[],
  drawn: number[],
  drawCount: number,
): { q: PoolQuestion; i: number }[] {
  const allAvailable = pool
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => !drawn.includes(i))

  // Custom questions are always eligible regardless of phase.
  const customAvailable = allAvailable.filter(({ q }) => q.isCustom)

  // If any custom question is available, prioritise them (existing behaviour).
  // Phase filtering only applies when we're picking from static questions.
  if (customAvailable.length > 0) return customAvailable

  // No custom questions — apply phase filter to static questions.
  const staticAvailable = allAvailable.filter(({ q }) => !q.isCustom)

  if (drawCount < LIGHT_PHASE_DRAWS) {
    // Phase 1: light only
    const lightOnly = staticAvailable.filter(({ q }) => q.tier === 'light')
    // If the light pool is somehow exhausted (e.g. very few light questions),
    // fall back to any static question so the game never deadlocks.
    return lightOnly.length > 0 ? lightOnly : staticAvailable
  }

  if (drawCount < LIGHT_PHASE_DRAWS + DEEPER_PHASE_DRAWS) {
    // Phase 2: medium or deep only (the "gateway" draw)
    const deeperOnly = staticAvailable.filter(({ q }) => DEEPER_TIERS.has(q.tier))
    return deeperOnly.length > 0 ? deeperOnly : staticAvailable
  }

  // Phase 3: true random — all static questions
  return staticAvailable
}

export async function POST(req: NextRequest) {
  const body   = await req.json()
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

  const pool: PoolQuestion[]  = room.question_pool  ?? []
  const drawn: number[]       = room.drawn_indices   ?? []
  const drawCount             = drawn.length          // 0-indexed: 0 = first draw

  let candidates = getCandidates(pool, drawn, drawCount)

  // Full cycle complete for the applicable candidate set: reset drawn and retry.
  // This preserves the existing cycle-reset behaviour.
  const cycleReset = candidates.length === 0
  if (cycleReset) {
    // On reset, ignore phase gating — let everything back in.
    candidates = pool.map((q, i) => ({ q, i }))
  }

  const picked    = candidates[Math.floor(Math.random() * candidates.length)]
  const nextTurn: PlayerSlot = player === 1 ? 2 : 1
  const newDrawn  = cycleReset ? [picked.i] : [...drawn, picked.i]

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
    questionText:  picked.q.text,
    tier:          picked.q.tier,
    isCustom:      picked.q.isCustom,
    nextTurn,
  })
}