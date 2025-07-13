// app/api/events/route.ts

import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/redis';

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}


