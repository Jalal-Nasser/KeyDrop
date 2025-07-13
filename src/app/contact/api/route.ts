import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/postmark'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Send email to your support address
    await sendMail({
      to: 'support@yourdomain.com', // Change to your support email
      subject: `Contact Form Submission from ${name}`,
      html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br/>${message}</p>`,
      // ContentType is handled by Postmark for HtmlBody, or specified within attachments
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in contact form API:", error);
    // Return a JSON error response for any unhandled errors
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}