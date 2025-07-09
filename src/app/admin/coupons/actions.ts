"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from 'uuid';

// ... existing code ...

export async function fetchUsersForAssignment() {
  const supabase = createServerActionClient({ cookies });
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// ... rest of the actions remain the same ...