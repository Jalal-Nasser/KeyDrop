"use client"

import { useState, ReactNode } from "react"
import { Menu, X } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminLayoutClientProps {
  children: ReactNode
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Admin Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 p-4 md:p-8 bg-muted/40 transition-all duration-300",
        "lg:ml-64", // Desktop: margin for sidebar
        isSidebarOpen ? "ml-64 lg:ml-64" : "ml-0 lg:ml-0" // Adjust margin based on mobile sidebar state
      )}>
        {children}
      </main>
    </div>
  )
}