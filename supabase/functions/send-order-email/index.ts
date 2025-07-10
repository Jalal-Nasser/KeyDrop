// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { Resend } from "https://esm.sh/resend@4.6.0"

// Declare Deno.env to satisfy TypeScript for this file
declare global {
  namespace Deno {
    const env: {
      get(key: string): string | undefined;
    };
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // This is needed to invoke the function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set in environment variables.")
    }

    const resend = new Resend(resendApiKey)

    const { data, error } = await resend.emails.send({
      from: 'Dropskey <no-reply@dropskey.com>', // Ensure this is a verified sender in Resend
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend email error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ message: 'Email sent successfully!', data }), {
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