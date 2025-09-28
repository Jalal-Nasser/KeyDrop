// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Vonage API configuration
const VONAGE_API_KEY = Deno.env.get('VONAGE_API_KEY') || '';
const VONAGE_API_SECRET = Deno.env.get('VONAGE_API_SECRET') || '';
const VONAGE_WHATSAPP_NUMBER = Deno.env.get('VONAGE_WHATSAPP_NUMBER') || '';

// Handle incoming webhook from WhatsApp
async function handleIncomingMessage(message: any) {
  try {
    console.log('Processing WhatsApp message:', JSON.stringify(message, null, 2));
    
    // Basic validation
    if (!message.message?.content?.text || !message.message.from) {
      console.log('Invalid message format');
      return { success: false, error: 'Invalid message format' };
    }

    const from = message.message.from;
    const text = message.message.content.text;
    
    // Process the message (add your business logic here)
    console.log(`Message from ${from}: ${text}`);
    
    // Send an auto-reply
    await sendWhatsAppMessage(
      from,
      'Thank you for your message! We will get back to you soon.'
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return { success: false, error: error.message };
  }
}

// Send a WhatsApp message using the Vonage REST API
async function sendWhatsAppMessage(to: string, text: string) {
  try {
    console.log('Sending WhatsApp message...');
    console.log('From number:', VONAGE_WHATSAPP_NUMBER);
    console.log('To number:', to);
    
    // Create basic auth header
    const authString = btoa(`${VONAGE_API_KEY}:${VONAGE_API_SECRET}`);
    const requestBody = {
      from: VONAGE_WHATSAPP_NUMBER,
      to: to,
      message_type: 'text',
      text: text,
      channel: 'whatsapp'
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // Make the API request
    const response = await fetch('https://api.nexmo.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Vonage API response status:', response.status);
    console.log('Vonage API response:', responseText);

    if (!response.ok) {
      throw new Error(`Vonage API error: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Message sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
}

// Main server function
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get the authorization header
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  // Verify the token (basic check)
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'No authorization token provided' }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    // Parse the request body
    const payload = await req.json();
    
    // Handle the webhook
    const result = await handleIncomingMessage(payload);
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
