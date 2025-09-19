import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// This endpoint can be called by external cron services
// Example: Vercel Cron, GitHub Actions, or a simple cron job
export async function GET(req: NextRequest) {
  try {
    // Verify the request is from an authorized source (optional security)
    const authHeader = req.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Call the auto-cancel API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/admin/auto-cancel-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('Auto-cancel API failed:', result)
      return NextResponse.json({ 
        error: 'Auto-cancel process failed',
        details: result 
      }, { status: 500 })
    }
    
    console.log('Cron job completed successfully:', result)
    return NextResponse.json({
      success: true,
      message: 'Auto-cancel cron job completed',
      ...result
    })
    
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ 
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also support POST for flexibility
export async function POST(req: NextRequest) {
  return GET(req)
}
