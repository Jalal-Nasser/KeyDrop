// This is a utility file that fixes the TypeScript issues with the generated Supabase types
// It re-exports the Database type from a simplified version that doesn't cause compiler errors

import { Database as OriginalDatabase } from './supabase-fixed';

// Re-export the fixed type
export type Database = OriginalDatabase;

// Export anything else that might be needed
export type { Json } from './supabase-fixed';
