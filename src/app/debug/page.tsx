"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/context/session-context"
import { getSupabaseBrowserClient } from "@/integrations/supabase/client"
import { createDirectSupabaseClient } from "@/lib/supabase-safe-client"
import { getPublicEnv } from "@/lib/public-env"

export default function DebugPage() {
  const { session, supabase, isLoading } = useSession()
  const [directClient, setDirectClient] = useState<any>(null)
  const [legacyClient, setLegacyClient] = useState<any>(null)
  const [publicEnv, setPublicEnv] = useState<any>(null)
  const [healthcheck, setHealthcheck] = useState<{[key: string]: any}>({})
  const [windowEnv, setWindowEnv] = useState<any>(null)
  
  useEffect(() => {
    // Get window.__PUBLIC_ENV
    if (typeof window !== 'undefined') {
      setWindowEnv((window as any).__PUBLIC_ENV || {})
    }
    
    // Get publicEnv from utility
    const env = getPublicEnv(); // Call directly, it's synchronous
    setPublicEnv(env);
    
    // Create direct client
    try {
      const direct = createDirectSupabaseClient()
      setDirectClient({
        initialized: !!direct,
        // Can't access supabaseUrl directly as it's protected
        url: "Initialized successfully",
      })
      
      // Test health
      direct?.functions.invoke('healthcheck')
        .then((result: any) => {
          setHealthcheck(prev => ({...prev, direct: result}))
        })
        .catch((err: any) => {
          setHealthcheck(prev => ({...prev, direct: {error: err.message}}))
        })
    } catch (e) {
      setDirectClient({ error: (e as Error).message })
    }
    
    // Create legacy client
    try {
      const legacy = getSupabaseBrowserClient()
      setLegacyClient({
        initialized: !!legacy,
        // Can't access supabaseUrl directly as it's protected
        url: "Initialized successfully",
      })
      
      // Test health
      legacy?.functions.invoke('healthcheck')
        .then((result: any) => {
          setHealthcheck(prev => ({...prev, legacy: result}))
        })
        .catch((err: any) => {
          setHealthcheck(prev => ({...prev, legacy: {error: err.message}}))
        })
    } catch (e) {
      setLegacyClient({ error: (e as Error).message })
    }
    
    // Test session client
    if (supabase) {
      supabase?.functions.invoke('healthcheck')
        .then((result: any) => {
          setHealthcheck(prev => ({...prev, session: result}))
        })
        .catch((err: any) => {
          setHealthcheck(prev => ({...prev, session: {error: err.message}}))
        })
    }
  }, [supabase])
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Session Provider Client</h2>
          <div className="space-y-2">
            <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Session:</strong> {session ? 'Authenticated' : 'Not authenticated'}</p>
            <p><strong>Supabase Client:</strong> {supabase ? 'Initialized' : 'Not initialized'}</p>
            <p><strong>URL:</strong> {supabase ? "Initialized successfully" : 'N/A'}</p>
            <p><strong>Health Check:</strong> {healthcheck.session ? 
              JSON.stringify(healthcheck.session, null, 2) : 'Pending...'}</p>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Direct Client</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {directClient ? 'Created' : 'Not created'}</p>
            <p><strong>Details:</strong> {directClient ? JSON.stringify(directClient, null, 2) : 'N/A'}</p>
            <p><strong>Health Check:</strong> {healthcheck.direct ? 
              JSON.stringify(healthcheck.direct, null, 2) : 'Pending...'}</p>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Legacy Client</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {legacyClient ? 'Created' : 'Not created'}</p>
            <p><strong>Details:</strong> {legacyClient ? JSON.stringify(legacyClient, null, 2) : 'N/A'}</p>
            <p><strong>Health Check:</strong> {healthcheck.legacy ? 
              JSON.stringify(healthcheck.legacy, null, 2) : 'Pending...'}</p>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <div className="space-y-2">
            <p><strong>window.__PUBLIC_ENV:</strong></p>
            <pre className="bg-muted p-2 rounded text-sm overflow-auto">
              {JSON.stringify(windowEnv, null, 2) || 'Not available'}
            </pre>
            
            <p><strong>getPublicEnv() Result:</strong></p>
            <pre className="bg-muted p-2 rounded text-sm overflow-auto">
              {JSON.stringify(publicEnv, null, 2) || 'Not available'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}