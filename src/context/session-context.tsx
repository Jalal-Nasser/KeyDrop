"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClientComponentClient, Session, SupabaseClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase-wrapper"
  import { getSupabaseBrowserClient } from "@/integrations/supabase/client"
  import { getPublicEnv } from "@/lib/public-env"
  import { createDirectSupabaseClient } from "@/lib/supabase-safe-client"

    type SessionContextType = {
      session: Session | null
      supabase: SupabaseClient<Database> | null
      isLoading: boolean
    }

    const SessionContext = createContext<SessionContextType | undefined>(undefined)

    // This component provides immediate access to a Supabase client 
    // even before environment variables are loaded
    export function SessionProvider({ children }: { children: ReactNode }) {
      const [session, setSession] = useState<Session | null>(null)
      const [isLoading, setIsLoading] = useState(true)
      const [sbClient, setSbClient] = useState<SupabaseClient<Database> | null>(null)

      // Initialize client immediately during component creation
      // This runs during the initial render, not in an effect
      if (!sbClient) {
        try {
          // Always use direct client that bypasses validation
          const client = createDirectSupabaseClient()
          setSbClient(client)
        } catch (e) {
          console.error("Failed to create client during initialization", e)
        }
      }
      
      useEffect(() => {
        let unsub: { unsubscribe: () => void } | null = null
        
        // If we don't have a client yet, try again
        if (!sbClient) {
          try {
            const client = createDirectSupabaseClient()
            setSbClient(client)
          } catch (e) {
            console.error("Failed to create direct client in effect", e)
          }
        }
        
        // Use existing client or try one last time
        const supabase = sbClient || (() => {
          try { 
            return createDirectSupabaseClient()
          } catch (e) { 
            return null 
          }
        })()
        
        if (!sbClient && supabase) {
          setSbClient(supabase)
        }
        
        const init = async () => {
          try {
            // Try to get a better env for future use
            await getPublicEnv()
            
            if (supabase) {
              // Set up auth change listener
              try {
                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                  setSession(session)
                  setIsLoading(false)
                })
                unsub = subscription
              } catch (e) {
                console.error("Error setting up auth listener:", e)
              }

              // Get initial session
              try {
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
              } catch (e) {
                console.error("Error getting session:", e)
              }
            }
          } catch (e) {
            console.error("Error in session init:", e)
          } finally {
            // Always mark as not loading
            setIsLoading(false)
          }
        }
        
        init()

        return () => {
          if (unsub) unsub.unsubscribe()
        }
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