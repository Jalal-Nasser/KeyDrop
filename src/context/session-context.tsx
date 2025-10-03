'use client'

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useMemo, 
  useRef
} from "react"
import type { Session, User, SupabaseClient, AuthChangeEvent } from "@supabase/supabase-js"
import { supabase } from "@/app/lib/supabase-browser" // Use the same client as AuthProvider
import { Database } from "@/types/supabase-fixed"

type SessionContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
  supabase: SupabaseClient<Database> // Now directly providing the single instance
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const DEFAULT_CONTEXT: Omit<SessionContextType, 'signOut' | 'supabase'> = {
  session: null,
  user: null,
  isLoading: true,
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(DEFAULT_CONTEXT)
  const isMounted = useRef(true)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    isMounted.current = true
    
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
      } catch (error: any) {
        console.error('Error getting session:', error)
        // If refresh token is invalid, clear stored auth data
        if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('Refresh Token Not Found')) {
          console.log('Clearing invalid auth tokens')
          // Clear Supabase auth storage
          if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-')) {
                localStorage.removeItem(key)
              }
            })
          }
        }
        if (isMounted.current) {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
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
    
    getInitialSession()

    return () => {
      isMounted.current = false
      subscriptionRef.current?.unsubscribe()
    }
  }, []) // No dependencies needed here, as `supabase` is a stable import

  const signOutRef = useRef<SessionContextType['signOut']>(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  })

  const contextValue = useMemo<SessionContextType>(
    () => ({
      session: state.session,
      user: state.user,
      isLoading: state.isLoading,
      signOut: signOutRef.current,
      supabase: supabase, // Directly provide the imported supabase client
    }),
    [state.session, state.user, state.isLoading]
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