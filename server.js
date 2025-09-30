const { createServer } = require('http')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Add debug logging for key environment variables
console.log('--- Server Startup Debug ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + '...' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY (present):', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('POSTMARK_API_TOKEN (present):', !!process.env.POSTMARK_API_TOKEN);
console.log('VONAGE_API_KEY (present):', !!process.env.VONAGE_API_KEY);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET');
console.log('--- End Debug ---');

// when using middleware `hostname` and `port` must be provided below
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
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})