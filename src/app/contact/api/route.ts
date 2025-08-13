import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/postmark'

async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set in environment variables.");
    throw new Error("Server configuration error: Missing Turnstile secret key.");
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v2/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });

  const data = await response.json();
  return data.success;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, turnstileToken } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify the Turnstile token
    if (!turnstileToken) {
      return NextResponse.json({ error: 'CAPTCHA challenge is required.' }, { status: 400 });
    }
    const isVerified = await verifyTurnstile(turnstileToken);
    if (!isVerified) {
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 403 });
    }

    // Send email to your support address
    await sendMail({
      to: 'support@yourdomain.com', // Change to your support email
      subject: `Contact Form Submission from ${name}`,
      html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br/>${message}</p>`,
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in contact form API:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}