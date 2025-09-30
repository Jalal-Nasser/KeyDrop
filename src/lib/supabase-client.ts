"use client";

import { Database } from "@/types/supabase-fixed";
import { getSupabaseBrowserClient } from "@/integrations/supabase/client";

// Create a single supabase client for the browser
const supabase = getSupabaseBrowserClient();

export default supabase;
