import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, PoolQuestion } from '@/lib/supabase'
import { QUESTIONS } from '@/lib/questions'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const player1_name = body?.player1_name?.trim()

  if (!player1_name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Snapshot the current question bank into the room's pool.
  // questions.ts is only read here. After this point, the session
  // owns its pool independently. Expanding questions.ts later only
  // affects new rooms, never in-progress ones.
  const question_pool: PoolQuestion[] = QUESTIONS.map(q => ({
    text: q.text,
    tier: q.tier,
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