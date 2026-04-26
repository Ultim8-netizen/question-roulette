import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

/**
 * GET /api/ping
 *
 * Keeps the Supabase free-tier project alive.
 * Fired daily by Vercel cron (vercel.json).
 *
 * Recommended: also add this URL to cron-job.org (free) as a second layer.
 * cron-job.org runs from outside Vercel so it fires even during cold starts,
 * making it more reliable than the Vercel cron alone.
 *
 *   URL:      https://yourdomain.com/api/ping
 *   Schedule: once daily (or every 12 hours)
 */
export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('roulette_rooms')
      .select('id')
      .limit(1)

    if (error) {
      console.error('[ping] Supabase check failed:', error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ts: new Date().toISOString() })
  } catch (err) {
    console.error('[ping] Unexpected error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}