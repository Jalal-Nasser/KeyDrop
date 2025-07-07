"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type SupabaseClient, type Session } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

type SessionContextType = {
  session: Session | null
  supabase: SupabaseClient
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Create the client component client here.
  // It automatically reads from environment variables and manages cookies.
  const supabase = createClientComponentClient()

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase]) // Add supabase to dependency array

  return (
    <SessionContext.Provider value={{ session, supabase }}>
      {!loading && children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === null) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}