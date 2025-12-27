"use client"

import React, { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]"> {/* Adjust min-height based on header/footer */}
      {/* Mobile menu toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden" // Position fixed for mobile
      >
        <Menu className="h-6 w-6" />
      </Button>

      <AdminSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      <div className="flex-1 p-8 overflow-auto">
        {children}
      </div>
    </div>
  )
}