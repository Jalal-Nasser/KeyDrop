"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type SupabaseClient, type Session } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"

type SessionContextType = {
  session: Session | null
  supabase: SupabaseClient
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SessionContext.Provider value={{ session, supabase, isLoading }}>
      {children}
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