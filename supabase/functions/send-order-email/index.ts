// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { ServerClient } from "https://esm.sh/postmark@4.0.5" // Changed to PostMark

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

    const postmarkApiKey = Deno.env.get("POSTMARK_API_TOKEN") // Changed to POSTMARK_API_TOKEN
    if (!postmarkApiKey) {
      throw new Error("POSTMARK_API_TOKEN is not set in environment variables.")
    }

    const postmarkClient = new ServerClient(postmarkApiKey) // Initialize PostMark client

    const { data, error } = await postmarkClient.sendEmail({ // Changed to PostMark send method
      From: 'no-reply@dropskey.com', // Ensure this is a verified sender in PostMark
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: "outbound" // Use 'outbound' for transactional emails
    })

    if (error) {
      console.error('PostMark email error:', error) // Changed log message
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