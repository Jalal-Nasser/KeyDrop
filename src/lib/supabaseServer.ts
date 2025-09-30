import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase-wrapper';

// Re-export from the correct location
export { createAdminClient } from './supabase/server';

export function createSupabaseServerClient() {
  return createServerComponentClient<Database>({ 
    cookies: () => cookies() 
  });
}
