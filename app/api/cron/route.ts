import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your keep-alive / scheduled logic goes here
  console.log('Cron job executed at', new Date().toISOString());

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}