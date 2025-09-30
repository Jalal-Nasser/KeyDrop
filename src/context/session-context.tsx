"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react"
import type { Session, SupabaseClient, User } from "@supabase/supabase-js"
import { Database } from "@/types/supabase-wrapper"
import { createDirectSupabaseClient } from "@/lib/supabase-safe-client"

type SessionContextType = {
  session: Session | null
  user: User | null
  supabase: SupabaseClient<Database>
  isLoading: boolean
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Initialize client using useMemo to prevent recreation on re-renders
  const supabase = useMemo(() => createDirectSupabaseClient(), [])

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
        }
      }
    )

    // Get initial session
    getInitialSession()

    // Cleanup function
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [supabase])

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    session,
    user,
    supabase,
    isLoading,
    signOut,
  }), [session, user, supabase, isLoading])

  return (
    <SessionContext.Provider value={value}>
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