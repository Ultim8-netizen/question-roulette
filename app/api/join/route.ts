import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const roomId = body?.roomId?.trim()
  const player2_name = body?.player2_name?.trim()

  if (!roomId || !player2_name) {
    return NextResponse.json(
      { error: 'roomId and player2_name are required' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServerClient()

  const { data: room, error: fetchError } = await supabase
    .from('roulette_rooms')
    .select('id, player1_name, player2_name, expires_at')
    .eq('id', roomId)
    .single()

  if (fetchError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (new Date(room.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired' }, { status: 410 })
  }

  if (room.player2_name) {
    return NextResponse.json({ error: 'Room is already full' }, { status: 409 })
  }

  const { error: updateError } = await supabase
    .from('roulette_rooms')
    .update({ player2_name })
    .eq('id', roomId)

  if (updateError) {
    console.error('[join] update failed:', updateError)
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 })
  }

  return NextResponse.json({
    player: 2,
    player1_name: room.player1_name,
  })
}