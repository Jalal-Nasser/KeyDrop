import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import crypto from 'crypto'
import { sendMail } from '@/lib/postmark'

// Zod schema for validating the request body
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  subject: z.string().min(1, 'Subject is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  turnstileToken: z.string().min(1, 'Turnstile token is missing.'),
})

// Turnstile verification function
async function verifyTurnstile(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not set.")
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    ...(ip && { remoteip: ip }),
  })

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  })

  const data = await response.json()
  return data as { success: boolean; 'error-codes'?: string[] }
}

export async function POST(req: NextRequest) {
  // Get the IP address and handle the case where it might contain multiple IPs (like with x-forwarded-for)
  const getClientIp = (req: NextRequest) => {
    // Get the x-forwarded-for header if it exists
    const xForwardedFor = req.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      // Take the first IP address if there are multiple
      return xForwardedFor.split(',')[0].trim();
    }
    // Fall back to req.ip or undefined
    return req.ip || undefined;
  };
  
  const ip = getClientIp(req);
  const supabaseAdmin = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await req.json()
    const validation = contactSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 })
    }

    const { name, email, subject, message, turnstileToken } = validation.data

    // 1. Verify Turnstile token
    const turnstileResponse = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileResponse.success) {
      return NextResponse.json({ error: 'CAPTCHA verification failed.', details: turnstileResponse['error-codes'] }, { status: 403 })
    }

    // 2. Rate Limiting (5 submissions per 10 minutes)
    // Use a default key if IP is not available (shouldn't happen in production with proper proxy setup)
    const rateLimitKey = ip ? `contact:${ip}` : `contact:anonymous-${crypto.randomUUID()}`
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin
      .from('rate_limits')
      .select('*')
      .eq('key', rateLimitKey)
      .single()

    if (rateLimitData && new Date(rateLimitData.window_start) > new Date(tenMinutesAgo)) {
      if (rateLimitData.count >= 5) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
      await supabaseAdmin.from('rate_limits').update({ count: rateLimitData.count + 1 }).eq('key', rateLimitKey)
    } else {
      await supabaseAdmin.from('rate_limits').upsert({ key: rateLimitKey, count: 1, window_start: new Date().toISOString() })
    }

    // 3. Duplicate Submission Guard (same email + message from same IP within 2 minutes)
    const messageHash = crypto.createHash('sha256').update(`${email}:${message}`).digest('hex')
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

    const { data: existingMessage, error: duplicateCheckError } = await supabaseAdmin
      .from('contact_messages')
      .select('id')
      .eq('ip', ip)
      .eq('message_sha', messageHash)
      .gte('created_at', twoMinutesAgo)
      .limit(1)
      .single()

    if (existingMessage) {
      return NextResponse.json({ error: 'This looks like a duplicate submission.' }, { status: 409 })
    }

    // 4. Insert into database
    const { error: insertError } = await supabaseAdmin.from('contact_messages').insert({
      name,
      email,
      subject,
      message,
      ip,
      message_sha: messageHash,
    })

    if (insertError) {
      throw new Error(`Database insert error: ${insertError.message}`)
    }

    // 5. (Optional) Send notification email
    try {
      const toAddress = process.env.POSTMARK_TO || 'support@dropskey.com'
      const fromAddress = process.env.POSTMARK_FROM || 'no-reply@dropskey.com'
      await sendMail({
        to: toAddress,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>IP Address:</strong> ${ip}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
  from: fromAddress,
  replyTo: email,
      })
    } catch (emailError) {
      console.error("Failed to send contact notification email:", emailError)
      // Do not block the user response for this
    }

    return NextResponse.json({ success: true, message: 'Your message has been sent successfully!' })
  } catch (error: any) {
    console.error('Contact form API error:', error)
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}