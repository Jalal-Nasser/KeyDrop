# WhatsApp Webhook Function

This Supabase Edge Function handles incoming WhatsApp messages via the Vonage (formerly Nexmo) API.

## Setup Instructions

1. **Deploy the Function**
   ```bash
   supabase functions deploy whatsapp-webhook --project-ref your-project-ref
   ```

2. **Set Environment Variables**
   Set these environment variables in your Supabase project:
   - `VONAGE_API_KEY`: Your Vonage API key
   - `VONAGE_API_SECRET`: Your Vonage API secret
   - `VONAGE_APPLICATION_ID`: Your Vonage application ID
   - `VONAGE_PRIVATE_KEY`: Your Vonage private key (with newlines as `\n`)
   - `VONAGE_WHATSAPP_NUMBER`: Your Vonage WhatsApp number (e.g., `14157386102`)

3. **Configure Webhook in Vonage Dashboard**
   - Go to your Vonage Dashboard
   - Navigate to your application
   - Set the webhook URL to:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/functions/v1/whatsapp-webhook
     ```
   - Enable the webhook for incoming messages

## Testing

You can test the webhook using cURL:

```bash
curl -X POST \
  https://[YOUR-PROJECT-REF].supabase.co/functions/v1/whatsapp-webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "message": {
      "content": {
        "text": "Hello, world!"
      },
      "from": "1234567890"
    }
  }'
```

## Troubleshooting

- Check the Supabase function logs for errors
- Verify all environment variables are set correctly
- Ensure your Vonage account has sufficient credits
- Make sure your Vonage application is properly configured for WhatsApp
