"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Session, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase-wrapper"
import { createDirectSupabaseClient } from "@/lib/supabase-safe-client"

type SessionContextType = {
  session: Session | null
  supabase: SupabaseClient<Database>
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Initialize client directly. It's guaranteed to return a client.
  const [sbClient] = useState<SupabaseClient<Database>>(() => createDirectSupabaseClient())

  useEffect(() => {
    const { data: { subscription } } = sbClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    });

    // Get initial session
    sbClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe();
    };
  }, [sbClient])

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