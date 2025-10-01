const { createServer } = require('http')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = dev ? 'localhost' : '0.0.0.0' // Listen on all interfaces in production
const port = process.env.PORT || 3000

// Add debug logging for key environment variables
console.log('--- Server Startup Debug ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Hostname:', hostname); // Log the resolved hostname
console.log('Port:', port); // Log the resolved port
console.log('NEXT_PUBLIC_SUPABASE_URL (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + '...' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY (present):', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('POSTMARK_API_TOKEN (present):', !!process.env.POSTMARK_API_TOKEN);
console.log('VONAGE_API_KEY (present):', !!process.env.VONAGE_API_KEY);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET');
console.log('--- End Debug ---');

// Wrap the entire application startup in a try-catch to log early errors
try {
  const app = next({ dev, hostname, port })
  const handle = app.getRequestHandler()

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        await handle(req, res)
      } catch (err) {
        console.error('Error handling request', err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })
      .once('error', (err) => {
        console.error('Server error:', err)
        process.exit(1)
      })
      .listen(port, hostname, () => { // Pass hostname to listen method
        console.log(`> Ready on http://${hostname}:${port}`)
      })
  }).catch(err => {
    console.error('Next.js app.prepare() failed:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('Critical error during server initialization:', err);
  process.exit(1);
}