"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from 'uuid';

interface CouponData {
  code: string;
  discount_percent: number;
  assigned_user_id?: string | null;
  is_applied: boolean;
}

export async function createCoupon(formData: CouponData) {
  const supabase = createServerActionClient({ cookies });
  console.log("Attempting to create coupon with data:", formData); // Added log
  const { error } = await supabase.from("coupons").insert([formData]);
  if (error) {
    console.error("Error creating coupon:", error); // Added log
    return { error: error.message };
  }
  console.log("Coupon created successfully."); // Added log
  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function updateCoupon(id: string, formData: CouponData) {
  const supabase = createServerActionClient({ cookies });
  console.log(`Attempting to update coupon ${id} with data:`, formData); // Added log
  const { error } = await supabase.from("coupons").update(formData).eq("id", id);
  if (error) {
    console.error(`Error updating coupon ${id}:`, error); // Added log
    return { error: error.message };
  }
  console.log(`Coupon ${id} updated successfully.`); // Added log
  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function deleteCoupon(id: string) {
  const supabase = createServerActionClient({ cookies });
  console.log(`Attempting to delete coupon with ID: ${id}`); // Added log
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) {
    console.error(`Error deleting coupon ${id}:`, error); // Added log
    return { error: error.message };
  }
  console.log(`Coupon ${id} deleted successfully.`); // Added log
  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function fetchUsersForAssignment() {
  const supabase = createServerActionClient({ cookies });
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .order("id", { ascending: false }); // Changed from 'created_at' to 'id'

  if (error) {
    console.error("Error fetching users:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}