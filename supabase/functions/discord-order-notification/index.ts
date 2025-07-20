/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper functions to create different embeds
function createNewOrderEmbed(orderId: string, cartTotal: number, userEmail: string, cartItems: any[]) {
  const itemDetails = cartItems.map((item: any) => `- ${item.name} (x${item.quantity})`).join('\n')
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
    timestamp: new Date().toISOString(),
    footer: { text: "Dropskey Store" }
  };
}

function createOrderCompletedEmbed(orderId: string, cartTotal: number, userEmail: string) {
  return {
    title: "Order Completed! ✅",
    description: `An order has been successfully fulfilled and marked as completed.`,
    color: 3447003, // Blue
    fields: [
      { name: "Order ID", value: `\`${orderId}\``, inline: true },
      { name: "Total", value: `$${cartTotal.toFixed(2)}`, inline: true },
      { name: "Customer Email", value: userEmail, inline: false }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Dropskey Store" }
  };
}

function createOrderCancelledEmbed(orderId: string, cartTotal: number, userEmail: string) {
  return {
    title: "Order Cancelled ❌",
    description: `An order has been cancelled.`,
    color: 15158332, // Red
    fields: [
      { name: "Order ID", value: `\`${orderId}\``, inline: true },
      { name: "Total", value: `$${cartTotal.toFixed(2)}`, inline: true },
      { name: "Customer Email", value: userEmail, inline: false }
    ],
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
    const { notificationType, orderId, cartTotal, userEmail, cartItems } = await req.json()

    const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL')
    if (!DISCORD_WEBHOOK_URL) {
      throw new Error('DISCORD_WEBHOOK_URL is not set in environment variables.')
    }

    let embed;
    switch (notificationType) {
      case 'new_order':
        embed = createNewOrderEmbed(orderId, cartTotal, userEmail, cartItems);
        break;
      case 'order_completed':
        embed = createOrderCompletedEmbed(orderId, cartTotal, userEmail);
        break;
      case 'order_cancelled':
        embed = createOrderCancelledEmbed(orderId, cartTotal, userEmail);
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