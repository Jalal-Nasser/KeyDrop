import { sendMail } from './postmark'

export async function sendOrderDeliveryMail({ to, orderId, productList }: { to: string, orderId: string, productList: string }) {
  return sendMail({
    to,
    subject: `Your Order #${orderId} - Delivery from Dropskey`,
    html: `<h2>Thank you for your purchase!</h2><p>Your order <b>#${orderId}</b> has been processed.</p><div>${productList}</div><p>If you have any questions, reply to this email.</p>`
  })
}