import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

const DEV_PIN = process.env.DEV_PIN ?? ''

export async function GET(req: NextRequest) {
  const pin = req.headers.get('x-dev-pin')

  if (!DEV_PIN || pin !== DEV_PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('feedback')
    .select('id, type, message, contact, page_url, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[dev/feedback] query failed:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  return NextResponse.json({ feedback: data ?? [] })
}