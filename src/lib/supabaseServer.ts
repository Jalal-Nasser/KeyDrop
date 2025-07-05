import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const createSupabaseServerClient = () => {
  // Ensure these environment variables are set in your .env.local file
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerComponentClient({
    cookies: () => cookies(),
  }, {
    supabaseUrl: supabaseUrl,
    supabaseKey: supabaseKey,
  });
};