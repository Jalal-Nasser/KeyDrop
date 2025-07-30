"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

interface Setting {
  key: string;
  value: string;
}

export async function updateSiteSettings(settings: Setting[]) {
  const supabase = createServerActionClient({ cookies });

  // Admin check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single();
  if (!profile?.is_admin) return { error: "Forbidden" };

  const updates = settings.map(setting => 
    supabase.from("site_settings").update({ value: setting.value }).eq("key", setting.key)
  );

  const results = await Promise.all(updates);
  const errorResult = results.find(res => res.error);

  if (errorResult?.error) {
    console.error("Error updating site settings:", errorResult.error);
    return { error: errorResult.error.message };
  }

  revalidatePath("/", "layout"); // Revalidate the entire site layout
  return { error: null };
}