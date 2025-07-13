"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

interface StoreNoticeData {
  id?: string; // Optional for insert, required for update
  content: string;
  is_active: boolean;
}

export async function getStoreNotice() {
  const supabase = createServerActionClient({ cookies });
  const { data, error } = await supabase
    .from("store_notices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("Error fetching store notice:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateOrCreateStoreNotice(formData: StoreNoticeData) {
  const supabase = createServerActionClient({ cookies });
  let result;

  if (formData.id) {
    // Update existing notice
    result = await supabase
      .from("store_notices")
      .update({ content: formData.content, is_active: formData.is_active })
      .eq("id", formData.id);
  } else {
    // Create new notice
    result = await supabase
      .from("store_notices")
      .insert({ content: formData.content, is_active: formData.is_active });
  }

  if (result.error) {
    console.error("Error saving store notice:", result.error);
    return { error: result.error.message };
  }

  revalidatePath("/admin/store-notice");
  revalidatePath("/"); // Revalidate homepage to update the notice
  return { error: null };
}