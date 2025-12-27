import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase-fixed';
import type { Session } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const createSupabaseClient = () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // In dev environment or build time, we might not want to throw
        if (typeof window === 'undefined') {
            console.warn('Missing Supabase environment variables');
        }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Removed custom 'cookies' object to let createBrowserClient handle it by default
    return createBrowserClient<Database>(
        supabaseUrl || '',
        supabaseKey || ''
    );
};

// Create a single supabase client for interacting with your database
export const supabase = createSupabaseClient();

// Log auth state changes for debugging
if (typeof window !== 'undefined') {
    supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session);
    });
}
