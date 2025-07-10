"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

export function StoreNotice() {
  const [isVisible, setIsVisible] = useState(true);
  const [noticeContent, setNoticeContent] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchNotice = async () => {
      const { data, error } = await supabase
        .from("store_notices")
        .select("content, is_active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching store notice:", error);
        setNoticeContent("Error loading notice.");
        setIsVisible(true); // Keep visible to show error
      } else if (data && data.is_active) {
        setNoticeContent(data.content);
        setIsVisible(true);
      } else {
        setNoticeContent(null);
        setIsVisible(false);
      }
    };

    fetchNotice();
  }, [supabase]);

  if (!isVisible || !noticeContent) {
    return null;
  }

  return (
    <div className="relative py-2 text-center text-sm text-white" style={{ backgroundColor: "#28a645" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center flex-wrap">
          <span className="mr-2">📋</span>
          <span className="text-wrap" dangerouslySetInnerHTML={{ __html: noticeContent }} />
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
        aria-label="Close notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}