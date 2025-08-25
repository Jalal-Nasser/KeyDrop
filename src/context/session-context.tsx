"use client"

    import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
  import { createClientComponentClient, Session, SupabaseClient } from "@supabase/auth-helpers-nextjs"
  import { Database } from "@/types/supabase"
  import { getSupabaseBrowserClient } from "@/integrations/supabase/client"

    type SessionContextType = {
      session: Session | null
      supabase: SupabaseClient<Database> | null
      isLoading: boolean
    }

    const SessionContext = createContext<SessionContextType | undefined>(undefined)

    export function SessionProvider({ children }: { children: ReactNode }) {
      const [session, setSession] = useState<Session | null>(null)
      const [isLoading, setIsLoading] = useState(true)
      const [sbClient, setSbClient] = useState<SupabaseClient<Database> | null>(null)

      useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        setSbClient(supabase)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
          setIsLoading(false)
        })

        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
          setIsLoading(false)
        })

        return () => subscription.unsubscribe()
      }, []) // Runs once

      return (
  <SessionContext.Provider value={{ session, supabase: sbClient, isLoading }}>
          {children}
        </SessionContext.Provider>
      )
    }

    export function useSession() {
      const context = useContext(SessionContext)
      if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider")
      }
      return context
    }