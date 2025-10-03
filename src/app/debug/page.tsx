"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/context/session-context"
import { supabase as browserSupabaseClient } from "@/integrations/supabase/client" // Import the new centralized client
import { createDirectSupabaseClient } from "@/lib/supabase-safe-client"
import { getPublicEnv } from "@/lib/public-env"

export default function DebugPage() {
  const { session, supabase, isLoading } = useSession()
  const [directClientStatus, setDirectClientStatus] = useState<any>(null)
  const [legacyClientStatus, setLegacyClientStatus] = useState<any>(null)
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
    
    // Create direct client (this is a special debug client, keep as is)
    try {
      const direct = createDirectSupabaseClient()
      setDirectClientStatus({
        initialized: !!direct,
        status: "Initialized successfully",
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
      setDirectClientStatus({ error: (e as Error).message })
    }
    
    // Use the new centralized browser client
    try {
      setLegacyClientStatus({ // Renaming this to reflect it's now the standard browser client
        initialized: !!browserSupabaseClient,
        status: "Initialized successfully",
      })
      
      // Test health
      browserSupabaseClient?.functions.invoke('healthcheck')
        .then((result: any) => {
          setHealthcheck(prev => ({...prev, legacy: result}))
        })
        .catch((err: any) => {
          setHealthcheck(prev => ({...prev, legacy: {error: err.message}}))
        })
    } catch (e) {
      setLegacyClientStatus({ error: (e as Error).message })
    }
    
    // Test session client (which is also the centralized browser client)
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
            <p><strong>Status:</strong> {supabase ? "Initialized successfully" : 'N/A'}</p>
            <p><strong>Health Check:</strong> {healthcheck.session ? 
              JSON.stringify(healthcheck.session, null, 2) : 'Pending...'}</p>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Direct Client (Debug)</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {directClientStatus ? 'Created' : 'Not created'}</p>
            <p><strong>Details:</strong> {directClientStatus ? JSON.stringify(directClientStatus, null, 2) : 'N/A'}</p>
            <p><strong>Health Check:</strong> {healthcheck.direct ? 
              JSON.stringify(healthcheck.direct, null, 2) : 'Pending...'}</p>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Standard Browser Client</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {legacyClientStatus ? 'Created' : 'Not created'}</p>
            <p><strong>Details:</strong> {legacyClientStatus ? JSON.stringify(legacyClientStatus, null, 2) : 'N/A'}</p>
            <p><strong>Health Check:</strong> {healthcheck.legacy ? 
              JSON.stringify(healthcheck.legacy, null, 2) : 'Pending...'}</p>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Public Environment Variables</h2>
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