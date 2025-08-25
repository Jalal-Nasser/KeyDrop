import { NextResponse, type NextRequest } from 'next/server'
import { generateEarlyInitScript } from './lib/early-init-script'

// This middleware runs before any Next.js code
// It injects our early initialization script directly into the HTML head
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Only add headers for HTML responses
  const url = request.nextUrl.pathname
  
  // Don't run for API routes or static files
  if (url.startsWith('/api/') || 
      url.includes('.') ||
      url.startsWith('/_next/')) {
    return response
  }
  
  // Add a special header that our Server Component will use
  // to inject the script into the head
  response.headers.set('x-inject-early-init', 'true')
  
  return response
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
