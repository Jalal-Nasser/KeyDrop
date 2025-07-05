"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type SupabaseClient, type Session, type AuthChangeEvent } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"

type SessionContextType = {
  session: Session | null
  supabase: SupabaseClient
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()
      setSession(initialSession)
      setLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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