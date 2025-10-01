const next = require('next');
const http = require('http'); // Explicitly require http module

// Set dev based on the production mode in Plesk
const dev = process.env.NODE_ENV !== 'production';

// Passenger automatically sets the PORT and manages the socket.
// We must use the PORT it provides, but we should NOT pass a hostname
// or manually create the HTTP server, as Next's handler can often be
// sufficient for Passenger's needs.
const port = process.env.PORT; // Phusion Passenger sets this socket path

// Add debug logging
console.log('--- Server Startup Debug (Plesk/Passenger) ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Passenger PORT (socket path):', port); 
console.log('NEXT_PUBLIC_SUPABASE_URL (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + '...' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY (present):', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('POSTMARK_API_TOKEN (present):', !!process.env.POSTMARK_API_TOKEN);
console.log('VONAGE_API_KEY (present):', !!process.env.VONAGE_API_KEY);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET');
console.log('--- End Debug ---');

// Wrap the entire application startup in a try-catch
try {
  // We don't need to specify hostname and port in next() call 
  // when using a custom server that is just wrapping the handler.
  const app = next({ dev }); 
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    // Passenger expects the application to either:
    // 1. Use its own abstraction (best for simple apps, but not custom server)
    // 2. Listen on the socket path provided in process.env.PORT
    
    // For Next.js custom server, the simplest fix is to just let the 
    // Next.js handler run without the http.createServer wrapper.
    // Passenger will internally use the handler with its own server logic.
    
    // If the simple app.prepare().then(() => handle) approach doesn't work,
    // the most common *working* fix for custom Next.js servers on Passenger is:
    
    http.createServer(handle).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Next.js handler listening on Passenger socket: ${port}`);
    });
    
  }).catch(err => {
    console.error('Next.js app.prepare() failed:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('Critical error during server initialization:', err);
  process.exit(1);
}