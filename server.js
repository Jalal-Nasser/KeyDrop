const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Add debug logging
console.log('--- Server Startup Debug (Plesk/Passenger) ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Passenger PORT (socket path):', process.env.PORT); 
console.log('NEXT_PUBLIC_SUPABASE_URL (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + '...' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY (present):', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('POSTMARK_API_TOKEN (present):', !!process.env.POSTMARK_API_TOKEN);
console.log('VONAGE_API_KEY (present):', !!process.env.VONAGE_API_KEY);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET');
console.log('--- End Debug ---');

// Passenger expects the application to export a request handler.
// The app.prepare() call is crucial to ensure Next.js is ready before handling requests.
app.prepare().then(() => {
  module.exports = handle;
}).catch(err => {
  console.error('Next.js app.prepare() failed:', err);
  process.exit(1); // Ensure the process exits if preparation fails
});

// If Passenger is configured to run `server.js` as a "web application",
// it will look for `module.exports` to be an HTTP handler function.
// It will then create its own HTTP server and pass requests to this handler.
// This removes the need for `http.createServer().listen()` within `server.js` itself.