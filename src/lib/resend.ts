import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY;

let resend: Resend | undefined;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.error("RESEND_API_KEY is not set. Email sending will not work.");
}

export async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!resend) {
    console.error("Resend client not initialized due to missing API key. Cannot send email.");
    throw new Error("Email service not available.");
  }
  return resend.emails.send({
    from: 'onboarding@resend.dev', // Use a verified sender from your Resend account
    to,
    subject,
    html,
  })
}