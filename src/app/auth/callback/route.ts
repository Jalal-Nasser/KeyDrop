import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Optionally handle state, code, error, etc.
  // Redirect to your desired page after login
  return NextResponse.redirect(new URL('/account', request.url))
}
