"use client"

import React from "react"
import { AdminSidebar } from "./admin-sidebar"

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]"> {/* Adjust min-height based on header/footer */}
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        {children}
      </div>
    </div>
  )
}