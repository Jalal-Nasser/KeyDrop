const useSandbox = process.env.VONAGE_USE_SANDBOX === 'true';

// Helper to get Vonage client only when needed to avoid top-level Node.js initialization
function getVonageClient() {
  const { Vonage } = require('@vonage/server-sdk');
  return new Vonage({
    apiKey: process.env.VONAGE_API_KEY || '',
    apiSecret: process.env.VONAGE_API_SECRET || '',
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: process.env.VONAGE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

export async function sendWhatsAppMessage(to: string, message: string) {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn('VONAGE_API_KEY or VONAGE_API_SECRET is not set. Skipping WhatsApp message.');
    return { success: false, skipped: true };
  }

  try {
    if (useSandbox) {
      // Send via Messages Sandbox using Basic Auth
      const auth = btoa(`${apiKey}:${apiSecret}`);
      const from = (process.env.VONAGE_WHATSAPP_NUMBER ?? '14157386102').replace(/^\+/, '');

      const res = await fetch('https://messages-sandbox.nexmo.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: to.replace(/^\+/, ''),
          message_type: 'text',
          text: message,
          channel: 'whatsapp',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Sandbox WhatsApp send failed:', res.status, res.statusText, text);
        return { success: false, status: res.status, statusText: res.statusText, body: text };
      }

      const data = await res.json().catch(() => ({}));
      console.log('Sandbox WhatsApp message accepted:', data);
      return { success: true, data };
    } else {
      // Send via Production Messages API using Vonage SDK (JWT)
      const vonage = getVonageClient();
      const response = await vonage.messages.send({
        to,
        from: process.env.VONAGE_WHATSAPP_NUMBER ?? '',
        channel: 'whatsapp',
        message_type: 'text',
        text: message,
        client_ref: `msg-${Date.now()}`
      } as any);

      console.log('Message sent successfully:', response);
      return { success: true, data: response };
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmation(phoneNumber: string, orderDetails: {
  orderId: string;
  customerName: string;
  total: string;
  items: Array<{ name: string; quantity: number }>;
}) {
  const itemsList = orderDetails.items
    .map(item => `- ${item.quantity}x ${item.name}`)
    .join('\n');

  const message = `🚀 Order Confirmation #${orderDetails.orderId}

👋 Hello ${orderDetails.customerName},

Thank you for your order! We're processing it now.

📦 Order Details:
${itemsList}

💰 Total: ${orderDetails.total}

We'll notify you when your order ships!`;

  return sendWhatsAppMessage(phoneNumber, message);
}

// Notify the store admin about a new order
export async function notifyAdminNewOrder(params: {
  orderId: string;
  total: number | string;
  userEmail?: string | null;
  channel?: 'paypal' | 'wallet' | 'manual' | string;
  productName?: string;
  productImage?: string;
  customerName?: string | null;
}) {
  const adminTo = process.env.VONAGE_ADMIN_WHATSAPP;
  if (!adminTo) {
    console.warn('VONAGE_ADMIN_WHATSAPP is not set. Skipping admin WhatsApp notification.');
    return { success: false, skipped: true };
  }

  // Format total neatly with two decimals
  const numericTotal = Number(params.total as any);
  const prettyTotal = Number.isFinite(numericTotal)
    ? `$${numericTotal.toFixed(2)}`
    : (typeof params.total === 'string' ? params.total : String(params.total));
  const lines = [
    '🛒 New Order Received',
    '',
    `#${params.orderId}`,
    `Total: ${prettyTotal}`,
    `Paid via: ${params.channel || 'unknown'}`,
    `User: ${params.userEmail || 'n/a'}`,
  ];
  if (params.productName) {
    lines.splice(1, 0, `Product: ${params.productName}`);
  }
  if (params.customerName) {
    lines.splice(2, 0, `Customer: ${params.customerName}`);
  }
  const text = lines.join('\n');

  return sendWhatsAppMessage(adminTo, text);
}
