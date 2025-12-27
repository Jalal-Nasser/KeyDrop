"use client"; // This component needs to be a Client Component to use useState

import { useState } from "react";
import { X } from "lucide-react";

export function StoreNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null; // Don't render the component if it's not visible
  }

  return (
    <div className="relative py-2 text-center text-sm text-white" style={{ backgroundColor: "#ff7300" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center flex-wrap"> {/* Added flex-wrap */}
          <span className="mr-2">📋</span>
          <span className="text-wrap">Start order without waiting approval</span> {/* Added text-wrap */}
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)} // Set isVisible to false when clicked
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
        aria-label="Close notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}