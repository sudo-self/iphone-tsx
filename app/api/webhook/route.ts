import { NextRequest, NextResponse } from 'next/server'

// Load verify token from environment variables
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || ''

// GET request → Verification handshake with Facebook
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhook] Verified successfully')
    return new Response(challenge, { status: 200 })
  } else {
    console.warn('[Webhook] Verification failed')
    return new Response('Forbidden', { status: 403 })
  }
}

// POST request → Facebook webhook sends messages/events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[Webhook] Event received:\n', JSON.stringify(body, null, 2))

    // Optional: handle message events here
    // const entries = body.entry || []
    // for (const entry of entries) {
    //   const messaging = entry.messaging || []
    //   for (const event of messaging) {
    //     // Example: respond or log
    //     const senderId = event.sender?.id
    //     const messageText = event.message?.text
    //     if (senderId && messageText) {
    //       // Add your response logic here
    //     }
    //   }
    // }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 })
  } catch (err) {
    console.error('[Webhook] Error processing event:', err)
    return new Response('Bad Request', { status: 400 })
  }
}

