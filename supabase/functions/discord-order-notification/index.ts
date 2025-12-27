// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper functions to create different embeds
function createNewOrderEmbed(orderId: string, cartTotal: number, userEmail: string, cartItems: any[]) {
  const itemDetails = cartItems.map((item: any) => `- ${item.name} (x${item.quantity})`).join('\n')
  
  // Get the image from the first product, if available
  const firstProductImage = cartItems.length > 0 && cartItems[0].image ? cartItems[0].image : null;

  return {
    title: "New Order Received! 🚀",
    description: `A new order has been placed and is pending fulfillment.`,
    color: 3066993, // Green
    fields: [
      { name: "Order ID", value: `\`${orderId}\``, inline: true },
      { name: "Total", value: `$${cartTotal.toFixed(2)}`, inline: true },
      { name: "Customer Email", value: userEmail, inline: false },
      { name: "Items", value: itemDetails || "No items listed.", inline: false }
    ],
    thumbnail: firstProductImage ? { url: firstProductImage } : undefined, // Add thumbnail if image exists
    timestamp: new Date().toISOString(),
    footer: { text: "Dropskey Store" }
  };
}

// Modified to accept productImage
function createOrderCompletedEmbed(orderId: string, cartTotal: number, userEmail: string, productImage: string | null) {
  return {
    title: "Order Completed! ✅",
    description: `An order has been successfully fulfilled and marked as completed.`,
    color: 3447003, // Blue
    fields: [
      { name: "Order ID", value: `\`${orderId}\``, inline: true },
      { name: "Total", value: `$${cartTotal.toFixed(2)}`, inline: true },
      { name: "Customer Email", value: userEmail, inline: false }
    ],
    thumbnail: productImage ? { url: productImage } : undefined, // Add thumbnail if image exists
    timestamp: new Date().toISOString(),
    footer: { text: "Dropskey Store" }
  };
}

// Modified to accept productImage
function createOrderCancelledEmbed(orderId: string, cartTotal: number, userEmail: string, productImage: string | null) {
  return {
    title: "Order Cancelled ❌",
    description: `An order has been cancelled.`,
    color: 15158332, // Red
    fields: [
      { name: "Order ID", value: `\`${orderId}\``, inline: true },
      { name: "Total", value: `$${cartTotal.toFixed(2)}`, inline: true },
      { name: "Customer Email", value: userEmail, inline: false }
    ],
    thumbnail: productImage ? { url: productImage } : undefined, // Add thumbnail if image exists
    timestamp: new Date().toISOString(),
    footer: { text: "Dropskey Store" }
  };
}

// New function for auto-cancelled orders
function createOrderAutoCancelledEmbed(orderId: string, cartTotal: number, userEmail: string, productImage: string | null) {
  return {
    title: "Order Auto-Cancelled ⏰",
    description: `An order has been automatically cancelled due to incomplete payment.`,
    color: 16776960, // Yellow/Orange
    fields: [
      { name: "Order ID", value: `\`${orderId}\``, inline: true },
      { name: "Total", value: `$${cartTotal.toFixed(2)}`, inline: true },
      { name: "Customer Email", value: userEmail, inline: false },
      { name: "Reason", value: "Payment not completed within 10 minutes", inline: false }
    ],
    thumbnail: productImage ? { url: productImage } : undefined,
    timestamp: new Date().toISOString(),
    footer: { text: "Dropskey Store" }
  };
}

// New function for received orders
function createOrderReceivedEmbed(orderId: string, cartTotal: number, userEmail: string, productImage: string | null) {
  return {
    title: "Order Received 📦",
    description: `An order has been received and is being processed.`,
    color: 3447003, // Blue
    fields: [
      { name: "Order ID", value: `\`${orderId}\``, inline: true },
      { name: "Total", value: `$${cartTotal.toFixed(2)}`, inline: true },
      { name: "Customer Email", value: userEmail, inline: false },
      { name: "Status", value: "Order received and being prepared for fulfillment", inline: false }
    ],
    thumbnail: productImage ? { url: productImage } : undefined,
    timestamp: new Date().toISOString(),
    footer: { text: "Dropskey Store" }
  };
}

// Main function to handle requests
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Added productImage to destructuring
    const { notificationType, orderId, cartTotal, userEmail, cartItems, productImage } = await req.json()

    const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL')
    if (!DISCORD_WEBHOOK_URL) {
      throw new Error('DISCORD_WEBHOOK_URL is not set in environment variables.')
    }

    let embed;
    switch (notificationType) {
      case 'new_order':
        embed = createNewOrderEmbed(orderId, cartTotal, userEmail, cartItems);
        break;
      case 'order_received':
        embed = createOrderReceivedEmbed(orderId, cartTotal, userEmail, productImage);
        break;
      case 'order_completed':
        embed = createOrderCompletedEmbed(orderId, cartTotal, userEmail, productImage); // Passed productImage
        break;
      case 'order_cancelled':
        embed = createOrderCancelledEmbed(orderId, cartTotal, userEmail, productImage); // Passed productImage
        break;
      case 'order_auto_cancelled':
        embed = createOrderAutoCancelledEmbed(orderId, cartTotal, userEmail, productImage);
        break;
      default:
        throw new Error(`Invalid notification type: ${notificationType}`);
    }

    const discordPayload = {
      username: "Dropskey Order Bot",
      avatar_url: "https://www.dropskey.com/favicon.ico",
      embeds: [embed]
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Discord webhook failed: ${response.status} - ${errorText}`)
      throw new Error(`Failed to send Discord notification: ${errorText}`)
    }

    return new Response(JSON.stringify({ message: 'Discord notification sent successfully!' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Error in Discord webhook function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})