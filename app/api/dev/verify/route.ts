import { NextRequest, NextResponse } from 'next/server'

const DEV_PIN = process.env.DEV_PIN ?? ''

export async function POST(req: NextRequest) {
  const body = await req.json()
  const pin  = body?.pin as string

  if (!DEV_PIN || pin !== DEV_PIN) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}