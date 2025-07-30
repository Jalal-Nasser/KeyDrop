"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import parse from "html-react-parser";

interface StoreNoticeClientProps {
  content: string;
}

const StoreNoticeClientInner: React.FC<StoreNoticeClientProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-green-600 py-2 text-center text-sm text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-2">
          <span className="flex-shrink-0">📋</span>
          <div className="prose prose-sm prose-invert">{parse(content)}</div>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 transform text-white hover:text-gray-200"
        aria-label="Close notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default StoreNoticeClientInner;