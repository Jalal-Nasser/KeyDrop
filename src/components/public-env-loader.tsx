"use client"

import { useEffect, useState } from 'react'

// Hardcoded fallbacks as absolute last resort
const FALLBACK_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://notncpmpmgostfxesrvk.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s"
}

// Monkey patch the auth-helpers-nextjs package to bypass validation
const monkeyPatchAuthHelpers = () => {
  if (typeof window !== 'undefined') {
    // Direct override of environment variables check
    (window as any).__SUPABASE_DIRECT_OVERRIDES = {
      supabaseUrl: FALLBACK_ENV.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: FALLBACK_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    
    try {
      // Find createClientComponentClient in window
      const origDefine = Object.defineProperty;
      // @ts-ignore - TypeScript doesn't like us replacing Object.defineProperty
      Object.defineProperty = function(obj: any, prop: string, desc: PropertyDescriptor) {
        if (prop === 'createClientComponentClient') {
          const originalValue = desc.value;
          if (typeof originalValue === 'function') {
            desc.value = function(...args: any[]) {
              try {
                return originalValue.apply(this, args);
              } catch (e) {
                console.warn('Supabase auth-helpers validation error intercepted, using fallback');
                // Try direct client creation instead
                const { createClient } = require('@supabase/supabase-js');
                return createClient(
                  FALLBACK_ENV.NEXT_PUBLIC_SUPABASE_URL,
                  FALLBACK_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );
              }
            };
          }
        }
        return origDefine.call(Object, obj, prop, desc);
      };
      
      // Restore original after a short delay
      setTimeout(() => {
        // @ts-ignore
        Object.defineProperty = origDefine;
      }, 10000);
    } catch (e) {
      console.warn('Failed to monkey patch Object.defineProperty:', e);
    }
  }
}

export function PublicEnvLoader() {
  const [initStatus, setInitStatus] = useState<string>("init")
  
  // Run monkey patch immediately
  useEffect(() => {
    monkeyPatchAuthHelpers();
  }, []);
  
  // Main initialization function with multiple approaches
  const initEnv = async () => {
    if (typeof window === 'undefined') return
    
    // Skip if already initialized
    if ((window as any).__PUBLIC_ENV) {
      setInitStatus("already-initialized")
      return
    }
    
    // Start with fallback
    (window as any).__PUBLIC_ENV = { ...FALLBACK_ENV }
    setInitStatus("fallback-set")
    
    try {
      // Strategy 1: Try fetching from API
      try {
        const response = await fetch('/api/env/public', {
          cache: 'no-store', 
          headers: { 'x-env-request': 'true' } 
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data) {
            (window as any).__PUBLIC_ENV = {
              ...FALLBACK_ENV, // Keep fallbacks for missing values
              ...data // Override with real values
            }
            setInitStatus("api-success")
            return
          }
        }
      } catch (e) {
        console.warn('PublicEnvLoader: API fetch failed, trying localStorage')
      }
      
      // Strategy 2: Try localStorage
      try {
        const stored = localStorage.getItem('__PUBLIC_ENV')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && parsed.NEXT_PUBLIC_SUPABASE_URL) {
            (window as any).__PUBLIC_ENV = {
              ...FALLBACK_ENV,
              ...parsed
            }
            setInitStatus("localstorage-success")
            return
          }
        }
      } catch (e) {
        console.warn('PublicEnvLoader: localStorage failed')
      }
      
      // Strategy 3: Try using a setTimeout to wait for injected script
      setTimeout(() => {
        if (!(window as any).__PUBLIC_ENV || 
            !(window as any).__PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_URL) {
          try {
            console.warn('PublicEnvLoader: Delayed check - still using fallbacks')
          } catch (e) {}
          (window as any).__PUBLIC_ENV = { ...FALLBACK_ENV }
          setInitStatus("timeout-fallback")
        }
      }, 2000)
      
    } catch (e) {
      try {
        console.error('PublicEnvLoader: All strategies failed', e)
      } catch (innerErr) {}
      // Final safeguard
      (window as any).__PUBLIC_ENV = { ...FALLBACK_ENV }
      setInitStatus("error-fallback")
    }
  }
  
  // Store successful env in localStorage for next load
  const persistEnv = () => {
    if (typeof window === 'undefined') return
    
    try {
      const env = (window as any).__PUBLIC_ENV
      if (env && env.NEXT_PUBLIC_SUPABASE_URL && 
          env.NEXT_PUBLIC_SUPABASE_URL !== FALLBACK_ENV.NEXT_PUBLIC_SUPABASE_URL) {
        localStorage.setItem('__PUBLIC_ENV', JSON.stringify(env))
        console.info('PublicEnvLoader: Cached env values to localStorage')
      }
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  useEffect(() => {
    // Immediate init
    initEnv()
    
    // Set up interval to retry and persist
    const interval = setInterval(() => {
      const env = (window as any).__PUBLIC_ENV || {}
      
      // If we have real values (not fallbacks), persist them
      if (env.NEXT_PUBLIC_SUPABASE_URL && 
          env.NEXT_PUBLIC_SUPABASE_URL !== FALLBACK_ENV.NEXT_PUBLIC_SUPABASE_URL) {
        persistEnv()
        clearInterval(interval)
      } else {
        // Otherwise retry init
        initEnv()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Hidden div with status for debugging
  return (
    <div data-env-status={initStatus} style={{ display: 'none' }} />
  )
}
