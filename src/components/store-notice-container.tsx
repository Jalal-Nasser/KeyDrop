import { createSupabaseServerClient } from "@/lib/supabaseServer";
import dynamic from "next/dynamic";

const StoreNoticeClient = dynamic(() => import("./store-notice-client"), { ssr: false });

export async function StoreNoticeContainer() {
  const supabase = createSupabaseServerClient();
  const { data: notice } = await supabase
    .from("store_notices")
    .select("content, is_active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!notice || !notice.is_active || !notice.content) {
    return null;
  }

  return <StoreNoticeClient content={notice.content} />;
}