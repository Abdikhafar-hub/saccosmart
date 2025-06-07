import { NextResponse } from 'next/server'
import twilio from 'twilio'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

if (!accountSid || !authToken || !twilioWhatsappNumber) {
  throw new Error('Missing required Twilio environment variables')
}

const client = twilio(accountSid, authToken)

export async function POST(request: Request) {
  try {
    const { to, body } = await request.json()

    // Validate request
    if (!to || !body) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Both "to" and "body" are required' },
        { status: 400 }
      )
    }

    // Format phone number for WhatsApp
    const recipientWhatsappNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

    // Send message
    const message = await client.messages.create({
      body: body,
      from: twilioWhatsappNumber,
      to: recipientWhatsappNumber,
    })

    return NextResponse.json({
      success: true,
      sid: message.sid,
      timestamp: new Date()
    })
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    )
  }
} 