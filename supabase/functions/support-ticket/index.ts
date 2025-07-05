import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { Resend } from 'https://esm.sh/resend@4.0.0' // Import Resend

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, userEmail, message } = await req.json()

    if (!orderId || !userEmail || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields: orderId, userEmail, message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'support@yourdomain.com' // Fallback if ADMIN_EMAIL not set

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set in environment variables.')
    }

    const resend = new Resend(resendApiKey)

    const emailSubject = `New Support Ticket for Order: ${orderId.substring(0, 8)}...`
    const emailBody = `
      <h1>New Support Ticket</h1>
      <p>A user has submitted a support ticket regarding an order.</p>
      <ul>
        <li><strong>User Email:</strong> ${userEmail}</li>
        <li><strong>Order ID:</strong> ${orderId}</li>
      </ul>
      <h2>Message from user:</h2>
      <p>${message}</p>
    `

    await resend.emails.send({
      from: 'onboarding@resend.dev', // Use a verified sender from your Resend account
      to: adminEmail,
      subject: emailSubject,
      html: emailBody,
    })

    return new Response(JSON.stringify({ message: 'Ticket submitted successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})