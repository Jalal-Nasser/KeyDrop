import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  // Send email to your support address
  await sendMail({
    from: 'no-reply@yourdomain.com', // Change to your support email
    to: 'support@yourdomain.com', // Change to your support email
    subject: `Contact Form Submission from ${name}`,
    html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br/>${message}</p>`
  })
  return NextResponse.json({ success: true })
}