"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from 'uuid';

interface CouponData {
  code: string;
  discount_percent: number;
  assigned_user_id: string | null;
  is_applied: boolean;
}

export async function createCoupon(formData: CouponData) {
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.from("coupons").insert([formData]);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function updateCoupon(id: string, formData: CouponData) {
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.from("coupons").update(formData).eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function deleteCoupon(id: string) {
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/coupons");
  return { error: null };
}

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