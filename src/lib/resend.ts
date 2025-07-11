import { Resend } from 'resend'

// You must set RESEND_API_KEY in your environment variables
export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: any[] }) {
  return resend.emails.send({
    from: 'no-reply@yourdomain.com', // Change to your verified sender
    to,
    subject,
    html,
    attachments,
  })
}

export async function sendOrderDeliveryMail({ to, orderId, productList }: { to: string, orderId: string, productList: string }) {
  return sendMail({
    to,
    subject: `Your Order #${orderId} - Delivery from Dropskey`,
    html: `<h2>Thank you for your purchase!</h2><p>Your order <b>#${orderId}</b> has been processed.</p><div>${productList}</div><p>If you have any questions, reply to this email.</p>`,
    attachments: [],
  })
}