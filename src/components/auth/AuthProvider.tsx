'use client'

import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client' // Use the new centralized client

type AuthContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setSession(null)
      setUser(null)
      
      // Refresh the page to update server components
      router.refresh()
      
      // Redirect to home page after sign out
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [router])

  useEffect(() => {
    let mounted = true
    
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    
    getInitialSession()
    
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, currentSession: Session | null) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event)
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      
      // Force a refresh of the page to update server components
      if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
        router.refresh()
      }
    })
    
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [router])

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}