"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from 'uuid';

function generateCouponCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

interface CreateCouponData {
  discount_percent: number;
  assigned_user_id?: string | null;
}

export async function createCoupon(_: any, formData: CreateCouponData) {
  const supabase = createServerActionClient({ cookies });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", (await supabase.auth.getSession()).data.session?.user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return { error: "Unauthorized: Only admins can create coupons." };
  }

  let code = generateCouponCode();
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    const { count } = await supabase
      .from('coupons')
      .select('id', { count: 'exact', head: true })
      .eq('code', code);

    if (count === 0) {
      isUnique = true;
    } else {
      code = generateCouponCode();
      attempts++;
    }
  }

  if (!isUnique) {
    return { error: "Failed to generate a unique coupon code after multiple attempts. Please try again." };
  }

  const { error } = await supabase.from("coupons").insert({
    code,
    discount_percent: formData.discount_percent,
    assigned_user_id: formData.assigned_user_id || null,
    is_applied: false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/coupons");
  return { error: null };
}

// ... rest of the actions remain the same ...