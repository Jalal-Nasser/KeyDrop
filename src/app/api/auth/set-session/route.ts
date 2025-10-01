import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server' // Updated import
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const access_token = body?.access_token as string | undefined
    const refresh_token = body?.refresh_token as string | undefined

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    const supabase = await createServerClient() // Await the client
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to set session' }, { status: 500 })
  }
}