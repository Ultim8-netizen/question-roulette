import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

const VALID_TYPES = ['general', 'bug', 'idea', 'question'] as const
type FeedbackType = typeof VALID_TYPES[number]

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const raw = body as Record<string, unknown>

  const type    = (typeof raw.type    === 'string' ? raw.type.trim()    : 'general') as FeedbackType
  const message = typeof raw.message  === 'string' ? raw.message.trim() : ''
  const contact = typeof raw.contact  === 'string' ? raw.contact.trim() : null
  const pageUrl = typeof raw.pageUrl  === 'string' ? raw.pageUrl.trim() : null

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  if (message.length < 1 || message.length > 1000) {
    return NextResponse.json(
      { error: 'Message must be between 1 and 1000 characters' },
      { status: 400 },
    )
  }

  if (contact && contact.length > 200) {
    return NextResponse.json({ error: 'Contact too long' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { error } = await supabase.from('feedback').insert({
    type,
    message,
    contact:  contact  || null,
    page_url: pageUrl  || null,
  })

  if (error) {
    console.error('[feedback] insert failed:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}