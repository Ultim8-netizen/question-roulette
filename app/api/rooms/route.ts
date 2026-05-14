import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, PoolQuestion } from '@/lib/supabase'
import { QUESTIONS } from '@/lib/questions'

type GameMode = 'friendly' | 'intimate'

const FRIENDLY_TIERS = new Set(['light', 'medium'])

export async function POST(req: NextRequest) {
  const body = await req.json()
  const player1_name = body?.player1_name?.trim()
  const mode: GameMode = body?.mode === 'intimate' ? 'intimate' : 'friendly'

  if (!player1_name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Snapshot the question bank, filtered by mode, into the room's pool.
  // After this point the session owns its pool independently — changing
  // questions.ts or mode logic never affects in-progress rooms.
  const question_pool: PoolQuestion[] = QUESTIONS
    .filter(q => mode === 'intimate' || FRIENDLY_TIERS.has(q.tier))
    .map(q => ({
      text:     q.text,
      tier:     q.tier,
      isCustom: false,
    }))

  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('roulette_rooms')
    .insert({ player1_name, question_pool })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[rooms] insert failed:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }

  return NextResponse.json({ roomId: data.id, player: 1 })
}