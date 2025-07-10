import { SupabaseClient } from "@supabase/supabase-js"
import { Product } from '@/types/product'

interface OrderConfirmationEmailProps {
  supabase: SupabaseClient; // Add supabase client to props
  to: string;
  orderId: string;
  orderDate: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  customerName: string;
  invoiceLink: string;
}

export async function sendOrderConfirmationEmail({
  supabase, // Destructure supabase client
  to,
  orderId,
  orderDate,
  totalAmount,
  items,
  customerName,
  invoiceLink,
}: OrderConfirmationEmailProps) {
  const productListHtml = items.map(item => `
    <li>${item.quantity} x ${item.name} - $${item.price.toFixed(2)} each</li>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
        <img src="https://notncpmpmgostfxesrvk.supabase.co/storage/v1/object/public/product-images/public/panda.png" alt="Dropskey Logo" style="width: 60px; height: 60px; margin-bottom: 10px;">
        <h1 style="color: #1e73be; margin: 0; font-size: 24px;">Dropskey</h1>
        <p style="color: #666; font-size: 12px;">Verified Digital Key Store</p>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="color: #1e73be; font-size: 20px; margin-top: 0;">Hello ${customerName},</h2>
        <p>Thank you for your recent purchase from Dropskey! Your order <b>#${orderId.substring(0, 8)}...</b> has been successfully placed and is being processed.</p>
        <p><b>Order Date:</b> ${orderDate}</p>
        <h3 style="color: #1e73be; font-size: 18px; margin-top: 20px;">Order Summary:</h3>
        <ul style="list-style: none; padding: 0;">
          ${productListHtml}
        </ul>
        <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">Total Amount: $${totalAmount.toFixed(2)}</p>
        <p style="margin-top: 30px; text-align: center;">
          <a href="${invoiceLink}" style="display: inline-block; padding: 12px 25px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Full Invoice</a>
        </p>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">If you have any questions or need support, please don't hesitate to reply to this email or visit our contact page.</p>
      </div>
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        <p>Dropskey | 123 Digital Key Street, Suite 456, Tech City, TX 78701, USA</p>
        <p>+1 (310) 777 8808 | support@dropskey.com</p>
        <p>Copyright © 2025 Dropskey</p>
      </div>
    </div>
  `;

  // Invoke the Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('send-order-email', {
    body: {
      to,
      subject: `Your Dropskey Order Confirmation #${orderId.substring(0, 8)}...`,
      html: htmlContent,
    },
  });

  if (error) {
    console.error("Error invoking send-order-email function:", error);
    throw new Error(`Failed to send order confirmation email: ${error.message}`);
  }

  return data;
}