/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, cartTotal, userEmail, cartItems } = await req.json()

    const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL')

    if (!DISCORD_WEBHOOK_URL) {
      throw new Error('DISCORD_WEBHOOK_URL is not set in environment variables.')
    }

    const itemDetails = cartItems.map((item: any) => `- ${item.name} (x${item.quantity})`).join('\n')

    const discordPayload = {
      username: "Dropskey Order Bot",
      avatar_url: "https://www.dropskey.com/favicon.ico", // You can change this to your bot's avatar
      embeds: [
        {
          title: "New Order Received! 🚀",
          description: `A new order (ID: ${orderId}) has been placed.`,
          color: 5814783, // A nice blue color for the embed
          fields: [
            {
              name: "Order ID",
              value: orderId,
              inline: true
            },
            {
              name: "Total",
              value: `$${cartTotal.toFixed(2)}`,
              inline: true
            },
            {
              name: "Customer Email",
              value: userEmail,
              inline: false
            },
            {
              name: "Items",
              value: itemDetails || "No items listed.",
              inline: false
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "Dropskey Store"
          }
        }
      ]
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Discord webhook failed: ${response.status} - ${errorText}`)
      return new Response(JSON.stringify({ error: `Failed to send Discord notification: ${errorText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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