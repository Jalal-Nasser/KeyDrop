// === CRITICAL FIX: Load Environment Variables at Runtime ===
// This MUST be the first line to ensure all secrets (Supabase, Vonage, etc.) 
// are available when 'next' initializes and reads environment variables.
require('dotenv').config({ path: './.env.production' }); 

const { createServer } = require('http'); // <-- Add this import for the reliable Passenger handler
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';

// The app initialization will now have access to all secrets from .env.production
const app = next({ dev }); 
const handle = app.getRequestHandler();

// Add debug logging (now the environment variables should appear!)
console.log('--- Server Startup Debug (Plesk/Passenger) ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Passenger PORT (socket path):', process.env.PORT); 
console.log('NEXT_PUBLIC_SUPABASE_URL (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + '...' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY (present):', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('POSTMARK_API_TOKEN (present):', !!process.env.POSTMARK_API_TOKEN);
console.log('VONAGE_API_KEY (present):', !!process.env.VONAGE_API_KEY);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET');
console.log('--- End Debug ---');

// === CRITICAL FIX: Use the reliable `listen()` method for Passenger ===
// Passenger provides the socket path via the PORT environment variable.
const port = process.env.PORT; 

app.prepare()
  .then(() => {
    // Create the standard Node.js HTTP server
    createServer((req, res) => {
      // Pass the request to the Next.js handler
      handle(req, res);
    })
    // CRITICAL: Listen on the Passenger 'port' (the socket path)
    .listen(port, (err) => {
      if (err) {
          console.error('Server failed to start:', err);
          throw err;
      }
      console.log(`> Next.js Server Ready on Passenger socket: ${port}`);
    });
  })
  .catch((ex) => {
    console.error('Next.js preparation or startup failed:', ex.stack);
    process.exit(1);
  });