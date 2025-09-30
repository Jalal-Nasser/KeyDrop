"use client"

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useMemo, 
  useCallback,
  useRef,
  useSyncExternalStore
} from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"

type SessionContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

// Create a stable reference for the default context value
const DEFAULT_CONTEXT: Omit<SessionContextType, 'signOut'> = {
  session: null,
  user: null,
  isLoading: true,
}

// Custom hook to subscribe to auth state changes
function useAuthSubscription() {
  const [state, setState] = useState(DEFAULT_CONTEXT)
  const isMounted = useRef(true)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  // Handle initial session and auth state changes
  useEffect(() => {
    isMounted.current = true
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (isMounted.current) {
          setState({
            session,
            user: session?.user ?? null,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (isMounted.current) {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Use requestAnimationFrame to ensure updates happen in the next tick
        requestAnimationFrame(() => {
          if (isMounted.current) {
            setState({
              session,
              user: session?.user ?? null,
              isLoading: false,
            })
          }
        })
      }
    )
    
    subscriptionRef.current = subscription
    
    // Get initial session after setting up the listener
    getInitialSession()

    // Cleanup
    return () => {
      isMounted.current = false
      subscriptionRef.current?.unsubscribe()
    }
  }, [])

  return state
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading } = useAuthSubscription()
  
  // Use useRef for the signOut function to maintain referential equality
  const signOutRef = useRef<SessionContextType['signOut']>(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  })

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<SessionContextType>(
    () => ({
      session,
      user,
      isLoading,
      signOut: signOutRef.current,
    }),
    [session, user, isLoading]
  )

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}