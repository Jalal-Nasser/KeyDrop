"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/integrations/supabase/client";

const supabase = getSupabaseBrowserClient();

export function useSupabase() {
  const [client, setClient] = useState(supabase);
  
  // This ensures we always return the same instance
  useEffect(() => {
    setClient(supabase);
  }, []);
  
  return client;
}
