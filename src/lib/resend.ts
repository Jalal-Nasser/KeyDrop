import { Resend } from 'resend'

// You must set RESEND_API_KEY in your environment variables
export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  return resend.emails.send({
    from: 'admin@dropskey.com', // Change this to your verified sender email in Resend
    to,
    subject,
    html,
  })
}