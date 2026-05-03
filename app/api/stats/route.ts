import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const thirtyDaysAgo  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      totalResult,
      completeResult,
      messagesResult,
      recentResult,
      allDrawsResult,
      allRoomsResult,
      messagesWithIndexResult,
      proposedResult,
    ] = await Promise.all([
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

      // All rooms — drawn_indices — for total cards drawn + avg + depth
      supabase
        .from('roulette_rooms')
        .select('drawn_indices, player2_name, created_at'),

      // All rooms with created_at for peak hour analysis
      supabase
        .from('roulette_rooms')
        .select('created_at'),

      // All messages with question_index for avg messages per card
      supabase
        .from('room_messages')
        .select('room_id, question_index'),

      // All rooms with pending_question + question_pool for custom Q stats
      supabase
        .from('roulette_rooms')
        .select('question_pool, pending_question'),
    ])

    if (
      totalResult.error       ||
      completeResult.error    ||
      messagesResult.error    ||
      recentResult.error      ||
      allDrawsResult.error    ||
      allRoomsResult.error    ||
      messagesWithIndexResult.error ||
      proposedResult.error
    ) {
      console.error('[stats] query errors', {
        e1: totalResult.error,
        e2: completeResult.error,
        e3: messagesResult.error,
        e4: recentResult.error,
        e5: allDrawsResult.error,
        e6: allRoomsResult.error,
        e7: messagesWithIndexResult.error,
        e8: proposedResult.error,
      })
      return NextResponse.json({ error: 'Failed to query stats' }, { status: 500 })
    }

    // ── Build daily trend (last 14 days) ──────────────────────────────────
    const now  = new Date()
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
    const allRooms       = allDrawsResult.data ?? []
    const totalCardsDrawn = allRooms.reduce(
      (sum, r) => sum + ((r.drawn_indices as number[] | null)?.length ?? 0),
      0,
    )

    // ── Avg cards per completed session ───────────────────────────────────
    const completedRooms = allRooms.filter(r => r.player2_name)
    const avgCardsPerSession = completedRooms.length > 0
      ? Math.round(
          completedRooms.reduce(
            (sum, r) => sum + ((r.drawn_indices as number[] | null)?.length ?? 0),
            0,
          ) / completedRooms.length * 10,
        ) / 10
      : 0

    // ── Session depth distribution ────────────────────────────────────────
    // Buckets: 0 cards, 1, 2-5, 6-10, 11+
    const depthBuckets = { '0': 0, '1': 0, '2-5': 0, '6-10': 0, '11+': 0 }
    for (const room of completedRooms) {
      const count = (room.drawn_indices as number[] | null)?.length ?? 0
      if      (count === 0)  depthBuckets['0']++
      else if (count === 1)  depthBuckets['1']++
      else if (count <= 5)   depthBuckets['2-5']++
      else if (count <= 10)  depthBuckets['6-10']++
      else                   depthBuckets['11+']++
    }

    // ── Avg messages per card ─────────────────────────────────────────────
    // Group messages by room_id + question_index, then average group sizes
    const msgData = messagesWithIndexResult.data ?? []
    const cardThreadMap = new Map<string, number>()
    for (const msg of msgData) {
      const key = `${msg.room_id}:${msg.question_index}`
      cardThreadMap.set(key, (cardThreadMap.get(key) ?? 0) + 1)
    }
    const threadSizes      = Array.from(cardThreadMap.values())
    const avgMessagesPerCard = threadSizes.length > 0
      ? Math.round(
          threadSizes.reduce((a, b) => a + b, 0) / threadSizes.length * 10,
        ) / 10
      : 0

    // ── Peak hour ─────────────────────────────────────────────────────────
    const hourCounts: number[] = Array(24).fill(0)
    for (const row of allRoomsResult.data ?? []) {
      const hour = new Date(row.created_at).getHours()
      hourCounts[hour]++
    }
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

    // ── Custom question stats ─────────────────────────────────────────────
    // A custom question that made it into question_pool has isCustom: true.
    // We count total custom questions accepted across all pools.
    let customQuestionsAccepted = 0
    for (const room of proposedResult.data ?? []) {
      const pool = room.question_pool as Array<{ isCustom?: boolean }> | null
      if (pool) {
        customQuestionsAccepted += pool.filter(q => q.isCustom).length
      }
    }

    const totalRooms    = totalResult.count    ?? 0
    const completeRooms = completeResult.count ?? 0

    return NextResponse.json({
      totalRooms,
      completeRooms,
      totalMessages:         messagesResult.count ?? 0,
      totalCardsDrawn,
      activeToday:           days[now.toISOString().slice(0, 10)]?.total ?? 0,
      thisWeek,
      lastWeek,
      conversionRate:        totalRooms > 0 ? Math.round((completeRooms / totalRooms) * 100) : 0,
      trend:                 Object.entries(days).map(([date, v]) => ({ date, ...v })),
      // new fields
      avgCardsPerSession,
      avgMessagesPerCard,
      depthBuckets,
      peakHour,
      customQuestionsAccepted,
    })
  } catch (err) {
    console.error('[stats] unexpected error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}