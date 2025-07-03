import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

// TODO: Replace this with your actual admin email address.
const ADMIN_EMAIL = "admin@example.com"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is needed to invoke the function from a browser.
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

    // --- Placeholder for actual email sending logic ---
    // In a real application, you would integrate a service like Resend or SendGrid here.
    // You would set their API key as a secret in your Supabase project settings.
    console.log("--- Email to be sent ---")
    console.log(`To: ${ADMIN_EMAIL}`)
    console.log(`Subject: ${emailSubject}`)
    console.log(`Body: \n${emailBody}`)
    console.log("------------------------")
    // Example: await sendEmailWithResend(ADMIN_EMAIL, emailSubject, emailBody);
    // ----------------------------------------------------

    return new Response(JSON.stringify({ message: 'Ticket submitted successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})