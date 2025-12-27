// Re-export all Supabase client utilities from a single entry point
export * from './client';
export * from './server';
export * from './admin';

// Types
export type { Database } from '@/types/supabase-wrapper';

// Helpers
// export * from '@supabase/auth-helpers-nextjs'; // Deprecated, migrated to @supabase/ssr

export {
  // Common types
  type User,
  type Session,
  type AuthError,
  type AuthResponse,
  type SignInWithPasswordlessCredentials,
  type SignInWithOAuthCredentials,
  type SignInWithPasswordCredentials,
  type SignUpWithPasswordCredentials,
  // And any other types you need to expose
} from '@supabase/supabase-js';
