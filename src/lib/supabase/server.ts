'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase-wrapper';

// Create a type that matches the expected return type of createServerComponentClient
type SupabaseClient = ReturnType<typeof createServerComponentClient<Database>>;
type AdminClient = ReturnType<typeof createClient<Database>>;

// Cache for the server client
let serverClient: SupabaseClient | null = null;
let adminClient: AdminClient | null = null;

/**
 * Get or create a server-side Supabase client for the current request
 * This is safe to use in Server Components, Server Actions, and Route Handlers
 */
export async function createServerClient() {
  // Always create a new client for each request to ensure fresh cookies
  // This is the recommended pattern for `createServerComponentClient`
  return createServerComponentClient<Database>({ 
    cookies: () => cookies() 
  });
}

/**
 * Get or create an admin Supabase client with service role key
 * Only use this in Server Components, Server Actions, and Route Handlers
 * that require elevated permissions
 */
export async function createAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  return adminClient;
}