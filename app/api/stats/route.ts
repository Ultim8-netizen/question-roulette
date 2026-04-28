import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [totalResult, completeResult, messagesResult, recentResult, allDrawsResult] =
      await Promise.all([
        // Total rooms ever created
        supabase
          .from('roulette_rooms')
          .select('*', { count: 'exact', head: true }),

        // Rooms where P2 joined (completed games)
        supabase
          .from('roulette_rooms')
          .select('*', { count: 'exact', head: true })
          .not('player2_name', 'is', null),

        // Total messages sent across all threads
        supabase
          .from('room_messages')
          .select('*', { count: 'exact', head: true }),

        // Last 30 days of rooms for trend + week comparison
        supabase
          .from('roulette_rooms')
          .select('created_at, player2_name, drawn_indices')
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: true }),

        // All rooms — only drawn_indices — for total cards drawn
        supabase
          .from('roulette_rooms')
          .select('drawn_indices'),
      ])

    if (
      totalResult.error ||
      completeResult.error ||
      messagesResult.error ||
      recentResult.error ||
      allDrawsResult.error
    ) {
      console.error('[stats] query errors', {
        e1: totalResult.error,
        e2: completeResult.error,
        e3: messagesResult.error,
        e4: recentResult.error,
        e5: allDrawsResult.error,
      })
      return NextResponse.json({ error: 'Failed to query stats' }, { status: 500 })
    }

    // ── Build daily trend (last 14 days) ──────────────────────────────────
    const now = new Date()
    const days: Record<string, { total: number; complete: number }> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      days[d.toISOString().slice(0, 10)] = { total: 0, complete: 0 }
    }

    const recentData = recentResult.data ?? []

    for (const room of recentData) {
      const key = room.created_at.slice(0, 10)
      if (key in days) {
        days[key].total++
        if (room.player2_name) days[key].complete++
      }
    }

    // ── Week-over-week ────────────────────────────────────────────────────
    const weekAgo     = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const thisWeek = recentData.filter(r => new Date(r.created_at) >= weekAgo).length
    const lastWeek = recentData.filter(r => {
      const d = new Date(r.created_at)
      return d >= twoWeeksAgo && d < weekAgo
    }).length

    // ── All-time cards drawn ──────────────────────────────────────────────
    const totalCardsDrawn = (allDrawsResult.data ?? []).reduce(
      (sum, r) => sum + ((r.drawn_indices as number[] | null)?.length ?? 0),
      0
    )

    const totalRooms    = totalResult.count    ?? 0
    const completeRooms = completeResult.count ?? 0

    return NextResponse.json({
      totalRooms,
      completeRooms,
      totalMessages:    messagesResult.count ?? 0,
      totalCardsDrawn,
      activeToday:      days[now.toISOString().slice(0, 10)]?.total ?? 0,
      thisWeek,
      lastWeek,
      conversionRate:   totalRooms > 0 ? Math.round((completeRooms / totalRooms) * 100) : 0,
      trend:            Object.entries(days).map(([date, v]) => ({ date, ...v })),
    })
  } catch (err) {
    console.error('[stats] unexpected error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}