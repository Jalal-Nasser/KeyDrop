import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  console.log("API /api/auth/set-session: POST request received.");
  try {
    const body = await req.json().catch(() => ({}))
    const access_token = body?.access_token as string | undefined
    const refresh_token = body?.refresh_token as string | undefined

    console.log("API /api/auth/set-session: Access token present:", !!access_token, "Refresh token present:", !!refresh_token);

    if (!access_token || !refresh_token) {
      console.error("API /api/auth/set-session: Missing tokens in request body.");
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) {
      console.error("API /api/auth/set-session: Error setting session:", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    console.log("API /api/auth/set-session: Session successfully set.");
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("API /api/auth/set-session: Unexpected error:", e?.message || 'Failed to set session');
    return NextResponse.json({ error: e?.message || 'Failed to set session' }, { status: 500 })
  }
}