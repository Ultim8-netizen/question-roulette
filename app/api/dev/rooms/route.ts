import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

const DEV_PIN = process.env.DEV_PIN ?? ''

export async function GET(req: NextRequest) {
  const pin = req.headers.get('x-dev-pin')
  if (!DEV_PIN || pin !== DEV_PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseServerClient()

  // Fetch 20 most recent rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('roulette_rooms')
    .select('id, player1_name, player2_name, drawn_indices, created_at, expires_at, current_turn')
    .order('created_at', { ascending: false })
    .limit(20)

  if (roomsError) {
    console.error('[dev/rooms] rooms query failed:', roomsError)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  if (!rooms || rooms.length === 0) {
    return NextResponse.json({ rooms: [] })
  }

  // Fetch message counts per room in one query
  const roomIds = rooms.map(r => r.id)
  const { data: msgRows, error: msgError } = await supabase
    .from('room_messages')
    .select('room_id')
    .in('room_id', roomIds)

  if (msgError) {
    console.error('[dev/rooms] messages query failed:', msgError)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  // Count messages per room
  const msgCountMap = new Map<string, number>()
  for (const msg of msgRows ?? []) {
    msgCountMap.set(msg.room_id, (msgCountMap.get(msg.room_id) ?? 0) + 1)
  }

  const enriched = rooms.map(r => ({
    id:           r.id,
    player1Name:  r.player1_name,
    player2Name:  r.player2_name ?? null,
    cardsDrawn:   (r.drawn_indices as number[] | null)?.length ?? 0,
    messageCount: msgCountMap.get(r.id) ?? 0,
    createdAt:    r.created_at,
    expiresAt:    r.expires_at,
    currentTurn:  r.current_turn,
    isComplete:   !!r.player2_name,
    isExpired:    new Date(r.expires_at) < new Date(),
  }))

  return NextResponse.json({ rooms: enriched })
}