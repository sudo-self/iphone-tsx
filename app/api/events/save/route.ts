// app/api/events/save/route.ts
import { NextResponse } from 'next/server';
import { saveEvent } from '@/lib/redis';

export async function POST(req: Request) {
  const { date, event } = await req.json();
  const ok = await saveEvent(date, event);
  return NextResponse.json({ success: ok });
}

