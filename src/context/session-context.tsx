"use client"

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useMemo, 
  useRef
} from "react"
import type { Session, User, SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/integrations/supabase/client" // Import the client getter
import { Database } from "@/types/supabase-fixed"

type SessionContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
  supabase: SupabaseClient<Database> | null // Allow null for initial state
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const DEFAULT_CONTEXT: Omit<SessionContextType, 'signOut' | 'supabase'> = {
  session: null,
  user: null,
  isLoading: true,
}

function useAuthSubscription() {
  const [state, setState] = useState(DEFAULT_CONTEXT)
  const isMounted = useRef(true)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const [browserSupabase, setBrowserSupabase] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    isMounted.current = true
    
    // Initialize browserSupabase client on the client side
    try {
      const client = getSupabaseBrowserClient();
      setBrowserSupabase(client);
    } catch (e) {
      console.error("Failed to initialize Supabase browser client in SessionContext:", e);
      // If client initialization fails, ensure loading state is resolved
      if (isMounted.current) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
      return; // Stop further execution if client is not available
    }

    // Only proceed if browserSupabase is successfully initialized
    if (!browserSupabase) return;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await browserSupabase.auth.getSession()
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

    const { data: { subscription } } = browserSupabase.auth.onAuthStateChange(
      (event, session) => {
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
  }, [browserSupabase]) // Dependency on browserSupabase to re-run effect when client is ready

  return state
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading } = useAuthSubscription()
  const [providerSupabaseClient, setProviderSupabaseClient] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    try {
      setProviderSupabaseClient(getSupabaseBrowserClient());
    } catch (e) {
      console.error("Failed to initialize Supabase client in SessionProvider:", e);
    }
  }, []);

  const signOutRef = useRef<SessionContextType['signOut']>(async () => {
    if (!providerSupabaseClient) {
      console.error("Supabase client not available for signOut.");
      throw new Error("Supabase client not available.");
    }
    try {
      const { error } = await providerSupabaseClient.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  })

  const contextValue = useMemo<SessionContextType>(
    () => ({
      session,
      user,
      isLoading,
      signOut: signOutRef.current,
      supabase: providerSupabaseClient, // Provide the supabase client here
    }),
    [session, user, isLoading, providerSupabaseClient]
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