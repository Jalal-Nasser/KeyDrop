import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-wrapper';

// This is a server-only utility for admin operations
// It should only be used in Server Components, Server Actions, or Route Handlers

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get an admin client with service role key
 * Only use this in server-side code that requires elevated permissions
 */
export function getAdminClient() {
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

/**
 * Use this for server-side operations that require admin privileges
 */
export async function withAdmin<T>(
  operation: (client: ReturnType<typeof getAdminClient>) => Promise<T>
): Promise<T> {
  const client = getAdminClient();
  return operation(client);
}
