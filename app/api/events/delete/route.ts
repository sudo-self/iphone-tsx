// app/api/events/delete/route.ts
import { NextResponse } from 'next/server';
import { deleteEvent } from '@/lib/redis';

export async function POST(req: Request) {
  const { date } = await req.json();
  const ok = await deleteEvent(date);
  return NextResponse.json({ success: ok });
}

