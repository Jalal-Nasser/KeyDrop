"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/integrations/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase-fixed";

export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  
  useEffect(() => {
    // This code only runs on the client after mount
    if (!client) { // Only initialize if not already done
      try {
        const browserClient = getSupabaseBrowserClient();
        setClient(browserClient);
      } catch (e) {
        console.error("Failed to initialize Supabase browser client on mount:", e);
        // Optionally, set an error state or a dummy client here
      }
    }
  }, [client]); // Dependency on client to prevent re-initialization

  return client;
}